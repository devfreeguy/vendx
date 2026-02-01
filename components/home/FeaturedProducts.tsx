"use client";

import {
  ProductCard,
  ProductCardSkeleton,
  type Product,
} from "@/components/products/ProductCard";
import { Section } from "@/components/ui/Section";
import api from "@/lib/axios";
import { useEffect, useState } from "react";

interface FeaturedProductsProps {
  title?: string;
  description?: string;
  className?: string; // Add className prop for flexibility
  category?: string;
  limit?: number;
}

export function FeaturedProducts({
  title = "Featured Drops",
  description = "Fresh gear from top vendors.",
  className,
  category,
  limit = 6,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());
    if (category) queryParams.append("category", category);

    api
      .get<Product[]>(`/products?${queryParams.toString()}`)
      .then((res) => {
        // Interceptor returns data.data (Product[]) directly
        if (Array.isArray(res)) {
          setProducts(res);
        } else if ((res as any).data && Array.isArray((res as any).data)) {
          // Fallback if interceptor didn't unwrap as expected or format changed
          setProducts((res as any).data);
        }
      })
      .catch((err: any) => {
        console.error("Failed to fetch featured products", err);
        setError(err.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !error && products.length === 0) {
    return null;
  }

  const viewAllHref = category
    ? `/products?category=${encodeURIComponent(category)}`
    : "/products";

  return (
    <Section
      title={title}
      description={description}
      action={{ label: "View all", href: viewAllHref }}
      className={className}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {error ? (
          <div className="col-span-3 text-center py-20 border border-red-500/20 bg-red-500/5 rounded-2xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <ProductCardSkeleton key={i} />)
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </Section>
  );
}
