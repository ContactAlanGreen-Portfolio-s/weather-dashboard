// src/components/weather/WeatherIcon.tsx
// WHY A SEPARATE COMPONENT:
// Icons need consistent sizing and colour classes across multiple places.
// A wrapper component enforces this and keeps consuming components clean.

import { getWeatherIcon } from "@/lib/weatherIcons";
import { cn } from "@/lib/utils";
import React from "react";

interface WeatherIconProps {
  iconCode: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function WeatherIcon({
  iconCode,
  size = "md",
  className,
}: WeatherIconProps) {
  const Icon = getWeatherIcon(iconCode) as React.ComponentType<{
    className?: string;
    "aria-hidden"?: string;
  }>;

  return (
    <Icon
      className={cn(SIZE_CLASSES[size], "text-sky-500", className)}
      aria-hidden="true"
      // WHY aria-hidden: This is a decorative icon.
      // The weather condition is described in text nearby.
      // Screen readers don't need to announce the icon separately.
    />
  );
}
