import { createContext } from "react";
import { VennDiagramContextType } from "../types/venn.types";

/**
 * Shared context for VennDiagram and related subcomponents.
 * Extracted into its own module to avoid circular dependencies
 * between VennDiagram and VennDiagramSVG.
 */
export const VennDiagramContext = createContext<VennDiagramContextType | null>(
  null
);

VennDiagramContext.displayName = "VennDiagramContext";
