// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // WHY: Vite processes Tailwind at build time — no separate PostCSS step
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // WHY: enables @/components/... imports
    },
  },
});
