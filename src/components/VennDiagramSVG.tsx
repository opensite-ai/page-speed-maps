import React, { useContext, useCallback } from "react";
import { CircleLayout } from "../types/venn.types";
import { VennDiagramContext } from "./VennDiagramContext";

interface VennDiagramSVGProps {
  layout: CircleLayout[];
  textPositions: Array<{ x: number; y: number; setNames: string[] }>;
  width: number;
  height: number;
  onClick?: (setNames: string[]) => void;
}

export const VennDiagramSVG: React.FC<VennDiagramSVGProps> = ({
  layout,
  textPositions,
  width,
  height,
  onClick,
}) => {
  const context = useContext(VennDiagramContext);

  if (!context) {
    throw new Error("VennDiagramSVG must be used within VennDiagram");
  }

  const {
    data,
    config,
    hoveredSets,
    setHoveredSets,
    selectedSets,
    setSelectedSets,
  } = context;

  const { colorScheme, showLabels, showValues, animated, strokeWidth } = config;

  const handleCircleHover = useCallback(
    (setName: string, isEntering: boolean) => {
      if (config.interactive) {
        setHoveredSets(isEntering ? [setName] : null);
      }
    },
    [setHoveredSets, config.interactive]
  );

  const handleCircleClick = useCallback(
    (setName: string) => {
      if (config.interactive) {
        const isSelected = selectedSets?.includes(setName);
        setSelectedSets(
          isSelected
            ? (selectedSets || []).filter((s) => s !== setName)
            : [setName]
        );
        onClick?.([setName]);
      }
    },
    [selectedSets, setSelectedSets, config.interactive, onClick]
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="block h-full w-full"
      role="img"
      aria-label="Venn diagram"
    >
      {/* Render circles */}
      {layout.map((circle, idx) => {
        const set = data.sets[idx];
        const color = colorScheme ? colorScheme[idx] : "#ccc";
        const isHovered = hoveredSets?.includes(set.name);
        const isSelected = selectedSets?.includes(set.name);
        const effectiveStrokeWidth = isHovered
          ? Math.max(strokeWidth || 0, 3)
          : strokeWidth;

        return (
          <g key={set.name} className="outline-none">
            <circle
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill={color}
              fillOpacity={isHovered ? config.hoverOpacity : 0.4}
              stroke={color}
              strokeWidth={effectiveStrokeWidth}
              className={[
                "outline-none focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                animated ? "transition-all duration-300 ease-in-out" : "",
                config.interactive ? "cursor-pointer" : "cursor-default",
                isSelected ? "drop-shadow-sm" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => handleCircleHover(set.name, true)}
              onMouseLeave={() => handleCircleHover(set.name, false)}
              onClick={() => handleCircleClick(set.name)}
              role="button"
              tabIndex={0}
              aria-label={`Circle: ${set.label || set.name}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleCircleClick(set.name);
                }
              }}
            />
          </g>
        );
      })}

      {/* Render labels and values */}
      {textPositions.map((pos) => {
        const setNames = pos.setNames;
        const value =
          setNames.length === 1
            ? data.sets.find((s) => s.name === setNames[0])?.size
            : data.intersections.find(
                (i) =>
                  i.sets.length === setNames.length &&
                  i.sets.every((s) => setNames.includes(s))
              )?.size;

        if (!value) return null;

        const isHovered =
          hoveredSets && setNames.some((s) => hoveredSets.includes(s));

        // Derive label for single-set regions using the VennSet.label
        // when available; fall back to the set name. This aligns
        // with the README/BUILD_GUIDE examples which expect values
        // like "Set A" to appear when labels are provided.
        const singleSet =
          setNames.length === 1
            ? data.sets.find((s) => s.name === setNames[0])
            : undefined;
        const rawLabel = (singleSet?.label ?? setNames[0]) as any;
        const renderedLabel =
          typeof rawLabel === "string"
            ? config.formatLabel
              ? config.formatLabel(rawLabel)
              : rawLabel
            : rawLabel;

        return (
          <g
            key={setNames.join(",")}
            className={[
              "pointer-events-none select-none",
              animated ? "transition-opacity duration-300 ease-in-out" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              opacity: isHovered ? 1 : 0.7,
            }}
          >
            {showValues && (
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                className="text-base font-semibold"
                fill={config.textFill}
              >
                {config.formatValue ? config.formatValue(value) : value}
              </text>
            )}

            {showLabels && setNames.length === 1 && (
              <text
                x={pos.x}
                y={pos.y + 20}
                textAnchor="middle"
                className="text-sm font-medium"
                fill={config.textFill}
              >
                {renderedLabel}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
