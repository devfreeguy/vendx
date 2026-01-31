"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import sidebarData from "@/data/sidebar-navigation.json";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BarChart2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Moon,
  Package,
  Settings,
  ShoppingCart,
  Store,
  Sun,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Map string icon names to components
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Users,
  Store,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
};

interface SidebarContentProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobile?: boolean;
}

export function SidebarContent({
  collapsed = false,
  onToggleCollapse,
  isMobile = false,
}: SidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { setTheme } = useTheme();

  // Determine navigation based on role. Default to vendor if null unique functionality needs handling
  const role = user?.role === "ADMIN" ? "admin" : "vendor";
  const links = sidebarData[role] || sidebarData.vendor;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo Area */}
      <div
        className={cn(
          "flex items-center gap-3 h-20 border-b border-border transition-all",
          collapsed ? "justify-center px-0" : "px-6",
        )}
      >
        <div className="relative h-6 w-6 min-w-6">
          <Image
            src="/assets/images/icon.svg"
            alt="VendX"
            fill
            className="object-contain"
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden whitespace-nowrap">
            <h1 className="text-sm font-bold text-foreground leading-none">
              VendX
            </h1>
            <span className="text-xs text-muted-foreground uppercase">
              {role} Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {links.map((link) => {
            const Icon = iconMap[link.icon] || LayoutDashboard;
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                link.href !== "/admin" &&
                pathname?.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                title={collapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group overflow-hidden whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  collapsed && "justify-center px-2",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 min-w-5",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Area */}
      <div className="p-2 border-t border-border space-y-1">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title={collapsed ? "Toggle Theme" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all overflow-hidden whitespace-nowrap outline-none",
                collapsed && "justify-center px-2",
              )}
            >
              <div className="relative h-5 w-5 min-w-5">
                <Sun className="absolute h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              {!collapsed && <span>Theme</span>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "start"}
            side={collapsed ? "right" : "top"}
            className="w-40"
          >
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={cn("flex w-full items-center gap-2", collapsed && "flex-col")}>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full flex-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all overflow-hidden whitespace-nowrap",
              collapsed && "justify-center px-2",
            )}
            >
            <LogOut className="h-5 w-5 min-w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
            
          {!isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleCollapse}
              className={cn("hidden lg:flex hover:bg-muted", collapsed ? "w-full h-9" : "size-9")}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex h-full shrink-0 transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <SidebarContent
        collapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
    </aside>
  );
}
