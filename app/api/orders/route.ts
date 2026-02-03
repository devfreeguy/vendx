import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createErrorResponse } from "@/lib/api-error";
import { createOrderSchema } from "@/lib/schemas";
import { calculateBchAmount } from "@/lib/bch/quote";
import { deriveAddress } from "@/lib/bch/wallet";
import { sendOrderConfirmationEmail } from "@/lib/email/email-service";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return createErrorResponse(
      "Forbidden: Only buyers can create orders",
      403,
      "FORBIDDEN",
    );
  }

  try {
    const body = await req.json();
    const { items, shippingAddress } = createOrderSchema.parse(body);

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));
    let totalAmount = 0;

    // Validate stock and calculate total
    for (const item of items) {
      const product = productsMap.get(item.productId);
      if (!product) {
        return createErrorResponse(
          `Product ${item.productId} not found`,
          400,
          "VALIDATION_ERROR",
        );
      }
      if (product.stock < item.quantity) {
        return createErrorResponse(
          `Insufficient stock for ${product.title}`,
          400,
          "INSUFFICIENT_STOCK",
        );
      }
      const price = product.discountPrice ?? product.price;
      totalAmount += price * item.quantity;
    }

    // Calculate real BCH quote
    const { bchAmount, exchangeRate, rateExpiresAt } =
      await calculateBchAmount(totalAmount);

    // Atomic transaction: Decrement stock and Create Order
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Create Order with placeholder address initially
      // We need to create it to get the auto-incremented derivationIndex (if DB generated)
      // or we just let it create and then use the index.
      // NOTE: @default(autoincrement()) relies on the DB.
      // We create with a temporary unique address since it is @unique.
      const tempId = nanoid();

      const createdOrder = await tx.order.create({
        data: {
          id: tempId,
          buyerId: session.userId as string,
          totalAmount,
          usdAmount: totalAmount,
          bchAmount,
          exchangeRate,
          rateExpiresAt,
          bchAddress: `TEMP-${tempId}`, // Placeholder, must be unique
          shippingAddress: shippingAddress as any,
          status: "PENDING",
          items: {
            create: items.map((item) => {
              const product = productsMap.get(item.productId)!;
              return {
                id: nanoid(),
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: product.discountPrice ?? product.price,
              };
            }),
          },
        },
      });

      // Now derive the real address using the generated derivationIndex
      const address = deriveAddress(createdOrder.derivationIndex);

      // Update the order with the real address
      return await tx.order.update({
        where: { id: createdOrder.id },
        data: { bchAddress: address },
        include: { items: { include: { product: true } }, buyer: true },
      });
    });

    // Send order confirmation email (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vendx.store";
    const orderUrl = `${baseUrl}/orders/${order.id}`;

    sendOrderConfirmationEmail({
      orderId: order.id,
      buyerName: order.buyer.name || "there",
      buyerEmail: order.buyer.email,
      items: order.items.map((item) => ({
        title: item.product.title,
        quantity: item.quantity,
        price: item.priceAtPurchase,
        image: item.product.images[0],
      })),
      totalAmount: order.totalAmount,
      bchAmount: order.bchAmount,
      bchAddress: order.bchAddress,
      orderUrl,
      expiresAt: order.rateExpiresAt.toISOString(),
    }).catch((error: any) => {
      console.error("Failed to send order confirmation email:", error);
      // Don't fail order creation if email fails
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
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
    console.error("POST /api/orders error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "BUYER") {
    return createErrorResponse("Forbidden", 403, "FORBIDDEN");
  }

  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: session.userId as string },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
