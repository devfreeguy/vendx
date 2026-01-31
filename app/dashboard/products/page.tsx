import { ProductTable } from "@/components/dashboard/ProductTable";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function VendorProductsPage() {
  const session = await getSession();

  if (!session || !session.userId || session.role !== "VENDOR") {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: {
      vendorId: session.userId as string,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-screen">
      <div className="max-w-7xl mx-auto space-y-8 h-full">
        <ProductTable products={products} />
      </div>
    </main>
  );
}
