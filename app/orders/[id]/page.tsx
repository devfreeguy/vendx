"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Copy, Check, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

export default function OrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();

    // Polling for status update
    const interval = setInterval(() => {
      if (id) fetchOrder();
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const copyToClipboard = () => {
    if (order?.bchAddress) {
      navigator.clipboard.writeText(order.bchAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
        <Footer />
      </div>
    );

  if (!order)
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex justify-center items-center text-muted-foreground">
          Order not found
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-12 container mx-auto px-4 max-w-3xl">
        <Card className="text-center py-8 border-border/60 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {order.status === "PENDING"
                ? "Payment Required"
                : order.status === "PAID"
                  ? "Payment Successful"
                  : order.status}
            </CardTitle>
            <CardDescription>Order #{order.id}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-8">
            {order.status === "PENDING" && (
              <>
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                  {/* Ensure value is not empty to avoid errors */}
                  {order.bchAddress ? (
                    <QRCodeSVG value={order.bchAddress} size={220} level="M" />
                  ) : (
                    <div className="h-55 w-55 bg-muted animate-pulse" />
                  )}
                </div>

                <div className="space-y-2 w-full max-w-md flex flex-col items-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    Send exactly
                  </p>
                  <div className="text-4xl font-bold font-mono text-primary tracking-tight">
                    {order.bchAmount?.toFixed(8)}{" "}
                    <span className="text-2xl text-foreground">BCH</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${order.usdAmount.toFixed(2)} USD
                  </p>

                  {/* Countdown Timer */}
                  <div className="pt-2">
                    <CountdownTimer expiresAt={order.rateExpiresAt} />
                  </div>
                </div>

                <div className="space-y-4 w-full max-w-md">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50 font-mono text-sm break-all text-left group hover:border-primary/30 transition-colors">
                    <span className="flex-1 text-muted-foreground group-hover:text-foreground transition-colors">
                      {order.bchAddress}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Searching for transaction...
                </div>
              </>
            )}

            {order.status === "PAID" && (
              <div className="text-green-600 flex flex-col items-center gap-4 py-8">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-300">
                  <Check className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    Payment Received!
                  </p>
                  <p className="text-muted-foreground">
                    Thank you for your purchase.
                  </p>
                </div>
                <Button asChild className="mt-6" size="lg">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            )}

            {order.status === "EXPIRED" && (
              <div className="text-red-500 flex flex-col items-center gap-4 py-8">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">
                    Order Expired
                  </p>
                  <p className="text-muted-foreground">
                    The payment window has closed.
                  </p>
                </div>
                <Button asChild className="mt-6" variant="secondary" size="lg">
                  <Link href="/checkout">Create New Order</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
