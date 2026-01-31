import { Skeleton } from "../../components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 md:p-8 space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-100 w-full rounded-xl" />
      </div>
    </div>
  );
}
