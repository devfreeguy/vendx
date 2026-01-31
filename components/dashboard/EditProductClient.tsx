"use client";

import { ProductForm } from "@/components/dashboard/ProductForm";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditProductClientProps {
  product: any;
}

export function EditProductClient({ product }: EditProductClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert prisma Decimal/floats to string/number for form if needed,
  // but ProductForm expects number for price. Prisma returns number for Float.
  // Although formData in ProductForm initializes empty string if undefined.
  // Let's pass product as is.

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    // Ensure numeric types
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

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-transparent border-none">
      <CardHeader>
        <CardTitle>Edit {product.title}</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
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
      </CardContent>
    </Card>
  );
}
