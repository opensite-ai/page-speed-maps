import {
  appendStadiaApiKey,
  getMapLibreStyleUrl,
  MAPLIBRE_DEFAULT_STYLE_URL
} from "../src/utils/getMapLibreStyleUrl";

describe("getMapLibreStyleUrl", () => {
  it("maps built-in styles and appends stadia api key", () => {
    const style = getMapLibreStyleUrl("osm-bright", "abc123");

    expect(style).toContain("tiles.stadiamaps.com/styles/osm_bright.json");
    expect(style).toContain("api_key=abc123");
  });

  it("returns maplibre default style without stadia api key", () => {
    const style = getMapLibreStyleUrl("maplibre-default", "abc123");

    expect(style).toBe(MAPLIBRE_DEFAULT_STYLE_URL);
  });

  it("falls back to default stadia style for unknown key", () => {
    const style = getMapLibreStyleUrl("unknown-style", "abc123");

    expect(style).toContain("styles/osm_bright.json");
    expect(style).toContain("api_key=abc123");
  });

  it("falls back to keyless map style when stadia style is used without a key", () => {
    const style = getMapLibreStyleUrl("osm-bright", "");

    expect(style).toBe(MAPLIBRE_DEFAULT_STYLE_URL);
  });

  it("falls back to keyless map style for unknown style when key is missing", () => {
    const style = getMapLibreStyleUrl("unknown-style", "");

    expect(style).toBe(MAPLIBRE_DEFAULT_STYLE_URL);
  });

  it("does not mutate non-stadia urls", () => {
    const style = appendStadiaApiKey("https://example.com/style.json", "abc123");

    expect(style).toBe("https://example.com/style.json");
  });

  it("throws when trying to append stadia key to stadia url without key", () => {
    expect(() =>
      appendStadiaApiKey("https://tiles.stadiamaps.com/styles/osm_bright.json", "")
    ).toThrow("stadiaApiKey");
  });
});
