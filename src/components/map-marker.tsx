import * as React from "react";
import { cn } from "../utils/cn";

export type MapMarkerSize = "sm" | "md" | "lg";

export interface MapMarkerProps {
  /** Size variant of the marker */
  size?: MapMarkerSize;
  /** Whether the marker is currently selected/active */
  isSelected?: boolean;
  /** Custom color for the center dot (defaults to neutral-900) */
  dotColor?: string;
  /** Custom color for the inner ring (defaults to neutral-400) */
  innerRingColor?: string;
  /** Custom color for the middle ring (defaults to neutral-300) */
  middleRingColor?: string;
  /** Custom color for the outer ring (defaults to neutral-200) */
  outerRingColor?: string;
  /** Additional class name for the wrapper */
  className?: string;
  /** Click handler for the marker */
  onClick?: (event: React.MouseEvent) => void;
  /** Whether the marker is interactive/clickable */
  interactive?: boolean;
  /** Accessible label for the marker */
  "aria-label"?: string;
}

const SIZE_CONFIG: Record<
  MapMarkerSize,
  {
    outer: string;
    middle: string;
    inner: string;
    dot: string;
  }
> = {
  sm: {
    outer: "size-10",
    middle: "size-7",
    inner: "size-5",
    dot: "size-2",
  },
  md: {
    outer: "size-14",
    middle: "size-10",
    inner: "size-7",
    dot: "size-2.5",
  },
  lg: {
    outer: "size-20",
    middle: "size-14",
    inner: "size-10",
    dot: "size-3.5",
  },
};

/**
 * A reusable map marker component with concentric circle design.
 * Can be used directly with MapLibre markers via the `element` prop.
 *
 * @example
 * // Basic usage
 * <MapMarker />
 *
 * @example
 * // With MapLibre GeoMap
 * const markers = [{
 *   id: 'location-1',
 *   latitude: 40.7128,
 *   longitude: -74.0060,
 *   markerElement: ({ isSelected }) => (
 *     <MapMarker isSelected={isSelected} size="md" />
 *   ),
 * }];
 *
 * @example
 * // Custom colors
 * <MapMarker
 *   dotColor="#1E40AF"
 *   innerRingColor="#3B82F6"
 *   middleRingColor="#93C5FD"
 *   outerRingColor="#DBEAFE"
 * />
 */
export function MapMarker({
  size = "md",
  isSelected = false,
  dotColor,
  innerRingColor,
  middleRingColor,
  outerRingColor,
  className,
  onClick,
  interactive = true,
  "aria-label": ariaLabel = "Map location marker",
}: MapMarkerProps) {
  const sizeConfig = SIZE_CONFIG[size];

  const content = (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full transition-transform duration-200",
        sizeConfig.outer,
        isSelected && "scale-110",
        className
      )}
      style={{ backgroundColor: outerRingColor }}
    >
      {/* Middle ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-200",
          sizeConfig.middle
        )}
        style={{ backgroundColor: middleRingColor }}
      />

      {/* Inner ring */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-200",
          sizeConfig.inner
        )}
        style={{ backgroundColor: innerRingColor }}
      />

      {/* Center dot */}
      <div
        className={cn(
          "absolute rounded-full transition-all duration-200",
          sizeConfig.dot
        )}
        style={{ backgroundColor: dotColor }}
      />
    </div>
  );

  if (!interactive) {
    return content;
  }

  return (
    <button
      type="button"
      className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "transition-transform duration-200 group-hover:scale-110",
          isSelected && "scale-110"
        )}
      >
        {content}
      </div>
    </button>
  );
}

/**
 * Pre-configured marker with neutral gray colors matching the reference design.
 */
export function NeutralMapMarker(
  props: Omit<
    MapMarkerProps,
    "dotColor" | "innerRingColor" | "middleRingColor" | "outerRingColor"
  >
) {
  return (
    <MapMarker
      {...props}
      dotColor="hsl(var(--neutral-900, 0 0% 9%))"
      innerRingColor="hsl(var(--neutral-400, 0 0% 64%))"
      middleRingColor="hsl(var(--neutral-300, 0 0% 78%))"
      outerRingColor="hsl(var(--neutral-200, 0 0% 88%))"
    />
  );
}

/**
 * Factory function to create a marker element for use with MapLibre/GeoMap.
 * Returns a function compatible with the `markerElement` prop.
 *
 * @example
 * const markers = [{
 *   id: 'location-1',
 *   latitude: 40.7128,
 *   longitude: -74.0060,
 *   markerElement: createMapMarkerElement({ size: 'lg' }),
 * }];
 */
export function createMapMarkerElement(
  config?: Omit<MapMarkerProps, "isSelected" | "onClick">
) {
  return function MarkerElement({ isSelected }: { isSelected: boolean }) {
    return <MapMarker {...config} isSelected={isSelected} interactive={false} />;
  };
}

export default MapMarker;
