// app/api/orders/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";
import { BchMonitorServiceAPI } from "@/lib/bch/monitor-api";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { title: true, vendorId: true } },
          },
        },
      },
    });

    if (!order) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    if (session.role !== "ADMIN" && order.buyerId !== session.userId) {
      return createErrorResponse("Forbidden", 403, "FORBIDDEN");
    }

    // ONLY check blockchain if status is PENDING
    if (order.status === "PENDING" && order.bchAddress) {
      const monitor = new BchMonitorServiceAPI();

      try {
        // Strict 12-second timeout for the entire check
        await Promise.race([
          (async () => {
            await monitor.checkAddressForTransactions(
              order.bchAddress,
              order.id,
            );
            await monitor.checkConfirmations(order.id);
          })(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Payment check timeout")), 12000),
          ),
        ]);
      } catch (err: any) {
        // Log but don't fail the request
        console.error("⚠️ Payment monitoring error:", err.message);
      } finally {
        // Always disconnect
        try {
          await monitor.disconnect();
        } catch (disconnectErr) {
          console.error("Disconnect error:", disconnectErr);
        }
      }
    }

    // Reload order to get potentially updated status
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { title: true, vendorId: true } },
          },
        },
        transactions: {
          select: {
            status: true,
            type: true,
          },
        },
      },
    });

    if (!updatedOrder) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    // Lazy Expiration Check
    if (
      updatedOrder.status === "PENDING" &&
      new Date() > new Date(updatedOrder.rateExpiresAt)
    ) {
      const tx = await prisma.transaction.findFirst({
        where: { orderId: updatedOrder.id },
      });

      if (!tx) {
        const expiredOrder = await prisma.order.update({
          where: { id: updatedOrder.id },
          data: { status: "EXPIRED" },
          include: {
            items: {
              include: {
                product: { select: { title: true, vendorId: true } },
              },
            },
          },
        });
        return NextResponse.json({ success: true, data: expiredOrder });
      }
    }

    const paymentDetected = updatedOrder.transactions.some(
      (t) => t.type === "PAYMENT" && t.status === "PENDING",
    );

    return NextResponse.json({
      success: true,
      data: { ...updatedOrder, paymentDetected },
    });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
