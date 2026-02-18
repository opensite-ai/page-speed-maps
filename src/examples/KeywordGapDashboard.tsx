import React, { useState } from "react";
import { VennDiagram } from "../components/VennDiagram";
import { VennData } from "../types/venn.types";

/**
 * Real-world example: Competitor keyword gap analysis
 * Shows distribution of keywords across three competitors
 */
export const KeywordGapDashboard: React.FC = () => {
  const [hoveredSet, setHoveredSet] = useState<string | null>(null);

  // Example data: Keyword distribution across 3 competitors
  const keywordData: VennData = {
    sets: [
      { name: "competitor_a", label: "Competitor A", size: 2500 },
      { name: "competitor_b", label: "Competitor B", size: 2100 },
      { name: "competitor_c", label: "Your Keywords", size: 3200 },
    ],
    intersections: [
      { sets: ["competitor_a", "competitor_b"], size: 450 },
      { sets: ["competitor_a", "competitor_c"], size: 380 },
      { sets: ["competitor_b", "competitor_c"], size: 520 },
      { sets: ["competitor_a", "competitor_b", "competitor_c"], size: 200 },
    ],
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Keyword Gap Analysis</h1>
      <p>Visualize keyword overlap between competitors</p>

      {hoveredSet && (
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
          }}
        >
          Hovering over: {hoveredSet}
        </div>
      )}

      <div style={{ width: "600px", height: "400px" }}>
        <VennDiagram
          data={keywordData}
          width={600}
          height={400}
          showLegend
          showValues
          showLabels
          interactive
          formatValue={(val) => `${Math.round(val / 1000)}k`}
          onSetHover={(sets) => setHoveredSet(sets?.join(" + ") || null)}
          colorScheme={["#3B82F6", "#10B981", "#F59E0B"]}
        />
      </div>

      <div style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}>
        <p>
          <strong>Your Keywords Only:</strong> {3200 - 380 - 520 + 200} keywords
        </p>
        <p>
          <strong>Shared with Competitor A:</strong> 380 keywords
        </p>
        <p>
          <strong>Shared with Competitor B:</strong> 520 keywords
        </p>
        <p>
          <strong>Gap Opportunities:</strong> Keywords not yet targeted
        </p>
      </div>
    </div>
  );
};

