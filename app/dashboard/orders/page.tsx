import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function VendorOrdersPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== "VENDOR") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      items: { some: { product: { vendorId: session.userId as string } } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { name: true, email: true } },
      items: {
        where: { product: { vendorId: session.userId as string } },
        include: {
          product: { select: { title: true, images: true, id: true } },
        },
      },
    },
  });

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
        <OrdersTable orders={formattedOrders} />
      </div>
    </main>
  );
}
