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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ),
  title: {
    default: "VendX - Decentralized E-Commerce Marketplace",
    template: "%s | VendX",
  },
  description:
    "VendX is a modern decentralized e-commerce platform built with Next.js. Buy and sell products with cryptocurrency payments. Secure, fast, and transparent marketplace for the digital age.",
  keywords: [
    "e-commerce",
    "marketplace",
    "cryptocurrency",
    "bitcoin cash",
    "decentralized",
    "online shopping",
    "vendor platform",
    "crypto payments",
  ],
  authors: [{ name: "VendX Team" }],
  creator: "VendX",
  publisher: "VendX",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "VendX",
    title: "VendX - Decentralized E-Commerce Marketplace",
    description:
      "Modern decentralized e-commerce platform with cryptocurrency payments. Buy and sell products securely.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "VendX Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VendX - Decentralized E-Commerce Marketplace",
    description:
      "Modern decentralized e-commerce platform with cryptocurrency payments.",
    images: ["/og-default.png"],
    creator: "@vendxstore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { FloatingNav } from "@/components/layout/FloatingNav";

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
          <AuthProvider>
            <ScrollArea className="h-screen w-full">
              {children}
              {modal}
              <FloatingNav />
              <ScrollToTop />
              <Toaster />
            </ScrollArea>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
