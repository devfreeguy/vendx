"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Loader2,
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
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
import { useAuthStore } from "@/store/useAuthStore";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.get("/orders");
        // Ensure data is array (api interceptor unwraps, usually data.data or data)
        // route.ts returns { success: true, data: orders }
        // If interceptor returns data.data:
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground mt-1">
              View and track your purchase history.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : !isAuthenticated ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please log in to view your orders.
              </p>
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <div className="flex justify-center mb-4 text-muted-foreground">
              <Package className="h-12 w-12 opacity-50" />
            </div>
            <CardTitle className="mb-2">No orders yet</CardTitle>
            <CardDescription className="mb-6">
              You haven't placed any orders yet.
            </CardDescription>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                  <CardContent className="p-6 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-muted-foreground">
                          #{order.id.slice(-8)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        {order.items?.length || 0} items
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ${order.usdAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {order.bchAmount.toFixed(8)} BCH
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    PAID: "bg-green-100 text-green-700 border-green-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
    EXPIRED: "bg-red-100 text-red-700 border-red-200",
    UNDERPAID: "bg-orange-100 text-orange-700 border-orange-200",
  } as any;

  const icons = {
    PENDING: Clock,
    PAID: CheckCircle,
    COMPLETED: Package,
    CANCELLED: XCircle,
    EXPIRED: XCircle,
    UNDERPAID: Clock,
  } as any;

  const Icon = icons[status] || Clock;
  const style = styles[status] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
