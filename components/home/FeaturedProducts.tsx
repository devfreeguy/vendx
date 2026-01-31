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
}

export function FeaturedProducts({
  title = "Featured Drops",
  description = "Fresh gear from top vendors.",
  className,
}: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Product[]>("/products?limit=6")
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

  return (
    <Section
      title={title}
      description={description}
      action={{ label: "View all", href: "/products" }}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {error ? (
          <div className="col-span-3 text-center py-20 border border-red-500/20 bg-red-500/5 rounded-2xl">
            <p className="text-red-400">{error}</p>
          </div>
        ) : loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => <ProductCardSkeleton key={i} />)
        ) : products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-3 text-center py-20 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </div>
    </Section>
  );
}
