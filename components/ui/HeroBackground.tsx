import { cn } from "@/lib/utils";

export function HeroBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 brightness-100 contrast-150 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div
          className="absolute top-[20%] left-[20%] w-125 h-125 bg-primary/20 rounded-full blur-[100px] mix-blend-screen opacity-25 animate-pulse"
          style={{ animationDuration: "10s" }}
        />
        <div className="absolute top-[30%] right-[20%] w-100 h-100 bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen opacity-15" />
      </div>
      {/* Fade to background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </div>
  );
}
