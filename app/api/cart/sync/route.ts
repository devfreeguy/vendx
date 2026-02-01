import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { syncCartSchema } from "@/lib/schemas";

// Extend schema locally if syncId not in core schema yet, or assuming client sends it.
// Ideally usage: { items: [...], syncId: "..." }
const idempotentSyncSchema = syncCartSchema.extend({
  syncId: z.string().optional(), // Optional for backward compatibility, but required for idempotency
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await req.json();
    const { items, syncId } = idempotentSyncSchema.parse(body);
    const userId = session.userId as string;

    // Use transaction for atomicity and strict consistency
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Idempotency Check
        const user = await tx.user.findUnique({ where: { id: userId } });

        // If syncId is provided and matches, return current cart without merging
        if (syncId && user?.lastCartSyncId === syncId) {
          return await tx.cart.findUnique({
            where: { userId },
            include: {
              items: {
                include: { product: true },
              },
            },
          });
        }

        // 2. Fetch/Create Server Cart
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

        // 3. Merge Logic
        // Strategy: Additive Merge.
        // If item in server map -> add quantity.
        // If item new -> create.

        // We process items one by one. Optimally could batch finds, but loop is cleaner for logic.
        for (const guestItem of items) {
          // Validate product exists (optional but good for data integrity)
          const product = await tx.product.findUnique({
            where: { id: guestItem.productId },
          });
          if (!product) continue;

          await tx.cartItem.upsert({
            where: {
              cartId_productId: {
                cartId: cart.id,
                productId: guestItem.productId,
              },
            },
            update: {
              quantity: { increment: guestItem.quantity },
            },
            create: {
              id: nanoid(),
              cartId: cart.id,
              productId: guestItem.productId,
              quantity: guestItem.quantity,
            },
          });
        }

        // 4. Update Idempotency Key (Last Sync ID)
        if (syncId) {
          await tx.user.update({
            where: { id: userId },
            data: { lastCartSyncId: syncId },
          });
        }

        // 5. Return Final Cart State
        return await tx.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    vendor: { select: { id: true, name: true, email: true } },
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
