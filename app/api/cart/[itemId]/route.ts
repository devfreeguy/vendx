import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { itemId } = await params;

  try {
    // Verify ownership via cart
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.userId) {
      return createErrorResponse(
        "Item not found or forbidden",
        404,
        "NOT_FOUND",
      );
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
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

  const { itemId } = await params;

  try {
    const body = await req.json();
    const quantity = parseInt(body.quantity);

    if (isNaN(quantity) || quantity < 1) {
      return createErrorResponse("Invalid quantity", 400, "VALIDATION_ERROR");
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== session.userId) {
      return createErrorResponse(
        "Item not found or forbidden",
        404,
        "NOT_FOUND",
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
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
