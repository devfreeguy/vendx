"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  ProductCard,
  ProductCardSkeleton,
} from "@/components/products/ProductCard";
import { HeroBackground } from "@/components/ui/HeroBackground";

export function ProductsPageClient() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialSubCategory = searchParams.get("subCategory");

  const [filters, setFilters] = useState({
    category: initialCategory,
    subCategory: initialSubCategory,
    priceRange: [0, 5000] as [number, number],
    inStock: false,
  });

  // Update filters if URL params change (e.g. navigation)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get("category"),
      subCategory: searchParams.get("subCategory"),
    }));
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1 pt-24 pb-12 max-w-screen relative">
        <HeroBackground className="h-[50vh]" />
        <div className="container mx-auto px-4 pt-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <ProductFilters filters={filters} onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1">
              <div className="mb-6">
                <div className=" w-full flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground mb-2 flex-1">
                    All Products
                  </h1>

                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden" size="sm">
                        <SlidersHorizontal className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent
                      side="left"
                      className="w-75 sm:w-100 overflow-hidden bg-background border-border"
                    >
                      <div className="mt-6 h-full p-6">
                        <ProductFilters
                          filters={filters}
                          onFilterChange={setFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <p className="text-muted-foreground">
                  Showing products in {filters.category || "all categories"}
                </p>
              </div>

              {/* Product Grid */}
              <ProductGrid filters={filters} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProductGrid({ filters }: { filters: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query string
        const params = new URLSearchParams();
        if (filters.category) params.append("category", filters.category);
        if (filters.subCategory)
          params.append("subcategory", filters.subCategory);
        if (filters.inStock) params.append("inStock", "true");
        // price range logic could be added here if API supports it

        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();

        if (json.success) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
        No products found matching your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
