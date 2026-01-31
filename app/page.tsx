import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Hero } from "@/components/home/Hero";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-screen selection:bg-primary/30">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}
