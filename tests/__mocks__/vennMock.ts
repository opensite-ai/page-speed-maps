// Jest mock for @upsetjs/venn.js
// We don't need the real layout algorithm for unit tests; we just need
// predictable positions and radii.

interface VennInput {
  sets: string[];
  size: number;
}

/**
 * Mock layout function that matches the @upsetjs/venn.js return structure.
 * The real library returns objects with:
 * - data: { sets, size } - the original input data
 * - circles: [{ x, y, radius }] - circle positions (for single sets)
 * - text: { x, y } - text label positions
 */
export function layout(data: VennInput[], _options?: any) {
  return data.map((d, index) => {
    const radius = Math.max(50, Math.sqrt(d.size || 0) * 5);
    const isSingleSet = d.sets.length === 1;
    const x = (index + 1) * 150;
    const y = 200;

    return {
      // Original data is nested under 'data' property
      data: {
        sets: d.sets,
        size: d.size,
      },
      // Circle positions - only meaningful for single sets
      circles: isSingleSet ? [{ x, y, radius }] : [],
      // Text positions for labels/values
      text: { x, y },
    };
  });
}

