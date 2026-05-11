// src/components/ui/Skeleton.tsx
// WHY SKELETONS OVER SPINNERS:
// Loading spinners tell the user "something is happening" but not WHAT.
// Skeletons preserve layout — they show the SHAPE of the content that's loading.
// Users experience less layout shift when data arrives.
// This is the industry standard for 2026 — used by Twitter, LinkedIn, GitHub.

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      aria-hidden="true"
      // WHY aria-hidden: Screen readers should not announce loading skeletons.
      // They announce the real content when it arrives.
    />
  );
}

// Skeleton for the main weather card
export function WeatherCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-20 w-48" />
        <Skeleton className="h-5 w-36" />
      </div>
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-50 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for the forecast grid
export function ForecastGridSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 p-4 space-y-2"
          >
            <Skeleton className="h-4 w-8 mx-auto" />
            <Skeleton className="h-10 w-10 rounded-full mx-auto" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
