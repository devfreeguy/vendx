import { Metadata } from "next";

/**
 * Get the base URL for the application based on environment
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/**
 * Default fallback image for Open Graph
 */
export const DEFAULT_OG_IMAGE = "/og-default.png";

/**
 * Site configuration for SEO
 */
export const SITE_CONFIG = {
  name: "VendX",
  description:
    "VendX is a modern decentralized e-commerce platform built with Next.js. Buy and sell products with cryptocurrency payments.",
  url: getBaseUrl(),
  ogImage: DEFAULT_OG_IMAGE,
  keywords: [
    "e-commerce",
    "marketplace",
    "cryptocurrency",
    "bitcoin cash",
    "decentralized",
    "online shopping",
    "vendor platform",
  ],
  author: "VendX Team",
  twitter: "@vendxstore",
};

/**
 * Generate metadata for product pages
 */
export function generateProductMetadata(product: {
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  category: string;
  vendor?: { name: string | null };
  tags?: string[];
}): Metadata {
  const price = product.discountPrice || product.price;
  const image = product.images[0] || DEFAULT_OG_IMAGE;
  const vendorName = product.vendor?.name || "VendX Vendor";

  return {
    title: `${product.title} - VendX`,
    description: product.description.substring(0, 160),
    keywords: [
      product.title,
      product.category,
      "buy online",
      "cryptocurrency payment",
      vendorName,
      ...(product.tags || []),
    ],
    openGraph: {
      title: product.title,
      description: product.description.substring(0, 160),
      type: "website",
      url: `${getBaseUrl()}/products/${product.title}`,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description.substring(0, 160),
      images: [image],
    },
  };
}

/**
 * Generate metadata for vendor pages
 */
export function generateVendorMetadata(vendor: {
  name: string | null;
  email: string;
  profilePicture: string | null;
  productCount: number;
}): Metadata {
  const vendorName = vendor.name || vendor.email.split("@")[0];
  const description = `Shop products from ${vendorName} on VendX. ${vendor.productCount} products available. Secure cryptocurrency payments accepted.`;
  const image = vendor.profilePicture || DEFAULT_OG_IMAGE;

  return {
    title: `${vendorName} - Vendor Profile | VendX`,
    description,
    keywords: [vendorName, "vendor", "seller", "products", "VendX marketplace"],
    openGraph: {
      title: `${vendorName} - VendX Vendor`,
      description,
      type: "profile",
      url: `${getBaseUrl()}/vendors/${vendorName}`,
      images: [
        {
          url: image,
          width: 400,
          height: 400,
          alt: vendorName,
        },
      ],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary",
      title: `${vendorName} - VendX Vendor`,
      description,
      images: [image],
    },
  };
}

/**
 * Generate structured data for products (JSON-LD)
 */
export function generateProductStructuredData(product: {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  images: string[];
  category: string;
  stock: number;
  vendor?: { name: string | null };
}) {
  const price = product.discountPrice || product.price;
  const vendorName = product.vendor?.name || "VendX Vendor";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    brand: {
      "@type": "Brand",
      name: vendorName,
    },
    offers: {
      "@type": "Offer",
      price: price.toString(),
      priceCurrency: "USD",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${getBaseUrl()}/products/${product.id}`,
    },
    category: product.category,
  };
}

/**
 * Generate structured data for vendor/organization (JSON-LD)
 */
export function generateVendorStructuredData(vendor: {
  id: string;
  name: string | null;
  email: string;
  profilePicture: string | null;
}) {
  const vendorName = vendor.name || vendor.email.split("@")[0];

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: vendorName,
    url: `${getBaseUrl()}/vendors/${vendor.id}`,
    logo: vendor.profilePicture || undefined,
    contactPoint: {
      "@type": "ContactPoint",
      email: vendor.email,
    },
  };
}

/**
 * Create a robots meta tag configuration
 */
export function createRobotsConfig(
  index: boolean = true,
  follow: boolean = true,
): Metadata["robots"] {
  return {
    index,
    follow,
    googleBot: {
      index,
      follow,
    },
  };
}
