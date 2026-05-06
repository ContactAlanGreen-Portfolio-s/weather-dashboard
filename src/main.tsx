// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App.tsx";
import "./index.css";

// WHY: Create ONE QueryClient for the whole app.
// It manages all query caching, deduplication, and background refetching.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // global default: 10 minutes
      refetchOnWindowFocus: false,
      // WHY: Weather data doesn't change while the user has another tab open.
      // Refetching on focus wastes API calls without adding value.
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      {/* WHY: DevTools only load in development. Zero impact on production bundle. */}
    </QueryClientProvider>
  </StrictMode>,
);
