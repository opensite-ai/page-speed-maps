import { useEffect, useState, useMemo } from "react";
import * as venn from "@upsetjs/venn.js";
import {
  VennData,
  CircleLayout,
  UseVennLayoutReturn,
} from "../types/venn.types";

interface UseVennLayoutOptions {
  width?: number;
  height?: number;
  padding?: number;
}

/**
 * Hook that computes Venn diagram layout using @upsetjs/venn.js
 * Handles responsive sizing and dynamic data updates
 */
export const useVennLayout = (
  data: VennData,
  options: UseVennLayoutOptions = {}
): UseVennLayoutReturn => {
  const { width = 600, height = 400, padding = 40 } = options;

  // Transform component data format to @upsetjs/venn.js format
  const vennData = useMemo(() => {
    const sets = data.sets.map((set) => ({
      sets: [set.name],
      size: set.size,
    }));

    const intersections = data.intersections.map((intersection) => ({
      sets: intersection.sets,
      size: intersection.size,
    }));

    return [...sets, ...intersections];
  }, [data.sets, data.intersections]);

  const { layout, textPositions, error } = useMemo(() => {
    try {
      const computed = venn.layout(vennData, {
        width,
        height,
        padding,
      });

      const circleLookup = new Map<string, CircleLayout>();

      computed.forEach((entry: any) => {
        const sets = entry?.data?.sets;
        const circles = entry?.circles;
        if (
          Array.isArray(sets) &&
          sets.length === 1 &&
          Array.isArray(circles) &&
          circles[0]
        ) {
          const circle = circles[0];
          circleLookup.set(sets[0], {
            x: circle.x ?? 0,
            y: circle.y ?? 0,
            radius: circle.radius ?? 0,
            set: sets[0],
          });
        }
      });

      const circles = data.sets.map((set) => {
        return (
          circleLookup.get(set.name) ?? {
            x: 0,
            y: 0,
            radius: 0,
            set: set.name,
          }
        );
      });

      const positions = computed
        .filter((entry: any) => entry?.text && entry?.data?.sets)
        .map((entry: any) => ({
          x: entry.text?.x ?? 0,
          y: entry.text?.y ?? 0,
          setNames: Array.isArray(entry.data?.sets) ? entry.data.sets : [],
        }));

      return { layout: circles, textPositions: positions, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Venn diagram layout error:", error);
      return { layout: [], textPositions: [], error };
    }
  }, [vennData, width, height, padding, data.sets]);

  // Generate SVG paths for circles
  const paths = useMemo(() => {
    return layout.map((circle) => {
      const { x, y, radius } = circle;
      return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${
        x + radius
      } ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y}`;
    });
  }, [layout]);

  return {
    layout,
    paths,
    textPositions,
    error,
    isLoading: false,
  };
};

/**
 * Hook for handling responsive diagram sizing
 */
export const useResponsiveVennSize = (
  containerRef: React.RefObject<HTMLDivElement>,
  defaultWidth: number = 600,
  defaultHeight: number = 400
) => {
  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const { offsetWidth, offsetHeight } = containerRef.current;
      if (offsetWidth && offsetHeight) {
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    // Initial size
    handleResize();

    // Listen for resize
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return dimensions;
};
