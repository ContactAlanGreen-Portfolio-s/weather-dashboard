// src/lib/utils.ts
// STUB — placeholder until Issue #14
// Created now so Header.tsx can import without errors.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Units } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add these three:
export function formatTemp(temp: number, units: Units): string {
  return `${temp}°${units === "metric" ? "C" : "F"}`;
}

export function formatWindSpeed(speed: number, units: Units): string {
  return `${speed} ${units === "metric" ? "km/h" : "mph"}`;
}

export function formatUpdatedAt(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
