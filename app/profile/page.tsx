"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Loader2,
  Wallet,
  Package,
  User,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get("/user/profile");
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Header />
        <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-lg">
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">
                Sign in to view profile
              </h2>
              <p className="text-muted-foreground mb-6">
                Manage your account, orders, and wallet.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const bchBalance =
    profile?.wallet?.balances?.find((b: any) => b.currency === "BCH")?.amount ||
    0;
  const lockedBalance =
    profile?.wallet?.balances?.find((b: any) => b.currency === "BCH")?.locked ||
    0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
            <AvatarImage src={profile?.profilePicture} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold">
              {profile?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {profile?.name || "User"}
            </h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Wallet Section */}
          <Card className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />

            <CardHeader>
              <div className="flex items-center gap-2 text-slate-300 mb-1">
                <Wallet className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Wallet Balance
                </span>
              </div>
              <CardTitle className="text-4xl font-mono font-bold flex items-end gap-2">
                {bchBalance.toFixed(8)}{" "}
                <span className="text-xl mb-1 text-slate-400">BCH</span>
              </CardTitle>
              {lockedBalance > 0 && (
                <p className="text-sm text-slate-400 mt-1">
                  Lock: {lockedBalance.toFixed(8)} BCH (Pending)
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="font-semibold text-slate-900 ml-0 hover:bg-white/90"
                >
                  Deposit
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats / Actions */}
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Manage your activity</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                href="/orders"
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Orders</div>
                    <div className="text-xs text-muted-foreground">
                      {profile?._count?.orders || 0} Total Orders
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Profile Settings</div>
                    <div className="text-xs text-muted-foreground">
                      Update info & password
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your last 5 transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/orders" className="flex items-center gap-1">
                  View All <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {!profile?.recentOrders || profile.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent orders found.
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.recentOrders.map((order: any) => (
                    <Link
                      key={order.id}
                      href={`/orders/${order.id}`}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Order #{order.id.slice(-6)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          ${order.usdAmount.toFixed(2)}
                        </div>
                        <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                          {order.status.toLowerCase()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
