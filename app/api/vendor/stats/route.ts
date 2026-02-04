import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createErrorResponse } from "@/lib/api-error";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "VENDOR") {
    return createErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  try {
    const vendorId = session.userId as string;

    // 1. Calculate Revenue (Sum of OrderItems for this vendor in PAID/COMPLETED orders)
    // Removed SHIPPED as it is not in OrderStatus enum
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: { vendorId },
        order: {
          status: { in: ["PAID", "COMPLETED"] },
        },
      },
      select: {
        priceAtPurchase: true,
        quantity: true,
        orderId: true,
        order: {
          select: { buyerId: true, createdAt: true },
        },
      },
    });

    const totalRevenue = orderItems.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    );
    const productsSold = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // 2. Active Orders (Pending fulfillment)
    // Paid orders
    const activeOrdersCount = await prisma.order.count({
      where: {
        status: "PAID",
        items: {
          some: {
            product: { vendorId },
          },
        },
      },
    });

    // 3. Active Customers
    const uniqueCustomers = new Set(
      orderItems.map((item) => item.order.buyerId),
    ).size;

    const stats = [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        trend: "+0%", // Todo: Implement historical comparison
        trendUp: true,
        description: "Lifetime",
        type: "revenue",
      },
      {
        title: "Active Orders",
        value: activeOrdersCount.toString(),
        trend: "Pending",
        trendUp: true,
        description: "To fulfill",
        type: "orders",
      },
      {
        title: "Products Sold",
        value: productsSold.toString(),
        trend: "+0%",
        trendUp: true,
        description: "Lifetime",
        type: "products",
      },
      {
        title: "Unique Customers",
        value: uniqueCustomers.toString(),
        trend: "+0%",
        trendUp: true,
        description: "Lifetime",
        type: "customers",
      },
    ];

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("GET /api/vendor/stats error:", error);
    return createErrorResponse(
      "Internal Server Error",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
}
