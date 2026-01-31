import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { ShoppingBag, House, Package, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: House },
  { label: "Shop", href: "/products", icon: ShoppingBag },
  { label: "Orders", href: "/orders", icon: Package },
];

interface NavigationProps {
  className?: string;
  isMobile?: boolean;
}

export function Navigation({ className, isMobile }: NavigationProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  if (isMobile) {
    return (
      <nav className={cn("flex flex-col gap-2", className)}>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        {user?.role === "VENDOR" && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors text-primary bg-primary/5 hover:bg-primary/10 mt-2"
          >
            <User className="h-5 w-5" />
            Dashboard
          </Link>
        )}
      </nav>
    );
  }

  return (
    <nav className={cn("hidden lg:flex items-center gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )}
          >
            {/* Optional: <item.icon className="h-4 w-4" /> */}
            {item.label}
          </Link>
        );
      })}

      {user?.role === "VENDOR" && (
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-primary hover:bg-primary/10 ml-2"
        >
          Dashboard
        </Link>
      )}
    </nav>
  );
}
