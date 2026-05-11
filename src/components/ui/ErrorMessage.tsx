// src/components/ui/ErrorMessage.tsx
import { AlertTriangle, CloudOff, MapPinOff } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorType = "city-not-found" | "api-down" | "generic";

interface ErroMessageProps {
  type: ErrorType;
  message?: string;
  onRetry: () => void;
}

// Maps HTTP status codes to error types
// eslint-disable-next-line react-refresh/only-export-components
export function getErrorType(error: unknown): ErrorType {
  const status = (error as { status?: number })?.status;
  if (status === 404) return "city-not-found";
  if (status === 503) return "api-down";
  return "generic";
}

export function ErrorMessage({
  type = "generic",
  message,
  onRetry,
}: ErroMessageProps) {
  const config = {
    "city-not-found": {
      Icon: MapPinOff,
      title: "City not found",
      description:
        message ||
        "We couldn't find that city. Check the spelling and please try again.",
      colour: "text-amber-500",
      bg: "bg-amber-50 border-amber-200",
    },
    "api-down": {
      Icon: CloudOff,
      title: "Weather data unavailable",
      description:
        "The weather service is temporarily unavailable. Please try again shortly.",
      colour: "text-slate-500",
      bg: "bg-slate-50 border-slate-200",
    },
    generic: {
      Icon: AlertTriangle,
      title: "Something went wrong",
      description: message || "An unexpected error occurred. Please try again.",
      colour: "text-red-500",
      bg: "bg-red-50 border-red-200",
    },
  };

  const { Icon, title, description, colour, bg } = config[type];

  return (
    <div role="alert" className={cn("rounded-2xl border p-6 text-center", bg)}>
      <Icon
        className={cn("mx-auto mb-3 h-10 w-10", colour)}
        aria-hidden="true"
      />
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
