"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/hooks/useCartStore";
import { Home, LayoutGrid, Package2, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function FloatingNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const [isVisible, setIsVisible] = useState(true);

  // Cart item count
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Hide nav when footer is visible (intersecting)
        // Show nav when footer is NOT visible
        setIsVisible(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px 0px 0px 0px",
      },
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
    };
  }, []);

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/",
    },
    {
      label: "Categories",
      icon: LayoutGrid,
      href: "/products", // Or a dedicated categories page if it exists
    },
    {
      label: "Cart",
      icon: ShoppingCart,
      href: "/cart",
      badge: itemCount,
    },
    {
      label: "Orders",
      icon: Package2,
      href: "/orders",
    },
    {
      label: user ? "Account" : "Login",
      icon: User,
      href: user
        ? user.role === "BUYER"
          ? "/profile"
          : "/dashboard"
        : "/login",
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out lg:hidden",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-[200%] opacity-0",
      )}
    >
      <nav className="flex items-center gap-1 bg-zinc-900/90 dark:bg-zinc-900/90 backdrop-blur-lg border border-white/10 p-2 rounded-full shadow-2xl shadow-black/50">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "relative p-3 rounded-full transition-all duration-300 group flex items-center justify-center",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-zinc-400 hover:text-white hover:bg-white/10",
              )}
            >
              <item.icon
                className={cn("h-5 w-5", isActive && "fill-current")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {item.badge ? (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-extrabold text-white border-2 border-zinc-900">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
