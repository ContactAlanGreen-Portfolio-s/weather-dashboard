// src/__tests__/components/EmptyState.test.tsx
// Tests for the EmptyState component.
//
// WHY WE TEST THIS:
// EmptyState is the first thing a user sees when they open the app.
// It must render correctly and communicate what the user should do next.
// These are simple smoke tests — the component is intentionally minimal.

import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it("renders the main heading", () => {
    render(<EmptyState />);
    expect(screen.getByText("What's the weather like?")).toBeInTheDocument();
  });

  it("renders helper text telling the user what to do", () => {
    render(<EmptyState />);
    expect(screen.getByText(/search for a city/i)).toBeInTheDocument();
    // WHY: User needs to know HOW to use the app on first load
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  it("renders the icon as aria-hidden", () => {
    render(<EmptyState />);
    // The decorative icon should be hidden from screen readers
    // Screen readers will read the heading and description instead
    const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
    expect(hiddenElements.length).toBeGreaterThan(0);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SMOKE TEST
  // ─────────────────────────────────────────────────────────────────────────

  it("renders without crashing", () => {
    // Basic smoke test — component mounts without throwing
    expect(() => render(<EmptyState />)).not.toThrow();
  });

  it("renders no interactive elements", () => {
    render(<EmptyState />);
    // EmptyState is purely informational — no buttons or inputs
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
