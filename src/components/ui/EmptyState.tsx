// src/components/ui/EmptyState.tsx
// Shown on initial load before the user has searched for anything
import { CloudSun } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CloudSun className="mb-4 h-20 w-20 text-sky-300" aria-hidden="true" />
      <h2 className="text-xl font-semibold text-slate-700">
        What's the weather like?
      </h2>
      <p className="mt-2 text-slate-400">
        Search for a city or use your location to get started.
      </p>
    </div>
  );
}
