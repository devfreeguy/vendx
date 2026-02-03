import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { BackButton } from "@/components/ui/BackButton";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Metadata } from "next";
import {
  generateProductMetadata,
  generateProductStructuredData,
} from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.productId },
    include: { vendor: true },
  });

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  return generateProductMetadata({
    title: product.title,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    images: product.images,
    category: product.category,
    vendor: { name: product.vendor.name },
    tags: product.tags,
  });
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.productId },
    include: { vendor: true },
  });

  if (!product) {
    notFound();
  }

  // construct specs from categorical data
  const specs: Record<string, string> = {
    Category: product.category,
    SKU: product.sku,
    Stock: product.stock > 0 ? `${product.stock} units` : "Out of stock",
  };

  if (product.subcategory) {
    specs.Subcategory = product.subcategory;
  }

  if (product.tags.length > 0) {
    specs.Tags = product.tags.join(", ");
  }

  const productData = {
    id: product.id,
    title: product.title,
    price: product.price,
    discountPrice: product.discountPrice ?? undefined,
    description: product.description,
    rating: 0, // Not yet implemented
    reviewCount: 0, // Not yet implemented
    isLimited: product.stock < 10 && product.stock > 0,
    images: product.images,
    vendor: {
      name: product.vendor.name || product.vendor.email.split("@")[0],
      image: product.vendor.profilePicture || "",
      type: "Gold" as const, // Placeholder
      sales: 0, // Placeholder
      online: true, // Placeholder
    },
    specs,
  };

  // Generate structured data for SEO
  const structuredData = generateProductStructuredData({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    discountPrice: product.discountPrice,
    images: product.images,
    category: product.category,
    stock: product.stock,
    vendor: { name: product.vendor.name },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />

      <main className="flex-1 pt-24 pb-20 max-w-screen relative">
        <HeroBackground className="h-[50vh]" />
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <BackButton
              href="/products"
              className="static transform-none p-0 border-none bg-transparent hover:bg-transparent text-muted-foreground hover:text-foreground"
            />
            {/* Breadcrumb / Nav */}
            <div className="text-sm text-muted-foreground">
              Home / {product.category} /{" "}
              <span className="text-foreground">{productData.title}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Left: Gallery */}
            <ProductGallery
              images={productData.images}
              title={productData.title}
            />

            {/* Right: Info */}
            <ProductInfo {...productData} />
          </div>
        </div>
        <div className="border-t border-border">
          <FeaturedProducts title="You might also like" limit={3} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
