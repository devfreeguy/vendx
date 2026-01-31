"use client";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMemo } from "react";
import { CountdownTimer } from "./CountdownTimer";

interface PaymentInvoiceProps {
  orderId: string;
  bchAddress: string;
  bchAmount: number;
  usdAmount: number;
  exchangeRate: number;
  expiresAt: string;
  status: "PENDING" | "PAID" | "COMPLETED" | "CANCELLED";
}

export function PaymentInvoice({
  orderId,
  bchAddress,
  bchAmount,
  usdAmount,
  exchangeRate,
  expiresAt,
  status,
}: PaymentInvoiceProps) {
  const isExpired = new Date(expiresAt) < new Date() && status === "PENDING";
  const isPaid = status === "PAID" || status === "COMPLETED";

  // BCH Payment URI: bitcoincash:address?amount=X.XXXX
  const paymentUri = useMemo(() => {
    // Ensure address has prefix or add it if missing for proper QR
    const cleanAddress = bchAddress.startsWith("bitcoincash:")
      ? bchAddress
      : `bitcoincash:${bchAddress}`;
    return `${cleanAddress}?amount=${bchAmount}`;
  }, [bchAddress, bchAmount]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <Card className="border-2 shadow-lg w-full">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Order ID: {orderId}
            </span>
            <Badge
              variant={status === "PENDING" ? "outline" : "default"}
              className={
                status === "PENDING"
                  ? "border-amber-500 text-amber-500"
                  : "bg-green-500"
              }
            >
              {status}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold">
            Pay with Bitcoin Cash
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Send exactly the amount below to complete your order.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Display */}
          <div className="bg-muted/30 p-4 rounded-xl text-center space-y-1 border border-border">
            <div className="text-4xl font-extrabold text-foreground tracking-tight">
              {bchAmount.toFixed(8)}{" "}
              <span className="text-lg text-primary">BCH</span>
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${usdAmount.toFixed(2)} USD (@ ${exchangeRate.toFixed(2)}/BCH)
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-2 relative">
            <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
              <QRCodeSVG
                value={paymentUri}
                size={200}
                level="M"
                includeMargin={false}
              />
            </div>
            {isPaid && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                <CheckCircle2 className="h-24 w-24 text-green-500 animate-in zoom-in duration-300" />
              </div>
            )}
            {isExpired && !isPaid && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
                <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold shadow-lg">
                  EXPIRED
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">
              Payment Address
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-muted p-3 rounded-lg text-xs break-all font-mono border border-border flex items-center">
                {bchAddress}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-full aspect-square"
                onClick={() => copyToClipboard(bchAddress)}
                disabled={isExpired || isPaid}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timer */}
          {!isPaid && (
            <div className="flex items-center justify-between bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg border border-amber-500/20">
              <span className="text-sm font-medium">Rate Verified For:</span>
              <CountdownTimer expiresAt={expiresAt} />
            </div>
          )}

          {/* Warnings */}
          <Alert
            variant="destructive"
            className="bg-destructive/5 text-destructive border-destructive/20"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Do not send BCH after the timer expires. Underpayment will delay
              your order.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-6">
          <Button className="w-full" size="lg" asChild>
            <a
              href={paymentUri}
              className={
                isExpired || isPaid ? "pointer-events-none opacity-50" : ""
              }
            >
              Open in Wallet
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
