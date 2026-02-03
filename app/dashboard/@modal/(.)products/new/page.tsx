"use client";

import { ProductForm } from "@/components/dashboard/ProductForm";
import { ResponsiveModal } from "@/components/dashboard/ResponsiveModalWrapper";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductModal() {
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
      await api.post("/products", payload);
      router.back();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveModal
      title="Create Product"
      description="Add a new product to your inventory."
    >
      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </ResponsiveModal>
  );
}
