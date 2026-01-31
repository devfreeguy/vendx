"use client";

import { ProductForm } from "@/components/dashboard/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || json.success === false) {
        throw new Error(json.error?.message || "Failed to create product");
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
    <div className="flex-1 py-8 pt-6">
      {/* <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
      </div> */}
      <div className="mx-auto max-w-2xl">
        <Card className="bg-transparent border-none">
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {error && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
