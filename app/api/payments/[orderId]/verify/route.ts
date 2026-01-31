import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    if (order.status === "PAID" || order.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        message: "Order already paid",
      });
    }

    let isPaymentDetected = false;

    try {
      const body = await req.json().catch(() => ({}));
      if (body.simulateSuccess) {
        isPaymentDetected = true;
      }
    } catch (e) {}

    if (isPaymentDetected) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });
      return NextResponse.json({ success: true, status: "PAID" });
    }

    return NextResponse.json({
      success: false,
      status: order.status,
      message:
        "Payment not detected yet. Send { simulateSuccess: true } to simulate.",
    });
  } catch (error) {
    console.error("POST /api/payments/[orderId]/verify error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
