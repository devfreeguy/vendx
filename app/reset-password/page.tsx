"use client";

import { Logo } from "@/components/layout/header/Logo";
import { BackButton } from "@/components/ui/BackButton";
import { Input } from "@/components/ui/input";
import api from "@/lib/axios";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 space-y-3">
          <h3 className="font-semibold">Invalid reset link</h3>
          <p className="text-sm">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
        </div>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary/80"
          >
            Request new reset link →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {success ? (
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <h3 className="font-semibold">Password reset successful!</h3>
            </div>
            <p className="text-sm">
              Your password has been updated. Redirecting you to login...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="New password"
            name="password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            minLength={8}
          />

          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            required
            minLength={8}
          />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Password must:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be at least 8 characters long</li>
              <li>Match the confirmation password</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Reset password
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
    </>
  );
}

export default function ResetPasswordPage() {
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
            Create a new password.
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose a strong password to keep your account secure. Make sure it's
            at least 8 characters long.
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
              Reset your password
            </h1>
            <p className="mt-2 text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
