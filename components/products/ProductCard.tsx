"use client";

import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingCart, Star } from "lucide-react";
import Link from "next/link";

export type Product = {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  description: string;
  images: string[];
  vendor: { email: string; name?: string }; // Update type to reflect possible name
  rating?: number;
  reviewCount?: number;
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const isVendorOrAdmin = user?.role === "VENDOR" || user?.role === "ADMIN";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images?.[0] || "",
      vendor: { name: product.vendor.name || product.vendor.email || "Vendor" },
    });
    // Optional: toast.success("Added to cart");
  };

  return (
    <div className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/5 flex flex-col h-full">
      <Link href={`/products/${product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Product</span>
      </Link>

      <div className="aspect-4/3 bg-muted relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/50">
            <span className="text-4xl font-bold opacity-20">IMG</span>
          </div>
        )}

        {!isVendorOrAdmin && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <button
              onClick={handleAddToCart}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-lg cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="flex flex-col">
            {product.discountPrice && product.discountPrice < product.price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-card-foreground">
                  ${product.discountPrice.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                  ${product.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-xl font-bold text-card-foreground">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-amber-500 font-medium">
            {product.rating && product.rating > 0 && (
              <>
                <Star className="h-4 w-4 fill-current" />
                <span>{product.rating || 0}</span>
              </>
            )}
            {product.reviewCount && product.reviewCount > 0 && (
              <span className="text-muted-foreground text-xs ml-0.5">
                ({product.reviewCount || 0})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 h-100 animate-pulse flex flex-col">
      <div className="w-full h-48 bg-muted rounded-xl mb-4" />
      <div className="h-6 w-3/4 bg-muted rounded mb-3" />
      <div className="h-4 w-1/2 bg-muted rounded mb-6" />
      <div className="mt-auto h-8 w-1/3 bg-muted rounded" />
    </div>
  );
}
