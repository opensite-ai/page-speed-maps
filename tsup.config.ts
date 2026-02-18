import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "core/index": "src/core/index.ts",
    "core/MapLibre": "src/core/MapLibre.tsx",
    "utils/index": "src/utils/index.ts",
    "utils/getMapLibreStyleUrl": "src/utils/getMapLibreStyleUrl.ts",
    "utils/googleMapLinks": "src/utils/googleMapLinks.ts",
    "types/index": "src/types/index.ts"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "maplibre-gl", "react-map-gl", "react-map-gl/maplibre"]
});
