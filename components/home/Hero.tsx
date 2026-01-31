import { HeroProductShowcase } from "@/components/home/HeroProductShowcase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-soft-light pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-125 h-125 bg-primary/20 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse" />
        <div className="absolute top-[30%] right-[20%] w-100 h-100 bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen opacity-20" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 relative z-10 text-center pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            VendX Market v1.0 is Live
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-foreground via-muted-foreground to-muted-foreground">
            Decentralized Commerce
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Buy and sell premium gear with Bitcoin Cash. Secure, fast, and
          vendor-dictated. Experience the next generation of e-commerce.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Button
            asChild
            size="lg"
            className="w-full sm:w-auto text-base font-semibold shadow-[0_0_20px_-5px_var(--color-primary)] hover:shadow-[0_0_25px_-5px_var(--color-primary)] hover:-translate-y-0.5 transition-all text-primary-foreground"
          >
            <Link href="/products">Explore Market</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base font-semibold"
          >
            <Link href="/sell">Become a Vendor</Link>
          </Button>
        </div>

        <HeroProductShowcase />
      </div>
    </section>
  );
}
