"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@prisma/client";
import api from "@/lib/axios";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { HeroBackground } from "@/components/ui/HeroBackground";

export function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products
    api
      .get<Product[]>("/products?limit=20") // Fetch more to randomize
      .then((res) => {
        if (Array.isArray(res)) {
          // Shuffle and take 8
          const shuffled = [...res].sort(() => 0.5 - Math.random());
          setProducts(shuffled.slice(0, 8));
        }
      })
      .catch((err) => console.error("Failed to fetch carousel products", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null; // Or a skeleton

  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
      <HeroBackground />

      <div className="container mx-auto px-6 relative z-10 space-y-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Recommended For You
          </h2>
          <p className="text-muted-foreground">
            Curated picks from our top vendors
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 4000,
              stopOnMouseEnter: true,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <div className="p-1 h-full">
                  <Card className="h-full border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-colors group">
                    <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}

                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <Link
                          href={`/products/${product.id}`}
                          className="absolute inset-0 z-10"
                        />
                        <h3 className="font-semibold text-white truncate text-lg">
                          {product.title}
                        </h3>
                        <p className="text-primary font-bold">
                          ${product.price.toFixed(2)}
                        </p>
                        <Button
                          size="sm"
                          className="mt-2 w-full bg-white text-black hover:bg-white/90"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="flex w-full">
          <Button
            variant="outline"
            size="lg"
            className="w-9/10 mx-auto sm:w-auto text-base font-semibold cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("home-products")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore Market
          </Button>
        </div>
      </div>
    </section>
  );
}
