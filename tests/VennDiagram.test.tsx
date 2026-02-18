import React from "react";
import { render, screen, within } from "@testing-library/react";
import { VennDiagram } from "../src/components/VennDiagram";
import { VennData } from "../src/types/venn.types";

describe("VennDiagram", () => {
  const mockData: VennData = {
    sets: [
      { name: "A", label: "Set A", size: 100 },
      { name: "B", label: "Set B", size: 80 },
    ],
    intersections: [{ sets: ["A", "B"], size: 20 }],
  };

  it("renders without crashing", () => {
    render(<VennDiagram data={mockData} width={600} height={400} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("displays values when showValues is true", () => {
    render(<VennDiagram data={mockData} width={600} height={400} showValues />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("displays labels when showLabels is true", () => {
    render(<VennDiagram data={mockData} width={600} height={400} showLabels />);
    expect(screen.getByText("Set A")).toBeInTheDocument();
    expect(screen.getByText("Set B")).toBeInTheDocument();
  });

  it("displays legend when showLegend is true", () => {
    const { container } = render(
      <VennDiagram data={mockData} width={600} height={400} showLegend />
    );

    const legend = container.querySelector('[class*="legend"]');
    expect(legend).not.toBeNull();
    if (!legend) return; // Type guard for TypeScript

    // Ensure the legend specifically contains the label text
    expect(within(legend).getByText("Set A")).toBeInTheDocument();
  });

  it("accepts interactive hover callback (smoke test)", () => {
    const onSetHover = jest.fn();
    render(
      <VennDiagram
        data={mockData}
        width={600}
        height={400}
        onSetHover={onSetHover}
        interactive
      />
    );

    const circles = screen.getAllByRole("button");
    expect(circles.length).toBeGreaterThan(0);
  });

  it("supports responsive sizing", () => {
    const { container } = render(<VennDiagram data={mockData} responsive />);

    const vennContainer = container.querySelector("[data-venn-container]");
    expect(vennContainer).toHaveStyle("width: 100%");
  });
});
