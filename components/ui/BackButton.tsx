import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  href?: string;
  className?: string;
}

export function BackButton({ href = "/", className }: BackButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "absolute top-6 left-6 lg:top-8 lg:left-8 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors bg-background/50 backdrop-blur-sm rounded-full border border-border hover:border-foreground/20 lg:bg-transparent lg:border-none",
        className,
      )}
    >
      <ArrowLeft className="h-6 w-6" />
      <span className="sr-only">Go back</span>
    </Link>
  );
}
