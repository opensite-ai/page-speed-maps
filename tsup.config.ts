import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "core/index": "src/core/index.ts",
    "core/MapLibre": "src/core/MapLibre.tsx",
    "utils/index": "src/utils/index.ts",
    "utils/getMapLibreStyleUrl": "src/utils/getMapLibreStyleUrl.ts",
    "utils/googleMapLinks": "src/utils/googleMapLinks.ts",
    "utils/cn": "src/utils/cn.ts",
    "utils/simple-pressable": "src/utils/simple-pressable.tsx",
    "types/index": "src/types/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "hooks/useGeoCenter": "src/hooks/useGeoCenter.ts",
    "hooks/useDefaultZoom": "src/hooks/useDefaultZoom.ts",
    "components/index": "src/components/index.ts",
    "components/geo-map": "src/components/geo-map.tsx",
    "components/map-marker": "src/components/map-marker.tsx"
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  splitting: false,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom", "maplibre-gl", "react-map-gl", "react-map-gl/maplibre"]
});
