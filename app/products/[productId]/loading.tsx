import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "../../../components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-20 max-w-screen">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-4 w-8" /> {/* Back Button */}
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
            {/* Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="flex gap-4 overflow-hidden">
                <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
                <Skeleton className="h-24 w-24 rounded-lg shrink-0" />
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="flex flex-col h-full">
              <div className="space-y-4 mb-6">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-10 w-48 rounded-full" />
              </div>

              <div className="mb-8 space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-24 w-full" />
              </div>

              <div className="flex items-center gap-4 mb-10">
                <Skeleton className="h-14 flex-1 rounded-xl" />
                <Skeleton className="h-14 w-14 rounded-xl" />
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 border-b border-border pb-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
