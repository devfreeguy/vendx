import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { syncCartSchema } from "@/lib/schemas";

// Extend schema locally if syncId not in core schema yet
const idempotentSyncSchema = syncCartSchema.extend({
  syncId: z.string().optional(),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await req.json();
    const { items, syncId } = idempotentSyncSchema.parse(body);
    const userId = session.userId as string;

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Idempotency check
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (syncId && user?.lastCartSyncId === syncId) {
          return tx.cart.findUnique({
            where: { userId },
            include: {
              items: {
                include: { product: true },
              },
            },
          });
        }

        // 2. Fetch or create cart
        let cart = await tx.cart.findUnique({
          where: { userId },
          include: { items: true },
        });

        if (!cart) {
          cart = await tx.cart.create({
            data: {
              id: nanoid(),
              userId,
            },
            include: { items: true },
          });
        }

        // 3. Merge logic
        for (const guestItem of items) {
          const product = await tx.product.findUnique({
            where: { id: guestItem.productId },
          });

          if (!product) continue;

          const existingItem = cart.items.find(
            (item) => item.productId === guestItem.productId,
          );

          if (existingItem) {
            // Item already exists - just keep the existing quantity
            // Don't add or use Math.max, as this sync likely already happened
            await tx.cartItem.update({
              where: {
                cartId_productId: {
                  cartId: cart.id,
                  productId: guestItem.productId,
                },
              },
              data: {
                quantity: existingItem.quantity, // Keep existing, don't merge
              },
            });
          } else {
            // New item - add it
            await tx.cartItem.create({
              data: {
                id: nanoid(),
                cartId: cart.id,
                productId: guestItem.productId,
                quantity: guestItem.quantity,
              },
            });
          }
        }

        // 4. Update idempotency key
        if (syncId) {
          await tx.user.update({
            where: { id: userId },
            data: { lastCartSyncId: syncId },
          });
        }

        // 5. Return final cart state
        return tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    vendor: {
                      select: { id: true, name: true, email: true },
                    },
                  },
                },
              },
            },
          },
        });
      },
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/cart/sync error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
