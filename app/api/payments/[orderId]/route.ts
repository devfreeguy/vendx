import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        bchAddress: true,
        bchAmount: true,
        totalAmount: true, // Fiat
        buyerId: true,
      },
    });

    if (!order) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    // Access check: Owner or Admin
    if (session.role !== "ADMIN" && order.buyerId !== session.userId) {
      return createErrorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const paymentInfo = {
      paid: order.status === "PAID" || order.status === "COMPLETED",
      status: order.status,
      address: order.bchAddress,
      amount: order.bchAmount,
      currency: "BCH",
    };

    return NextResponse.json({ success: true, data: paymentInfo });
  } catch (error) {
    console.error("GET /api/payments/[orderId] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
