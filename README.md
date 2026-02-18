# @page-speed/maps

![PageSpeed Map React Component](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/290195/rk0entqaov45dlo90sjfzyudvggp/opensite-pagespeed-maps-dark-grid-product-banner.png&f=webp)

High-performance MapLibre primitives for DashTrack and OpenSite apps.

## Install

```bash
pnpm add @page-speed/maps maplibre-gl react-map-gl
```

## Quick Start

```tsx
import { MapLibre } from "@page-speed/maps";

export function Example() {
  return (
    <div style={{ width: "100%", height: 420 }}>
      <MapLibre
        stadiaApiKey={process.env.NEXT_PUBLIC_STADIA_API ?? ""}
        mapStyle="osm-bright"
        viewState={{ latitude: 40.7128, longitude: -74.006, zoom: 12 }}
        markers={[
          {
            id: "nyc",
            latitude: 40.7128,
            longitude: -74.006,
            label: "New York"
          }
        ]}
      />
    </div>
  );
}
```

## Why This Package

- Explicit Stadia auth: no hard-coded keys
- Auto-loads MapLibre CSS (no extra stylesheet import required)
- Tree-shakable exports (`@page-speed/maps/core`, `@page-speed/maps/utils`)
- Drop-in API compatibility with the current `MapLibre` component used in `dt-cms`

## API

- `MapLibre`, `DTMapLibreMap`
- `getMapLibreStyleUrl(value, stadiaApiKey)`
- `appendStadiaApiKey(styleUrl, stadiaApiKey)`
- `generateGoogleMapLink(latitude, longitude, zoom?)`
- `generateGoogleDirectionsLink(latitude, longitude)`

See `docs/README.md` for migration notes and full usage details.
