"use client";

import { Logo } from "@/components/layout/header/Logo";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/PageLoader";
import { Button } from "@/components/ui/button";
import api, { ApiError } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login"); // Protect route
    } else if (!isLoading && user?.onboardingCompleted) {
      // If already completed, go home or dashboard
      router.push(user.role === "VENDOR" ? "/dashboard" : "/");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    let profilePictureUrl = user?.profilePicture;

    try {
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("folder", "users/profile");

        const uploadResult: any = await api.post("/upload", uploadFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        profilePictureUrl = uploadResult.url;
      }

      await updateProfile(name, profilePictureUrl);
      // Fetch fresh user state to ensure we have the latest data/role
      const freshUser = useAuthStore.getState().user;
      const target = freshUser?.role === "VENDOR" ? "/dashboard" : "/";
      router.push(target);
      // Removed router.refresh() to avoid conflicts with push
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <PageLoader isLoading={isLoading || !user || isSubmitting}>
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <Logo />
            <h1 className="mt-8 text-3xl font-bold tracking-tight">
              Welcome to VendX
            </h1>
            <p className="mt-2 text-zinc-400">
              Let's get to know you better. Please complete your profile to
              continue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                >
                  <span className="text-xs text-white font-medium">Change</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a profile picture
              </p>
            </div>

            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              icon={UserIcon}
              required
              defaultValue={user?.name || ""}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </div>
      </div>
    </PageLoader>
  );
}
