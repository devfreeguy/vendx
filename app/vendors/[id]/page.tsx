import api from "@/lib/axios"; // Use client-side fetch or server fetch?
// Actually, this is a server component page, passing params.
// We should use prisma directly if possible to avoid self-fetch, or fetch absolute URL.
// But earlier pattern used `api` calls. Let's use direct Prisma or a client component wrapper if we want interactivity.
// Let's make it a server component that fetches data directly for SEO and performance.

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/products/ProductCard"; // Assuming this exists or needs check
import { Calendar, Package, Star } from "lucide-react";
import { Metadata } from "next";
import { generateVendorMetadata } from "@/lib/seo";

// Check if ProductCard exists, if not, I'll need to create a simple card or check imports.
// I will assume standard card structure or verify in next step. For now I'll create a basic layout.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const vendor = await prisma.user.findUnique({
    where: { id },
    include: {
      products: {
        where: { stock: { gt: 0 } },
      },
    },
  });

  if (!vendor || vendor.role !== "VENDOR") {
    return {
      title: "Vendor Not Found",
      description: "The requested vendor could not be found.",
    };
  }

  return generateVendorMetadata({
    name: vendor.name,
    email: vendor.email,
    profilePicture: vendor.profilePicture,
    productCount: vendor.products.length,
  });
}

export default async function VendorPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendor = await prisma.user.findUnique({
    where: { id },
    include: {
      products: {
        where: { stock: { gt: 0 } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!vendor || vendor.role !== "VENDOR") {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4">
        {/* Vendor Header */}
        <div className="bg-card border rounded-2xl p-6 md:p-8 mb-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-md">
            <AvatarImage
              src={vendor.profilePicture || ""}
              alt={vendor.name || "Vendor"}
            />
            <AvatarFallback className="text-2xl">
              {vendor.name?.substring(0, 2).toUpperCase() || "VE"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold">
              {vendor.name || "Unnamed Vendor"}
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto md:mx-0">
              {/* Description field missing in User model, using placeholder */}
              Trusted vendor on VendX.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(vendor.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{vendor.products.length} Products</span>
              </div>
              {/* Rating Placeholder */}
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium text-foreground">5.0</span>
                <span className="text-muted-foreground">(New)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <h2 className="text-xl font-bold mb-6">Products by {vendor.name}</h2>

        {vendor.products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed">
            <p className="text-muted-foreground">
              This vendor has no active products listed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {vendor.products.map((product) => (
              <div
                key={product.id}
                className="group relative bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Simple Inline Card to avoid missing component issues */}
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No Image
                    </div>
                  )}
                  {product.discountPrice &&
                    product.discountPrice < product.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold truncate">{product.title}</h3>
                  <div className="flex items-baseline gap-2">
                    {product.discountPrice &&
                    product.discountPrice < product.price ? (
                      <>
                        <span className="font-bold text-lg">
                          ${product.discountPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-lg">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <a
                    href={`/shop/${product.id}`}
                    className="block w-full text-center bg-primary text-primary-foreground py-2 rounded-lg mt-2 hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
