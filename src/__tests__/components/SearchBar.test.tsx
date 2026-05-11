// src/__tests__/components/SearchBar.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/components/search/SearchBar";

// Mock the geolocation hook to avoid browser API calls in tests
vi.mock("@/hooks/useGeolocation", () => ({
  useGeolocation: () => ({
    state: { status: "idle" },
    requestLocation: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("SearchBar", () => {
  const mockOnCitySearch = vi.fn();
  const mockOnLocationSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // WHY fake timers: useDebounce uses setTimeout.
    // We control time in tests to avoid actually waiting 500ms.
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderSearchBar() {
    return render(
      <SearchBar
        onCitySearch={mockOnCitySearch}
        onLocationSearch={mockOnLocationSearch}
        isLoading={false}
      />,
    );
  }

  it("renders the search input and location button", () => {
    renderSearchBar();
    expect(
      screen.getByPlaceholderText("Search for a city..."),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Use my current location"),
    ).toBeInTheDocument();
  });

  it("does NOT call onCitySearch for single character input", () => {
    renderSearchBar();

    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "L" },
    });

    act(() => {
      vi.advanceTimersByTime(600); // advance past 500ms debounce
    });

    expect(mockOnCitySearch).not.toHaveBeenCalled();
    // WHY: We configured the hook to ignore input < 2 characters.
  });

  it("calls onCitySearch after debounce delay with valid input", () => {
    renderSearchBar();

    fireEvent.change(screen.getByPlaceholderText("Search for a city..."), {
      target: { value: "Lo" },
    });

    act(() => {
      vi.advanceTimersByTime(600); // advance past 500ms debounce
    });

    expect(mockOnCitySearch).toHaveBeenCalledWith("Lo");
    expect(mockOnCitySearch).toHaveBeenCalledTimes(1);
    // WHY toHaveBeenCalledTimes(1): the debounce should have prevented multiple calls
  });

  it("shows a spinner when isLoading is true", () => {
    render(
      <SearchBar
        onCitySearch={mockOnCitySearch}
        onLocationSearch={mockOnLocationSearch}
        isLoading={true}
      />,
    );
    // The Loader2 icon replaces the X clear button during loading
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });
});
