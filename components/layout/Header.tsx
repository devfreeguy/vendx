"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./header/Logo";
import { Navigation } from "./header/Navigation";
import { SearchBar } from "./header/SearchBar";
import { UserActions } from "./header/UserActions";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const scrollViewport = document.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );

    const handleScroll = () => {
      if (scrollViewport) {
        setIsScrolled(scrollViewport.scrollTop > 0);
      } else {
        setIsScrolled(window.scrollY > 0);
      }
    };

    // Attach to viewport if it exists, otherwise window
    const target = scrollViewport || window;
    target.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border py-4"
            : "bg-background/0 py-6"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12 h-full flex items-center justify-between gap-8">
          <Logo />
          <SearchBar />
          <Navigation />
          <div className="flex items-center gap-4">
            <UserActions />
            <button
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Slide-over */}
      <div
        className={`fixed inset-0 z-60 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Panel */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-background border-t border-border p-6 rounded-t-3xl transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          <div className="flex items-center justify-between mb-8">
            <span className="text-xl font-bold text-foreground">Menu</span>
            <button
              className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <Navigation isMobile={true} />

          <div className="mt-8 pt-6 border-t border-border">
            {/* Mobile Search Placeholder if needed */}
            <p className="text-sm text-muted-foreground text-center">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
