import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { itemId: productId } = await params;

  try {
    // 1. Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId as string },
    });

    if (!cart) {
      return createErrorResponse("Cart not found", 404, "NOT_FOUND");
    }

    // 2. Find the item in the cart by productId
    // Note: We use findFirst because we are looking up by non-unique fields relative to global table,
    // effectively unique within the cart though.
    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (!item) {
      return createErrorResponse(
        "Item not found in cart (by product)",
        404,
        "NOT_FOUND",
      );
    }

    // 3. Delete it
    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cart/[itemId] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { itemId: productId } = await params;

  try {
    const body = await req.json();
    const quantity = parseInt(body.quantity);

    if (isNaN(quantity) || quantity < 1) {
      return createErrorResponse("Invalid quantity", 400, "VALIDATION_ERROR");
    }

    // 1. Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId as string },
    });

    if (!cart) {
      return createErrorResponse("Cart not found", 404, "NOT_FOUND");
    }

    // 2. Find the item
    const item = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
      },
    });

    if (!item) {
      return createErrorResponse(
        "Item not found in cart (by product)",
        404,
        "NOT_FOUND",
      );
    }

    // 3. Update
    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/cart/[itemId] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
