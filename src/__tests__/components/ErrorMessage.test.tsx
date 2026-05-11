// src/__tests__/components/ErrorMessage.test.tsx
// Tests for the ErrorMessage component and getErrorType utility.
//
// WHY WE TEST THIS:
// Error states are critical UX. We have three distinct error types
// (city-not-found, api-down, generic) and each must show the right
// message, icon context, and retry behaviour.

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Add this import at the top of ErrorMessage.test.tsx
import { ErrorMessage, getErrorType } from "@/components/ui/ErrorMessage";
describe("getErrorType", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // ERROR TYPE MAPPING
  // WHY: getErrorType maps HTTP status codes to UI error types.
  // If this mapping breaks, users see the wrong error message.
  // ─────────────────────────────────────────────────────────────────────────

  it('returns "city-not-found" for 404 status', () => {
    const error = { status: 404 };
    expect(getErrorType(error)).toBe("city-not-found");
  });

  it('returns "api-down" for 503 status', () => {
    const error = { status: 503 };
    expect(getErrorType(error)).toBe("api-down");
  });

  it('returns "generic" for unknown status codes', () => {
    const error = { status: 500 };
    expect(getErrorType(error)).toBe("generic");
  });

  it('returns "generic" for errors with no status', () => {
    const error = new Error("Network error");
    expect(getErrorType(error)).toBe("generic");
  });

  it('returns "generic" for null/undefined errors', () => {
    expect(getErrorType(null)).toBe("generic");
    expect(getErrorType(undefined)).toBe("generic");
  });
});

describe("ErrorMessage", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // CITY NOT FOUND STATE
  // ─────────────────────────────────────────────────────────────────────────

  it('renders "City not found" heading for city-not-found type', () => {
    render(<ErrorMessage type="city-not-found" />);
    expect(screen.getByText("City not found")).toBeInTheDocument();
  });

  it("renders helpful description for city-not-found", () => {
    render(<ErrorMessage type="city-not-found" />);
    // Should mention checking spelling
    expect(screen.getByText(/spelling/i)).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // API DOWN STATE
  // ─────────────────────────────────────────────────────────────────────────

  it('renders "Weather data unavailable" for api-down type', () => {
    render(<ErrorMessage type="api-down" />);
    expect(screen.getByText("Weather data unavailable")).toBeInTheDocument();
  });

  it("renders service unavailable description for api-down", () => {
    render(<ErrorMessage type="api-down" />);
    expect(
      screen.getByText(/the weather service is temporarily unavailable/i),
    ).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GENERIC ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────

  it('renders "Something went wrong" for generic type', () => {
    render(<ErrorMessage type="generic" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders generic type by default when no type provided", () => {
    render(<ErrorMessage />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ACCESSIBILITY
  // ─────────────────────────────────────────────────────────────────────────

  it('has role="alert" for screen reader announcements', () => {
    render(<ErrorMessage type="generic" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // WHY: role="alert" causes screen readers to announce the error
    // immediately when it appears, even if focus is elsewhere
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RETRY BUTTON
  // ─────────────────────────────────────────────────────────────────────────

  it("shows retry button when onRetry prop is provided", () => {
    const mockRetry = vi.fn();
    render(<ErrorMessage type="generic" onRetry={mockRetry} />);
    expect(
      screen.getByRole("button", { name: /try again/i }),
    ).toBeInTheDocument();
  });

  it("does NOT show retry button when onRetry is not provided", () => {
    render(<ErrorMessage type="generic" />);
    expect(
      screen.queryByRole("button", { name: /try again/i }),
    ).not.toBeInTheDocument();
    // WHY queryByRole: use queryBy when asserting something does NOT exist
    // getBy would throw an error if the element isn't found
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const mockRetry = vi.fn();

    render(<ErrorMessage type="generic" onRetry={mockRetry} />);
    await user.click(screen.getByRole("button", { name: /try again/i }));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOM MESSAGE
  // ─────────────────────────────────────────────────────────────────────────

  it("renders custom message when provided", () => {
    render(<ErrorMessage type="generic" message="Custom error message" />);
    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });
});
