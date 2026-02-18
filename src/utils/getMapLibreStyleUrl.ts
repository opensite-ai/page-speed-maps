const MAPLIBRE_DEFAULT_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const DEFAULT_STADIA_STYLE_URL =
  "https://tiles.stadiamaps.com/styles/osm_bright.json";

const STYLE_MAP: Record<string, string> = {
  default: DEFAULT_STADIA_STYLE_URL,
  "alidade-smooth": "https://tiles.stadiamaps.com/styles/alidade_smooth.json",
  "alidade-smooth-dark": "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
  "maplibre-default": MAPLIBRE_DEFAULT_STYLE_URL,
  "osm-bright": "https://tiles.stadiamaps.com/styles/osm_bright.json",
  "stadia-outdoors": "https://tiles.stadiamaps.com/styles/outdoors.json",
  "stamen-toner": "https://tiles.stadiamaps.com/styles/stamen_toner.json",
  "stamen-terrain": "https://tiles.stadiamaps.com/styles/stamen_terrain.json",
  "stamen-watercolor": "https://tiles.stadiamaps.com/styles/stamen_watercolor.json"
};

const HTTP_URL_REGEX = /^https?:\/\//i;

export type MapLibreBuiltInStyle = keyof typeof STYLE_MAP;

function isStadiaMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "tiles.stadiamaps.com";
  } catch {
    return false;
  }
}

function assertStadiaApiKey(stadiaApiKey: string): void {
  if (!stadiaApiKey.trim()) {
    throw new Error(
      "A non-empty stadiaApiKey is required for Stadia Maps style URLs."
    );
  }
}

export function appendStadiaApiKey(
  styleUrl: string,
  stadiaApiKey: string
): string {
  if (!isStadiaMapsUrl(styleUrl)) {
    return styleUrl;
  }

  assertStadiaApiKey(stadiaApiKey);

  const parsed = new URL(styleUrl);
  if (!parsed.searchParams.has("api_key")) {
    parsed.searchParams.set("api_key", stadiaApiKey);
  }

  return parsed.toString();
}

export function getMapLibreStyleUrl(
  value: string | undefined,
  stadiaApiKey: string
): string {
  if (!value || typeof value !== "string") {
    return appendStadiaApiKey(DEFAULT_STADIA_STYLE_URL, stadiaApiKey);
  }

  if (STYLE_MAP[value]) {
    return appendStadiaApiKey(STYLE_MAP[value], stadiaApiKey);
  }

  if (HTTP_URL_REGEX.test(value)) {
    return appendStadiaApiKey(value, stadiaApiKey);
  }

  return appendStadiaApiKey(DEFAULT_STADIA_STYLE_URL, stadiaApiKey);
}

export { DEFAULT_STADIA_STYLE_URL, MAPLIBRE_DEFAULT_STYLE_URL };
