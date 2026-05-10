// src/components/weather/WeatherIcon.tsx
// STUB — placeholder until Issue #15

interface WeatherIconProps {
  iconCode?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function WeatherIcon({
  iconCode,
  size = "md",
  className,
}: WeatherIconProps) {
  // Stub — renders nothing until Issue #15
  return (
    <div
      aria-hidden="true"
      data-icon={iconCode}
      data-size={size}
      className={className}
    />
  );
}
