"use client";

import { Logo } from "@/components/layout/header/Logo";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
            Reset your password securely.
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter your email address and we'll send you a secure link to reset
            your password. The link will expire in 15 minutes.
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
              Forgot your password?
            </h1>
            <p className="mt-2 text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign in
              </Link>
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Check your email</h3>
                </div>
                <p className="text-sm">
                  If an account exists with that email address, we've sent you a
                  password reset link. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-primary hover:text-primary/80"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  icon={Mail}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send you a secure link to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
