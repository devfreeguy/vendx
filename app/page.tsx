import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { HeroWrapper } from "@/components/home/HeroWrapper";

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
