// src/lib/utils.ts
// STUB — placeholder until Issue #14
// Created now so Header.tsx can import without errors.

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
