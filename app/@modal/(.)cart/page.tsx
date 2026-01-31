"use client";

import { CartContents } from "@/components/cart/CartContents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function InterceptedCartPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Simple check for mobile if we don't have the hook yet, or just rely on CSS responsive classes if Sheet supports it.
  // Converting side prop requires JS though.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setOpen(true);
  }, []);

  const onDismiss = () => {
    setOpen(false);
    setTimeout(() => {
      router.back();
    }, 300); // Wait for animation
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onDismiss()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={`w-full ${isMobile ? "h-[80vh]" : "sm:max-w-md"} overflow-hidden flex flex-col p-0 gap-0 bg-card`}
      >
        <SheetHeader className="px-4 py-4 border-b border-border">
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <CartContents />
        </div>
      </SheetContent>
    </Sheet>
  );
}
