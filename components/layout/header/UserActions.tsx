"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShoppingCart,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function UserActions() {
  const { user, isLoading, fetchUser, logout } = useAuthStore();
  const { items } = useCartStore(); // Use cart store
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Re-hydrate persist store
    useCartStore.persist.rehydrate();
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // Determine Dashboard Link based on role
  const dashboardLink = user?.role === "ADMIN" ? "/admin/orders" : "/dashboard";
  const showDashboardButton =
    (user?.role === "VENDOR" || user?.role === "ADMIN") &&
    !pathname?.startsWith("/dashboard") &&
    !pathname?.startsWith("/admin");

  return (
    <div className="flex items-center gap-4 shrink-0">
      {showDashboardButton ? (
        /* Dashboard Link for Vendors/Admins not currently on dashboard */
        <Button
          size="sm"
          variant="outline"
          className="hidden border-primary/20 hover:bg-primary/20 sm:flex"
          asChild
        >
          <Link href={dashboardLink}>Dashboard</Link>
        </Button>
      ) : (
        /* Cart - Hide for Vendors/Admins */
        user?.role !== "VENDOR" &&
        user?.role !== "ADMIN" && (
          <Link href="/cart" className="relative group p-1">
            <ShoppingCart className="h-5 w-5 text-zinc-400 group-hover:text-primary transition-colors" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-extrabold text-background border border-background animate-in zoom-in duration-300">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        )
      )}

      {/* Auth Actions */}
      {isLoading ? (
        <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.name
                    ? user.name.substring(0, 2).toUpperCase()
                    : user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.name || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(user.role === "VENDOR" || user.role === "ADMIN") && (
              <DropdownMenuItem asChild>
                <Link
                  href={dashboardLink}
                  className="cursor-pointer flex w-full items-center font-semibold text-primary"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="cursor-pointer flex w-full items-center"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/settings"
                className="cursor-pointer flex w-full items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="cursor-pointer"
            >
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Mode</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign up</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
