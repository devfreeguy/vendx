"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/hooks/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function CartContents() {
  const { items, removeItem, updateQuantity, syncWithServer, setIsOpen } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Re-hydrate persist store
    useCartStore.persist.rehydrate();

    // If authenticated, fetch server cart
    if (isAuthenticated) {
      syncWithServer();
    }
  }, [isAuthenticated]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (items.length === 0 && !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center">
        <div className="bg-muted p-4 rounded-full">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/login" className="w-full">
          <Button className="w-full">Sign In to View Saved Cart</Button>
        </Link>
        <Button variant="ghost" asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0 && isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center">
        <div className="bg-muted p-4 rounded-full">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Your cart is empty</h3>
        <p className="text-sm text-muted-foreground">
          Time to start fueling your lifestyle.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Login Banner for Guests with Items */}
      {!isAuthenticated && items.length > 0 && (
        <div className="bg-primary/10 p-4 border-b border-primary/20">
          <p className="text-sm text-primary mb-2">
            Sign in to save your cart and checkout faster.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full border-primary/20 hover:bg-primary/20"
            asChild
          >
            <Link href="/login">Sign In / Register</Link>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative border border-border">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground font-mono">
                    IMG
                  </span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-medium text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {item.vendor.name}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-border rounded-md px-2 py-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-50 p-1"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-semibold">
                    ${(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-red-500 self-start p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">
              Calculated at checkout
            </span>
          </div>
        </div>
        <Separator />
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>${subtotal.toLocaleString()}</span>
        </div>
        <Button
          className="w-full h-12 text-base"
          size="lg"
          asChild
          onClick={() => setIsOpen(false)}
        >
          <Link href="/checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
