import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createErrorResponse } from "@/lib/api-error";
import { addToCartSchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId as string },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discountPrice: true,
                stock: true,
                images: true,
                vendor: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ success: true, data: { items: [] } });
    }

    return NextResponse.json({ success: true, data: cart });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const body = await req.json();
    const { productId, quantity } = addToCartSchema.parse(body);

    // Ensure product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return createErrorResponse("Product not found", 404, "NOT_FOUND");
    }

    // Find or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.userId as string },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          id: nanoid(),
          userId: session.userId as string,
        },
      });
    }

    // Upsert Cart Item
    // Upsert Cart Item - Automatic atomic handling via Unique Constraint
    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        id: nanoid(),
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return createErrorResponse(
        `Validation failed: ${fieldErrors.join(", ")}`,
        400,
        "VALIDATION_ERROR",
      );
    }
    console.error("POST /api/cart error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
