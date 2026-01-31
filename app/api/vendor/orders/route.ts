import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const vendorId = session.userId as string;

    // Fetch orders containing products from this vendor
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { vendorId },
          },
        },
      },
      include: {
        buyer: {
          select: { name: true, email: true },
        },
        items: {
          where: {
            product: { vendorId }, // Only include items belonging to this vendor
          },
          include: {
            product: {
              select: { title: true, images: true, id: true, sku: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate vendor-specific totals for each order
    const formattedOrders = orders.map((order) => {
      const vendorTotal = order.items.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0,
      );
      return {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt,
        customer: order.buyer.name || order.buyer.email,
        customerEmail: order.buyer.email,
        itemsCount: order.items.length,
        total: vendorTotal, // This is the Vendor's share of the order
        items: order.items.map((item) => ({
          id: item.id,
          title: item.product.title,
          quantity: item.quantity,
          price: item.priceAtPurchase,
          image: item.product.images[0] || "",
          sku: item.product.sku,
        })),
      };
    });

    return NextResponse.json({ success: true, data: formattedOrders });
  } catch (error) {
    console.error("GET /api/vendor/orders error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
