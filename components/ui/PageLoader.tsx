"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  isLoading: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function PageLoader({
  isLoading,
  className,
  children,
}: PageLoaderProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div
        className={cn(
          "absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
          // If no children (fullscreen loader), ensure it covers viewport
          !children && "fixed h-screen w-screen",
          className,
        )}
      >
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    </div>
  );
}
