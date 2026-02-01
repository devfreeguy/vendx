"use client";

import { useEffect, useState } from "react";
import { Logo } from "./header/Logo";
import { Navigation } from "./header/Navigation";
import { SearchBar } from "./header/SearchBar";
import { UserActions } from "./header/UserActions";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

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
          </div>
        </div>
      </header>
    </>
  );
}
