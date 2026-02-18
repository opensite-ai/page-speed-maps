/**
 * Default color schemes for Venn diagrams
 * Uses accessible color palettes
 */
const COLOR_SCHEMES = {
  default: [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // amber
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
  ],
  pastel: [
    "#A7F3D0", // light teal
    "#BFDBFE", // light blue
    "#FCD34D", // light yellow
    "#FBCFE8", // light pink
    "#DDD6FE", // light purple
    "#FED7AA", // light orange
  ],
  dark: [
    "#1E40AF", // dark blue
    "#065F46", // dark green
    "#92400E", // dark amber
    "#7F1D1D", // dark red
    "#4C1D95", // dark purple
    "#9A3412", // dark orange
  ],
};

export const getColorScheme = (
  circleCount: number,
  scheme: "default" | "pastel" | "dark" = "default"
): string[] => {
  const colors = COLOR_SCHEMES[scheme];

  // Cycle through colors if we have more circles than colors
  return Array.from(
    { length: circleCount },
    (_, i) => colors[i % colors.length]
  );
};

export const isAccessibleContrast = (
  foreground: string,
  background: string
): boolean => {
  // Basic WCAG contrast ratio calculation between two hex colors.
  const hexToRgb = (hex: string): [number, number, number] | null => {
    const cleaned = hex.replace("#", "");
    if (cleaned.length !== 6) return null;
    const r = parseInt(cleaned.slice(0, 2), 16);
    const g = parseInt(cleaned.slice(2, 4), 16);
    const b = parseInt(cleaned.slice(4, 6), 16);
    if ([r, g, b].some((v) => Number.isNaN(v))) return null;
    return [r, g, b];
  };

  const relativeLuminance = ([r, g, b]: [number, number, number]): number => {
    const toLinear = (value: number) => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const [R, G, B] = [toLinear(r), toLinear(g), toLinear(b)];
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  if (!fgRgb || !bgRgb) {
    // If parsing fails, fall back to "not sure", treated as failing contrast.
    return false;
  }

  const L1 = relativeLuminance(fgRgb);
  const L2 = relativeLuminance(bgRgb);
  const contrastRatio =
    (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

  // WCAG AA for normal text is 4.5:1
  return contrastRatio >= 4.5;
};
