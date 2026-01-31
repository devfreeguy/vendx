import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

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

    // Lazy Expiration Check
    if (
      order.status === "PENDING" &&
      new Date() > new Date(order.rateExpiresAt)
    ) {
      // Check for pending transactions before expiring
      const tx = await prisma.transaction.findFirst({
        where: { orderId: order.id },
      });

      if (!tx) {
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: { status: "EXPIRED" },
          include: {
            items: {
              include: {
                product: { select: { title: true, vendorId: true } },
              },
            },
          },
        });
        return NextResponse.json({ success: true, data: updatedOrder });
      }
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
