import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse("Forbidden", 403, "FORBIDDEN");
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          where: {
            product: {
              vendorId: session.userId as string,
            },
          },
          include: {
            product: { select: { title: true, price: true } },
          },
        },
        buyer: { select: { email: true } },
      },
    });

    if (!order) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    if (order.items.length === 0) {
      return createErrorResponse(
        "Order not found or access denied",
        404,
        "NOT_FOUND",
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/vendor/orders/[id] error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
