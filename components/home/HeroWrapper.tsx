"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { ProductCarousel } from "./ProductCarousel";

export function HeroWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering children initially
  // Then hide if user is logged in
  if (!mounted) {
    return <>{children}</>;
  }

  if (user) {
    return <ProductCarousel />;
  }

  return <>{children}</>;
}
