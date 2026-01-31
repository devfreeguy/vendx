import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VendX",
  description:
    "VendX is a modern e-commerce platform built with Next.js and TypeScript.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ScrollArea className="h-screen w-full">
            {children}
            {modal}
            <ScrollToTop />
            <Toaster />
          </ScrollArea>
        </ThemeProvider>
      </body>
    </html>
  );
}
