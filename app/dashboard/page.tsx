import { ProductTable } from "@/components/dashboard/ProductTable";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== "VENDOR") {
    redirect("/login");
  }

  const [products, orders] = await Promise.all([
    prisma.product.findMany({
      where: { vendorId: session.userId as string },
      orderBy: { createdAt: "desc" },
      take: 5, // Limit products on dashboard too?
    }),
    prisma.order.findMany({
      where: {
        items: { some: { product: { vendorId: session.userId as string } } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        buyer: { select: { name: true, email: true } },
        items: {
          where: { product: { vendorId: session.userId as string } },
          include: {
            product: { select: { title: true, images: true, id: true } },
          },
        },
      },
    }),
  ]);

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    customer: order.buyer.name || "Guest",
    customerEmail: order.buyer.email,
    itemsCount: order.items.length,
    total: order.items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0,
    ),
    items: order.items.map((item) => ({
      id: item.id,
      title: item.product.title,
      quantity: item.quantity,
      price: item.priceAtPurchase,
      image: item.product.images[0] || "",
    })),
  }));

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-screen">
      <div className="max-w-7xl mx-auto space-y-8 h-full">
        <StatsCards />

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Orders</h2>
          <OrdersTable orders={formattedOrders} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Recent Products</h2>
          <ProductTable products={products} />
        </div>
      </div>
    </main>
  );
}
