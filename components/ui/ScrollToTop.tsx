"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollViewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );

    // Fallback to window if scrollViewport is not found (though it should be based on layout)
    const target = scrollViewport || window;
    // Determine scroll property based on target type
    const getScrollTop = () => {
      if (target instanceof Window) return target.scrollY;
      return (target as HTMLElement).scrollTop;
    };

    const handleScroll = () => {
      setIsVisible(getScrollTop() > 400);
    };

    target.addEventListener("scroll", handleScroll);
    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const scrollViewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    const target = scrollViewport || window;

    target.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed bottom-6 right-8 z-50 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
