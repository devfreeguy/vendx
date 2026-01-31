"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/axios";

export function StatsCards() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Response is automatically unwrapped by interceptor if success
        const data = (await api.get("/vendor/stats")) as any;
        if (Array.isArray(data)) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const config: any = {
    revenue: {
      icon: DollarSign,
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    orders: {
      icon: ShoppingCart,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
    },
    products: {
      icon: Package,
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500/10",
    },
    customers: {
      icon: Users,
      gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
    },
  };

  const defaultStats = [
    { title: "Total Revenue", value: "---", type: "revenue" },
    { title: "Active Orders", value: "---", type: "orders" },
    { title: "Products Sold", value: "---", type: "products" },
    { title: "Active Customers", value: "---", type: "customers" },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((stat, index) => {
        const conf = config[stat.type] || config.revenue;
        const Icon = conf.icon;

        return (
          <Card
            key={index}
            className="relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 group"
          >
            {/* Subtle gradient overlay */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${conf.gradient} opacity-50 group-hover:opacity-100 transition-opacity`}
            />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {stat.title}
              </CardTitle>
              <div
                className={`p-2 rounded-xl ${conf.iconBg} ring-1 ring-inset ring-white/5 transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className={`h-4 w-4 ${conf.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {loading ? (
                <div className="h-8 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
              )}
              <div className="flex items-center text-xs mt-1 font-medium">
                <span
                  className={`flex items-center ${stat.trendUp ? "text-emerald-500" : "text-rose-500"} bg-background/50 px-1.5 py-0.5 rounded-md mr-2 ring-1 ring-inset ${stat.trendUp ? "ring-emerald-500/20" : "ring-rose-500/20"}`}
                >
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.trend || "+0%"}
                </span>
                <span className="text-muted-foreground">
                  {stat.description || "vs last month"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
