"use client";

import { ProductForm } from "@/components/dashboard/ProductForm";
import { ResponsiveModal } from "@/components/dashboard/ResponsiveModalWrapper";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EditProductModalClientProps {
  product: any;
}

export function EditProductModalClient({
  product,
}: EditProductModalClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    const payload = {
      ...data,
      price: parseFloat(data.price),
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
      stock: parseInt(data.stock),
    };

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message || "Failed to update product");
      }

      router.back();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal title="Edit Product" description={`ID: ${product.id}`}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </ResponsiveModal>
  );
}
