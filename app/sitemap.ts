import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sell`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic product routes
  const products = await prisma.product.findMany({
    where: {
      stock: { gt: 0 }, // Only include products in stock
    },
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic vendor routes
  const vendors = await prisma.user.findMany({
    where: {
      role: "VENDOR",
      products: {
        some: {
          stock: { gt: 0 }, // Only vendors with products in stock
        },
      },
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  const vendorRoutes: MetadataRoute.Sitemap = vendors.map((vendor) => ({
    url: `${baseUrl}/vendors/${vendor.id}`,
    lastModified: vendor.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...vendorRoutes];
}
