import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroWrapper } from "@/components/home/HeroWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home - Decentralized E-Commerce Marketplace",
  description:
    "Discover trending electronics, power solutions, and the latest products on VendX. Shop with cryptocurrency payments on our secure decentralized marketplace.",
  keywords: [
    "decentralized marketplace",
    "crypto payments",
    "bitcoin cash shopping",
    "electronics",
    "online store",
    "trending products",
  ],
  openGraph: {
    title: "VendX - Decentralized E-Commerce Marketplace",
    description:
      "Discover trending electronics, power solutions, and the latest products. Shop with cryptocurrency payments.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "VendX Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VendX - Decentralized E-Commerce Marketplace",
    description:
      "Discover trending electronics and shop with cryptocurrency payments.",
    images: ["/og-default.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-primary/30">
      <Header />
      <main>
        <HeroWrapper>
          <Hero />
        </HeroWrapper>
        <div id="home-products" className="space-y-12 pb-12">
          <FeaturedProducts
            title="Trending Gear"
            description="High-performance tech for the decentralized age."
            category="Electronics"
            limit={6}
          />
          <FeaturedProducts
            title="Power Your Rig"
            description="Reliable energy solutions for mining and sustainability."
            category="Power"
            limit={3}
          />
          <FeaturedProducts
            title="Fresh Drops"
            description="The latest additions to our decentralized marketplace."
            limit={6}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
