import { EditProductClient } from "@/components/dashboard/EditProductClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="flex-1 py-8 pt-6">
      {/* <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
      </div> */}
      <div className="mx-auto max-w-2xl">
        <EditProductClient product={product} />
      </div>
    </div>
  );
}
