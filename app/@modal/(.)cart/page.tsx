"use client";

import { CartContents } from "@/components/cart/CartContents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCartStore } from "@/hooks/useCartStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InterceptedCartPage() {
  const router = useRouter();
  const { isOpen, setIsOpen } = useCartStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const onDismiss = () => {
    setIsOpen(false);
    router.back();
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(val) => {
        if (!val) {
          onDismiss();
        }
      }}
    >
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`w-full ${isMobile ? "h-[80vh]" : "sm:max-w-md"} overflow-hidden flex flex-col p-0 gap-0 bg-card`}
      >
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription className="sr-only">
            View and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <CartContents />
        </div>
      </SheetContent>
    </Sheet>
  );
}
