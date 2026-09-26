"use client";
import "./Skeleton.css";

/**
 * Skeleton — a single placeholder bar.
 *
 * Renders a warm, low-contrast bar with a slow shimmer. Composes into
 * page-specific skeletons (DashboardSkeleton, AdminSkeleton, etc.).
 *
 * Props:
 *   width     string | number — CSS width (default: "100%")
 *   height    number — px (default: 14)
 *   radius    number — px (default: 6)
 *   circle    boolean — renders a circle if true
 *   className string — extra classes
 *   style     object — inline style overrides
 */
export function Skeleton({
  width = "100%",
  height = 14,
  radius = 6,
  circle = false,
  className = "",
  style = {},
}) {
  const size = circle
    ? { width: height, height, borderRadius: "50%" }
    : { width, height, borderRadius: radius };

  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      style={{ ...size, ...style }}
    />
  );
}