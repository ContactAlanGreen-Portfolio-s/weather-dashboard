//vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    // WHY jsdom: Our components use browser APIs (DOM, localStorage).
    // jsdom simulates a browser environment inside Node.js.
    globals: true,
    // WHY globals: Allows using describe/it/expect without importing them.
    // Same API as Jest — minimises learning curve.
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
