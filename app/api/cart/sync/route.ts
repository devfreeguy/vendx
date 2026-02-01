import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { syncCartSchema } from "@/lib/schemas";

const idempotentSyncSchema = syncCartSchema.extend({
  syncId: z.string().optional(),
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

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (syncId && user?.lastCartSyncId === syncId) {
        return tx.cart.findUnique({
          where: { userId },
          include: {
            items: { include: { product: true } },
          },
        });
      }

      let cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { id: nanoid(), userId },
          include: { items: true },
        });
      }

      for (const guestItem of items) {
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
          update: { quantity: { increment: guestItem.quantity } },
          create: {
            id: nanoid(),
            cartId: cart.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
          },
        });
      }

      if (syncId) {
        await tx.user.update({
          where: { id: userId },
          data: { lastCartSyncId: syncId },
        });
      }

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
    });

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
