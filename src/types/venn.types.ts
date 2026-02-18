import { ReactNode } from "react";

/**
 * Represents a single set in the Venn diagram
 */
export interface VennSet {
  name: string;
  label?: ReactNode;
  color?: string;
  size: number;
}

/**
 * Represents an intersection between sets
 */
export interface VennIntersection {
  sets: string[]; // Array of set names that intersect
  size: number; // Size/value at this intersection
  label?: ReactNode;
}

/**
 * Complete data structure for Venn diagram
 */
export interface VennData {
  sets: VennSet[];
  intersections: VennIntersection[];
}

/**
 * Circle layout information (computed by @upsetjs/venn.js)
 */
export interface CircleLayout {
  x: number;
  y: number;
  radius: number;
  set: string;
}

/**
 * Configuration options for the diagram
 */
export interface VennDiagramConfig {
  width?: number;
  height?: number;
  renderer?: "svg" | "canvas";
  showLabels?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  colorScheme?: string[];
  animated?: boolean;
  hoverOpacity?: number;
  interactive?: boolean;
  responsive?: boolean;
  padding?: number;
  textFill?: string;
  strokeWidth?: number;
  formatValue?: (value: number) => string;
  formatLabel?: (label: string) => string;
}

/**
 * Props for VennDiagram component
 */
export interface VennDiagramProps extends VennDiagramConfig {
  data: VennData;
  className?: string;
  style?: React.CSSProperties;
  onSetHover?: (setNames: string[] | null) => void;
  onClick?: (setNames: string[]) => void;
  testId?: string;
}

/**
 * Hook return type for layout calculation
 */
export interface UseVennLayoutReturn {
  layout: CircleLayout[];
  paths: string[];
  textPositions: Array<{ x: number; y: number; setNames: string[] }>;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Context type for sharing diagram state
 */
export interface VennDiagramContextType {
  data: VennData;
  config: VennDiagramConfig;
  hoveredSets: string[] | null;
  setHoveredSets: (sets: string[] | null) => void;
  selectedSets: string[] | null;
  setSelectedSets: (sets: string[] | null) => void;
}
