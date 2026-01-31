import { ShowcaseCard } from "./ShowcaseCard";

export function HeroProductShowcase() {
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-20 h-75 md:h-125">
      {/* Image 1 - Top Left */}
      <ShowcaseCard
        src="/images/hero-headphones-vibrant.png"
        alt="Premium Wireless Headphones"
        category="AUDIO"
        title="Sonic Pro X1"
        className="absolute top-0 left-4 md:left-10 w-[65%] md:w-[60%] h-[65%] md:h-[80%] z-10 animate-in fade-in slide-in-from-left-10 duration-1000"
        priority
      />

      {/* Image 2 - Bottom Right */}
      <ShowcaseCard
        src="/images/hero-keyboard-vibrant.png"
        alt="Mechanical Gaming Keyboard"
        category="PERIPHERALS"
        title="Neon Mech 75"
        className="absolute bottom-0 right-4 md:right-10 w-[65%] md:w-[60%] h-[65%] md:h-[80%] z-20 animate-in fade-in slide-in-from-right-10 duration-1000 delay-200"
        badgeClassName="bg-secondary/90 text-secondary-foreground"
      />

      {/* Decorative Glow */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/10 blur-[100px] rounded-full" />
    </div>
  );
}
