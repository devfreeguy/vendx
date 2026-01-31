import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET_KEY =
  process.env.JWT_SECRET || "super-secret-key-change-this-in-env";
const key = new TextEncoder().encode(SECRET_KEY);

export async function GET(request: Request) {
  try {
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

    // Fetch with Buyer include
    const ordersWithUser = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { title: true, images: true } } },
        },
      },
    });

    const properFormattedOrders = ordersWithUser.map((order: any) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      customer: order.buyer?.name || "Guest",
      customerEmail: order.buyer?.email || "N/A",
      itemsCount: order.items.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0,
      ),
      total: order.totalAmount, // Fixed from total to totalAmount
      items: order.items.map((item: any) => ({
        id: item.id,
        title: item.product.title,
        quantity: item.quantity,
        price: item.priceAtPurchase, // Note: OrderItem might not have price, it has priceAtPurchase. Checking schema... it has priceAtPurchase.
        image: item.product.images[0] || "",
      })),
    }));

    return NextResponse.json(properFormattedOrders);
  } catch (error) {
    console.error("Fetch admin orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
