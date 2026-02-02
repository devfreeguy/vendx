"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Heart,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { VendorBadge } from "./VendorBadge";

interface ProductInfoProps {
  id?: string;
  title: string;
  price: number;
  discountPrice?: number;
  description: string;
  rating: number;
  reviewCount: number;
  isLimited?: boolean;
  images?: string[];
  vendor: {
    name: string;
    type: "Platinum" | "Gold" | "Silver" | "New";
    sales: number;
    online: boolean;
  };
  specs: Record<string, string>;
}

export function ProductInfo({
  id = "1", // Pass id prop or fallback
  title,
  price,
  discountPrice,
  description,
  rating,
  reviewCount,
  isLimited,
  images = [],
  vendor,
  specs,
}: ProductInfoProps & { id?: string }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { user } = useAuthStore();
  const { addItem, items, updateQuantity } = useCartStore();

  const cartItem = items.find((item) => item.id === id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem({
      id,
      title,
      price: price,
      discountPrice: discountPrice,
      image: images[0] || "",
      vendor: { name: vendor.name },
    });
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          {isLimited && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-md"
            >
              Limited Edition
            </Badge>
          )}

          {rating > 0 && (
            <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
              <Star className="h-4 w-4 fill-current" />
              <span>{rating}</span>

              {reviewCount > 0 && (
                <span className="text-muted-foreground">
                  ({reviewCount} Reviews)
                </span>
              )}
            </div>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
          {title}
        </h1>

        <VendorBadge {...vendor} />
      </div>

      {/* Price & Description */}
      <div className="mb-8">
        <div className="mb-4">
          {discountPrice && discountPrice < price ? (
            <div className="flex items-baseline gap-4">
              <div className="text-3xl font-bold text-foreground">
                $
                {discountPrice.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-xl text-muted-foreground line-through decoration-muted-foreground/50">
                ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-foreground">
              ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
        <p className="text-muted-foreground leading-relaxed text-lg">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 mb-10">
        {user?.role !== "VENDOR" &&
          (quantity > 0 ? (
            <div className="w-full flex items-center gap-6 flex-1 justify-between">
              <Button
                size="lg"
                className="h-14 w-14 rounded-xl text-white shadow-lg shadow-orange-500/20"
                onClick={() => handleUpdateQuantity(quantity - 1)}
              >
                <Minus className="h-6 w-6" />
              </Button>
              <span className="text-2xl font-semibold w-8 text-center">
                {quantity}
              </span>
              <Button
                size="lg"
                className="h-14 w-14 rounded-xl text-white shadow-lg shadow-orange-500/20"
                onClick={() => handleUpdateQuantity(quantity + 1)}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="flex-1 h-14 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={handleAddToCart}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          ))}
        <Button
          size="lg"
          variant="outline"
          className="h-14 w-14 p-0 rounded-xl border-border bg-card hover:bg-accent hover:text-red-500"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart
            className={`h-6 w-6 ${isWishlisted ? "fill-current text-red-500" : ""}`}
          />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <TabsContent
          value="specs"
          className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500 py-4"
        >
          <div className="space-y-3">
            {Object.entries(specs).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between items-center py-2 border-b border-border/50 last:border-0 border-dashed"
              >
                <span className="text-muted-foreground">{key}</span>
                {key === "Tags" ? (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {value.split(", ").map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-full px-3"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="font-medium text-foreground">{value}</span>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="reviews"
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 py-4"
        >
          <div className="text-center py-8 text-muted-foreground">
            <p>Reviews coming soon.</p>
          </div>
        </TabsContent>

        <TabsContent
          value="shipping"
          className="animate-in fade-in slide-in-from-bottom-2 duration-500 py-4"
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Fast Delivery</p>
                <p>
                  Receive your order within 3-5 business days via generic
                  shipping.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Secure Packaging</p>
                <p>All items are carefully packaged to ensure safety.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-foreground">Easy Returns</p>
                <p>30-day return policy for all verified purchases.</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
