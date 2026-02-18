# @page-speed/maps Docs

## Package Goals

`@page-speed/maps` provides a reusable map component and helper utilities for DashTrack apps with explicit API key flow and tree-shakable exports.

## Export Surface

- `@page-speed/maps`
  - Main exports (`MapLibre`, utilities, shared types)
- `@page-speed/maps/core`
  - UI components (`MapLibre`, `DTMapLibreMap`)
- `@page-speed/maps/core/map-libre`
  - Direct component import
- `@page-speed/maps/utils`
  - Style + Google link utilities
- `@page-speed/maps/utils/style-url`
  - `getMapLibreStyleUrl`, `appendStadiaApiKey`
- `@page-speed/maps/utils/google-links`
  - Google map link helpers
- `@page-speed/maps/types`
  - Re-exported TypeScript contracts

## Migration From dt-cms Local Component

### Before

```tsx
import { MapLibre } from "@/components/map/MapLibre";
```

### After

```tsx
import { MapLibre } from "@page-speed/maps";

<MapLibre
  stadiaApiKey={process.env.NEXT_PUBLIC_STADIA_API ?? ""}
  viewState={{ latitude: 40.7128, longitude: -74.006, zoom: 12 }}
/>
```

## Required Prop Change

`stadiaApiKey` is now a required prop on `MapLibre`.

This removes the previous hardcoded key behavior and makes API key injection explicit at call sites.

## Build and Validation

```bash
pnpm install
pnpm build
pnpm type-check
pnpm test:ci
pnpm prepublish
```

## Notes

- Styles are resolved via `getMapLibreStyleUrl` and Stadia keys are appended only for Stadia-hosted styles.
- Non-Stadia URLs are passed through unchanged.
- MapLibre CSS is imported automatically by the component package.
