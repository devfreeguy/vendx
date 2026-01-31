"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "./Sidebar";
import { UserActions } from "../layout/header/UserActions";
import { usePathname } from "next/navigation";
import sidebarData from "@/data/sidebar-navigation.json";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  // Find matching nav item to auto-populate title
  const allLinks = [
    ...(sidebarData.vendor || []),
    ...(sidebarData.admin || []),
  ];
  // Basic matching: exact match or starts with (for subpages)
  // Sort by length desc to match most specific path first?
  // Actually sidebar links are usually top level.
  const activeLink = allLinks.find(
    (link) =>
      pathname === link.href ||
      (link.href !== "/dashboard" &&
        link.href !== "/admin" &&
        pathname?.startsWith(link.href)),
  );

  const displayTitle = title || activeLink?.label || "Dashboard";
  const displayDescription =
    description ||
    (activeLink
      ? `Manage your ${activeLink.label.toLowerCase()} here.`
      : "Manage your storefront and track performance.");

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 size-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="p-0 w-64 border-r border-border bg-background"
            >
              <div className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>
                  Dashboard navigation sidebar
                </SheetDescription>
              </div>
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight sm:text-2xl">
            {displayTitle}
          </h1>
          <p className="text-xs text-muted-foreground hidden md:block mt-1">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div>{action || <UserActions />}</div>
    </div>
  );
}
