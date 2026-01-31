import { EditProductModalClient } from "@/components/dashboard/EditProductModalClient";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditProductModalPage({
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

  return <EditProductModalClient product={product} />;
}
