import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse("Forbidden", 403, "FORBIDDEN");
  }

  const { id } = await params; // Order ID

  try {
    // We want to mark items (owned by this vendor) in this order as SHIPPED.
    // The simplified requirement says "Mark items as shipped/done".
    // We can update all items for this vendor in this order.

    // 1. Verify availability and ownership
    const startOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          where: { product: { vendorId: session.userId as string } },
        },
      },
    });

    if (!startOrder || startOrder.items.length === 0) {
      return createErrorResponse("Order not found", 404, "NOT_FOUND");
    }

    // 2. Update items
    await prisma.orderItem.updateMany({
      where: {
        orderId: id,
        product: {
          vendorId: session.userId as string,
        },
      },
      data: {
        status: "SHIPPED",
      },
    });

    // 3. Check if ALL items in the order are now SHIPPED.
    const fullOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (fullOrder) {
      const allShipped = fullOrder.items.every(
        (item) => item.status === "SHIPPED",
      );
      if (allShipped && fullOrder.status === "PAID") {
        // Only complete if paid? Or maybe independent.
        await prisma.order.update({
          where: { id },
          data: { status: "COMPLETED" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/vendor/orders/[id]/fulfill error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
