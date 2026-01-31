import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const SECRET_KEY =
  process.env.JWT_SECRET || "super-secret-key-change-this-in-env";
const key = new TextEncoder().encode(SECRET_KEY);

export async function GET(request: Request) {
  try {
    // 1. Verify Authentication & Role
    const cookieHeader = request.headers.get("cookie");
    const session = cookieHeader
      ?.split("; ")
      .find((row) => row.startsWith("session="))
      ?.split("=")[1];

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(session, key);
    if (payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch Aggregated Stats
    const [totalRevenue, totalOrders, totalUsers, totalProducts] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: "CANCELLED" } }, // Exclude cancelled orders from revenue
        }),
        prisma.order.count(),
        prisma.user.count(),
        prisma.product.count(),
      ]);

    return NextResponse.json({
      revenue: totalRevenue._sum.totalAmount || 0,
      orders: totalOrders,
      users: totalUsers,
      products: totalProducts,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
