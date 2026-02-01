"use client";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Logo } from "@/components/layout/header/Logo";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { isEmpty } from "lodash";
import { Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use login action from store
  const login = useAuthStore((state) => state.login);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);

      const user = useAuthStore.getState().user;
      if (user && !user.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (err: any) {
      if (!isEmpty(err)) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      <BackButton />

      {/* Left: Branding & Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-muted border-r border-border relative overflow-hidden">
        <div className="z-10 pl-16 pt-2">{/* Space for back button */}</div>

        <div className="z-10 absolute top-12 right-12">
          <Logo />
        </div>

        <div className="relative z-10 max-w-lg mt-20">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Welcome back to the future of commerce.
          </h2>
          <p className="text-muted-foreground text-lg">
            Log in to access your decentralized dashboard, manage orders, and
            trade with Bitcoin Cash.
          </p>
        </div>

        <div className="text-sm text-muted-foreground z-10">
          © {new Date().getFullYear()} VendX Inc.
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Right: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 lg:p-24 pt-24 lg:pt-24">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden mb-8 flex flex-col">
            <Logo />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h1>
            <p className="mt-2 text-muted-foreground">
              Or{" "}
              <Link
                href="/register"
                className="font-medium text-primary hover:text-primary/80"
              >
                create a new account
              </Link>
            </p>
          </div>

          <GoogleButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
