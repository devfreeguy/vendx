import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Suspense } from "react";
import { Metadata } from "next";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/products/ProductCard";

import { HeroBackground } from "@/components/ui/HeroBackground";
import { ProductsPageClient } from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "All Products - Shop Our Marketplace",
  description:
    "Browse our complete collection of electronics, power solutions, and more. Filter by category and find exactly what you need. Secure cryptocurrency payments accepted.",
  keywords: [
    "products",
    "electronics",
    "power solutions",
    "marketplace",
    "shop online",
    "crypto payments",
    "bitcoin cash",
  ],
  openGraph: {
    title: "All Products - VendX Marketplace",
    description:
      "Browse our complete collection of electronics, power solutions, and more. Secure cryptocurrency payments accepted.",
    type: "website",
    url: "/products",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "VendX Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All Products - VendX Marketplace",
    description:
      "Browse our complete collection. Secure cryptocurrency payments accepted.",
    images: ["/og-default.png"],
  },
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageClient />
    </Suspense>
  );
}
