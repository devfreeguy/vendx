"use client";

import { CartContents } from "@/components/cart/CartContents";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
export default function CartPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-20 container mx-auto px-4 lg:px-8 max-w-screen">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-sm h-150">
          <CartContents />
        </div>
      </main>
      <Footer />
    </div>
  );
}
