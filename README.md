# @page-speed/maps

## High-performance MapLibre primitives. An open source tool by [OpenSite AI](https://opensite.ai)

![PageSpeed Map React Component](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/290195/rk0entqaov45dlo90sjfzyudvggp/opensite-pagespeed-maps-dark-grid-product-banner.png&f=webp)

<br />

[![npm version](https://img.shields.io/npm/v/@page-speed/maps?style=for-the-badge)](https://www.npmjs.com/package/@page-speed/maps)
[![npm downloads](https://img.shields.io/npm/dm/@page-speed/maps?style=for-the-badge)](https://www.npmjs.com/package/@page-speed/maps)
[![License](https://img.shields.io/npm/l/@page-speed/maps?style=for-the-badge)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)](./tsconfig.json)
[![Tree-Shakeable](https://img.shields.io/badge/Tree%20Shakeable-Yes-brightgreen?style=for-the-badge)](#tree-shaking)

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

- **Explicit Stadia auth**: no hard-coded keys
- **Auto-loads MapLibre CSS**: no extra stylesheet import required
- **Keyless fallback map style**: if no Stadia key is available, roads/landmarks still render via Carto Positron
- **Tree-shakable exports**: import only what you need
- **Auto-centering hooks**: compute optimal center and zoom for any set of coordinates
- **Drop-in API compatibility**: works with the `MapLibre` component used in `dt-cms`

---

## Table of Contents

- [Components](#components)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Types](#types)
- [Tree Shaking](#tree-shaking)
- [Map Styles](#map-styles)
- [Advanced Usage](#advanced-usage)

---

## Components

### `MapLibre` / `DTMapLibreMap`

The main map component. Renders a MapLibre GL map with markers, controls, and full interactivity.

```tsx
import { MapLibre } from "@page-speed/maps";

<MapLibre
  stadiaApiKey="your-api-key"
  mapStyle="osm-bright"
  viewState={{ latitude: 33.4484, longitude: -112.074, zoom: 10 }}
  markers={[
    { id: "phx", latitude: 33.4484, longitude: -112.074, label: "Phoenix" }
  ]}
  showNavigationControl
  showGeolocateControl
  onClick={(coord) => console.log("Clicked:", coord)}
  onMoveEnd={(center, zoom, bounds) => console.log("Moved:", center, zoom)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stadiaApiKey` | `string` | **required** | Your Stadia Maps API key |
| `mapStyle` | `string` | `"osm-bright"` | Built-in style name or custom style URL |
| `viewState` | `Partial<MapViewState>` | - | Controlled view state (lat, lng, zoom) |
| `onViewStateChange` | `(state) => void` | - | Callback when view state changes |
| `markers` | `Array<MapLibreMarker \| BasicMarkerInput>` | `[]` | Array of markers to display |
| `center` | `{ lat, lng }` | - | Initial center (alternative to viewState) |
| `zoom` | `number` | `14` | Initial zoom level |
| `styleUrl` | `string` | - | Custom style URL (overrides mapStyle) |
| `onClick` | `(coord) => void` | - | Map click handler |
| `onMoveEnd` | `(center, zoom, bounds) => void` | - | Called when map stops moving |
| `onMarkerDrag` | `(markerId, coord) => void` | - | Called when draggable marker moves |
| `showNavigationControl` | `boolean` | `true` | Show zoom/rotation controls |
| `showGeolocateControl` | `boolean` | `false` | Show user location button |
| `navigationControlPosition` | `MapControlPosition` | `"bottom-right"` | Position of nav controls |
| `geolocateControlPosition` | `MapControlPosition` | `"top-left"` | Position of geolocate button |
| `flyToOptions` | `MapLibreFlyToOptions` | `{}` | Animation options for flyTo |
| `className` | `string` | - | CSS class for wrapper div |
| `style` | `CSSProperties` | - | Inline styles for wrapper |
| `children` | `ReactNode` | - | Additional map layers/overlays |
| `mapLibreCssHref` | `string` | jsDelivr CDN | Custom MapLibre CSS URL |

---

## Hooks

### `useGeoCenter`

Computes the geographic center of an array of coordinates using the Cartesian 3D averaging method. Handles antimeridian crossing and polar coordinates correctly.

```tsx
import { useGeoCenter } from "@page-speed/maps/hooks/useGeoCenter";
// or
import { useGeoCenter } from "@page-speed/maps";

const markers = [
  { lat: 33.4585, lng: -112.0715 },  // Downtown Phoenix
  { lat: 33.6510, lng: -111.9244 },  // Scottsdale
  { lat: 33.3062, lng: -111.8413 },  // Mesa
];

const center = useGeoCenter(markers);
// Result: { lat: 33.4719, lng: -111.9457 }
```

#### API

```typescript
function useGeoCenter(coordinates: GeoCoordinate[]): GeoCenterResult | null;
function computeGeoCenter(coordinates: GeoCoordinate[]): GeoCenterResult | null;

interface GeoCoordinate {
  lat: number;
  lng: number;
}

interface GeoCenterResult {
  lat: number;
  lng: number;
}
```

#### Behavior

- **Empty array**: Returns `null`
- **Single coordinate**: Returns that coordinate
- **Multiple coordinates**: Returns the geographic midpoint

---

### `useDefaultZoom`

Computes the optimal zoom level to fit all coordinates within a given viewport, using Mercator projection math. Uses MapLibre's native 512px tile size.

```tsx
import { useDefaultZoom } from "@page-speed/maps/hooks/useDefaultZoom";
// or
import { useDefaultZoom } from "@page-speed/maps";

const markers = [
  { lat: 33.4585, lng: -112.0715 },
  { lat: 33.6510, lng: -111.9244 },
];

const zoom = useDefaultZoom({
  coordinates: markers,
  mapWidth: 600,
  mapHeight: 400,
  padding: 50,
  maxZoom: 16,
  minZoom: 1,
});
// Result: ~10.5 (fits both markers with padding)
```

#### API

```typescript
function useDefaultZoom(options: DefaultZoomOptions): number | null;
function computeDefaultZoom(options: DefaultZoomOptions): number | null;

interface DefaultZoomOptions {
  coordinates: GeoCoordinate[];
  mapWidth: number;
  mapHeight: number;
  padding?: number;   // default: 50
  maxZoom?: number;   // default: 18
  minZoom?: number;   // default: 1
}
```

#### Behavior

- **Empty array**: Returns `null`
- **Single coordinate**: Returns `maxZoom`
- **Multiple coordinates**: Returns the highest zoom that fits all markers with padding
- **Invalid dimensions**: Returns `null` or `minZoom`

---

### Combined Usage: Auto-Centering Map

```tsx
import { MapLibre, useGeoCenter, useDefaultZoom } from "@page-speed/maps";

function AutoCenteringMap({ locations }) {
  const coordinates = locations.map(loc => ({
    lat: loc.latitude,
    lng: loc.longitude,
  }));

  const center = useGeoCenter(coordinates);
  const zoom = useDefaultZoom({
    coordinates,
    mapWidth: 800,
    mapHeight: 600,
    padding: 60,
  });

  if (!center) return <div>No locations to display</div>;

  return (
    <div style={{ width: 800, height: 600 }}>
      <MapLibre
        stadiaApiKey={process.env.NEXT_PUBLIC_STADIA_API ?? ""}
        viewState={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: zoom ?? 10,
        }}
        markers={locations.map((loc, i) => ({
          id: loc.id ?? i,
          latitude: loc.latitude,
          longitude: loc.longitude,
          label: loc.name,
        }))}
      />
    </div>
  );
}
```

---

## Utilities

### `getMapLibreStyleUrl(style, stadiaApiKey)`

Resolves a style name or URL to a fully-qualified MapLibre style URL with authentication.

```typescript
import { getMapLibreStyleUrl } from "@page-speed/maps/utils/style-url";

const url = getMapLibreStyleUrl("osm-bright", "your-api-key");
// "https://tiles.stadiamaps.com/styles/osm_bright.json?api_key=your-api-key"

const fallback = getMapLibreStyleUrl("osm-bright", "");
// "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" (keyless fallback)
```

### `appendStadiaApiKey(styleUrl, stadiaApiKey)`

Appends the Stadia API key to a style URL if it's a Stadia Maps URL.

```typescript
import { appendStadiaApiKey } from "@page-speed/maps/utils/style-url";

const url = appendStadiaApiKey(
  "https://tiles.stadiamaps.com/styles/osm_bright.json",
  "your-api-key"
);
// "https://tiles.stadiamaps.com/styles/osm_bright.json?api_key=your-api-key"
```

### `generateGoogleMapLink(latitude, longitude, zoom?)`

Generates a Google Maps URL for a location.

```typescript
import { generateGoogleMapLink } from "@page-speed/maps/utils/google-links";

const url = generateGoogleMapLink(33.4484, -112.074, 15);
// "https://www.google.com/maps/@33.4484,-112.074,15z"
```

### `generateGoogleDirectionsLink(latitude, longitude)`

Generates a Google Maps directions URL to a destination.

```typescript
import { generateGoogleDirectionsLink } from "@page-speed/maps/utils/google-links";

const url = generateGoogleDirectionsLink(33.4484, -112.074);
// "https://www.google.com/maps/dir/?api=1&destination=33.4484,-112.074"
```

---

## Types

All types are exported from `@page-speed/maps/types` or the main entry point:

```typescript
import type {
  BasicMarkerInput,
  MapControlPosition,
  MapCoordinate,
  MapLibreFlyToOptions,
  MapLibreMarker,
  MapLibreProps,
  MapViewState,
  GeoCoordinate,
  GeoCenterResult,
  DefaultZoomOptions,
  MapLibreBuiltInStyle,
} from "@page-speed/maps";
```

### Key Types

```typescript
type MapViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type GeoCoordinate = {
  lat: number;
  lng: number;
};

type BasicMarkerInput = {
  id?: string | number;
  latitude: number;
  longitude: number;
  color?: string;
  draggable?: boolean;
  label?: string;
  element?: (() => React.ReactNode) | React.ReactNode;
  onClick?: () => void;
};

type MapControlPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
```

---

## Tree Shaking

This package supports granular tree-shaking. Import only what you need:

```typescript
// Full bundle (all exports)
import { MapLibre, useGeoCenter, useDefaultZoom } from "@page-speed/maps";

// Just the component
import { MapLibre } from "@page-speed/maps/core";

// Just hooks (tree-shakable)
import { useGeoCenter, useDefaultZoom } from "@page-speed/maps/hooks";

// Individual hooks (maximum tree-shaking)
import { useGeoCenter } from "@page-speed/maps/hooks/useGeoCenter";
import { useDefaultZoom } from "@page-speed/maps/hooks/useDefaultZoom";

// Just utilities
import { getMapLibreStyleUrl } from "@page-speed/maps/utils/style-url";
import { generateGoogleMapLink } from "@page-speed/maps/utils/google-links";

// Just types
import type { MapLibreProps } from "@page-speed/maps/types";
```

---

## Map Styles

Built-in style presets (requires Stadia API key):

| Style Name | Description |
|------------|-------------|
| `osm-bright` | Clean, bright OpenStreetMap style (default) |
| `alidade-smooth` | Modern, smooth cartography |
| `alidade-smooth-dark` | Dark theme variant |
| `stadia-outdoors` | Outdoor/terrain focused |
| `stamen-toner` | High-contrast black & white |
| `stamen-terrain` | Terrain with hillshading |
| `stamen-watercolor` | Artistic watercolor style |
| `maplibre-default` | Carto Positron (no API key required) |

```tsx
<MapLibre mapStyle="stamen-terrain" stadiaApiKey="..." />
```

Or use a custom style URL:

```tsx
<MapLibre styleUrl="https://your-tiles.com/style.json" stadiaApiKey="..." />
```

---

## Advanced Usage

### Custom Markers

Pass a custom React element for full control over marker rendering:

```tsx
<MapLibre
  stadiaApiKey="..."
  markers={[
    {
      id: "custom",
      latitude: 33.4484,
      longitude: -112.074,
      element: (
        <div className="custom-marker">
          <img src="/pin.svg" alt="Location" />
          <span>Phoenix HQ</span>
        </div>
      ),
    },
  ]}
/>
```

### Draggable Markers

```tsx
<MapLibre
  stadiaApiKey="..."
  markers={[
    {
      id: "draggable",
      latitude: 33.4484,
      longitude: -112.074,
      draggable: true,
      label: "Drag me!",
    },
  ]}
  onMarkerDrag={(markerId, coord) => {
    console.log(`Marker ${markerId} moved to:`, coord);
  }}
/>
```

### Controlled View State

```tsx
function ControlledMap() {
  const [viewState, setViewState] = useState({
    latitude: 33.4484,
    longitude: -112.074,
    zoom: 12,
  });

  return (
    <>
      <MapLibre
        stadiaApiKey="..."
        viewState={viewState}
        onViewStateChange={setViewState}
      />
      <button onClick={() => setViewState(prev => ({ ...prev, zoom: prev.zoom + 1 }))}>
        Zoom In
      </button>
    </>
  );
}
```

### Fly To Animation

```tsx
<MapLibre
  stadiaApiKey="..."
  viewState={viewState}
  flyToOptions={{
    speed: 1.2,
    curve: 1.5,
    easing: (t) => t,
  }}
/>
```

### Composing with UI Libraries

This package provides the core map primitives. For feature-rich components with clustering, info windows, and styled markers, see `@opensite/ui` which builds on top of `@page-speed/maps`:

```tsx
// In @opensite/ui (consumer library)
import { useGeoCenter, useDefaultZoom, type GeoCoordinate } from "@page-speed/maps/hooks";

function GeoMap({ markers, clusters, defaultViewState }) {
  // Collect all coordinates
  const allCoordinates: GeoCoordinate[] = [
    ...markers.map(m => ({ lat: m.latitude, lng: m.longitude })),
    ...clusters.map(c => ({ lat: c.latitude, lng: c.longitude })),
  ];

  // Auto-compute center and zoom
  const geoCenter = useGeoCenter(allCoordinates);
  const defaultZoom = useDefaultZoom({
    coordinates: allCoordinates,
    mapWidth: 600,
    mapHeight: 520,
    padding: 60,
  });

  return (
    <MapLibre
      viewState={{
        latitude: defaultViewState?.latitude ?? geoCenter?.lat ?? 0,
        longitude: defaultViewState?.longitude ?? geoCenter?.lng ?? 0,
        zoom: defaultViewState?.zoom ?? defaultZoom ?? 10,
      }}
      // ... clustering, custom markers, info windows, etc.
    />
  );
}
```

---

## API Reference

### Exports Summary

| Export | Path | Description |
|--------|------|-------------|
| `MapLibre` | `@page-speed/maps` | Main map component |
| `DTMapLibreMap` | `@page-speed/maps` | Alias for MapLibre |
| `useGeoCenter` | `@page-speed/maps/hooks/useGeoCenter` | Geographic center hook |
| `computeGeoCenter` | `@page-speed/maps/hooks/useGeoCenter` | Pure function version |
| `useDefaultZoom` | `@page-speed/maps/hooks/useDefaultZoom` | Auto-zoom hook |
| `computeDefaultZoom` | `@page-speed/maps/hooks/useDefaultZoom` | Pure function version |
| `getMapLibreStyleUrl` | `@page-speed/maps/utils/style-url` | Style URL resolver |
| `appendStadiaApiKey` | `@page-speed/maps/utils/style-url` | API key appender |
| `generateGoogleMapLink` | `@page-speed/maps/utils/google-links` | Google Maps link |
| `generateGoogleDirectionsLink` | `@page-speed/maps/utils/google-links` | Google Directions link |

---

## License

BSD-3-Clause. See [LICENSE](./LICENSE) for details.

---

## New: Feature-Rich Components

### `GeoMap`

Full-featured map component with markers, clusters, rich media panels, and automatic view calculation.

```tsx
import { GeoMap, createMapMarkerElement } from "@page-speed/maps";
import type { GeoMapMarker } from "@page-speed/maps";

const markers: GeoMapMarker[] = [
  {
    id: 'office',
    latitude: 40.7128,
    longitude: -74.0060,
    title: 'New York Office',
    summary: 'Our headquarters in downtown Manhattan',
    locationLine: '123 Broadway, New York, NY 10001',
    hoursLine: 'Mon-Fri: 9:00 AM - 6:00 PM',
    mediaItems: [
      { id: '1', src: '/office.jpg', alt: 'Office' },
    ],
    markerElement: createMapMarkerElement({ size: 'lg' }),
    actions: [
      {
        label: 'Get Directions',
        href: 'https://maps.app.goo.gl/example',
      },
    ],
  },
];

<GeoMap
  markers={markers}
  stadiaApiKey="your-key"
  panelPosition="bottom-left"
  showNavigationControl
/>
```

**Key Features:**
- ✅ Auto-calculated center and zoom from markers
- ✅ Rich media carousels (images/videos)
- ✅ Interactive marker panels
- ✅ Clustering support
- ✅ Custom marker elements
- ✅ Action buttons and links

[→ Full GeoMap Documentation](./docs/EXAMPLES.md#markers-with-rich-panels)

### `MapMarker`

Beautiful concentric circle markers with hover and selection states.

```tsx
import { MapMarker, NeutralMapMarker, createMapMarkerElement } from "@page-speed/maps";

// Direct usage
<MapMarker
  size="lg"
  isSelected
  dotColor="#1E40AF"
  innerRingColor="#3B82F6"
  middleRingColor="#93C5FD"
  outerRingColor="#DBEAFE"
/>

// With GeoMap
const markers = [{
  id: 'loc-1',
  latitude: 40.7128,
  longitude: -74.0060,
  markerElement: createMapMarkerElement({ size: 'lg' }),
}];
```

**Sizes:** `sm` | `md` | `lg`  
**Pre-configured:** `NeutralMapMarker` for neutral gray design

[→ MapMarker Examples](./docs/EXAMPLES.md#custom-marker-elements)

---

## Migration from @opensite/ui

If you're migrating map components from `@opensite/ui` to `@page-speed/maps`, see our comprehensive migration guide:

**[→ Migration Guide](./docs/MIGRATION_GUIDE.md)**

**Key Changes:**
- ✅ Fixed zoom/centering bugs
- ✅ New MapMarker components
- ✅ Better tree-shakability
- ✅ Optional peer dependencies for icons/images

---

## Documentation

- **[Examples](./docs/EXAMPLES.md)** - Complete code examples
- **[Migration Guide](./docs/MIGRATION_GUIDE.md)** - Migrating from @opensite/ui
- **[API Reference](./docs/API.md)** - Full API documentation
- **[Ecosystem Guidelines](./docs/ECOSYSTEM_GUIDELINES.md)** - Performance standards

---

## Related Packages

- [@page-speed/img](https://www.npmjs.com/package/@page-speed/img) - Optimized image component
- [@page-speed/video](https://www.npmjs.com/package/@opensite/video) - Performance video component
- [@page-speed/icon](https://www.npmjs.com/package/@page-speed/icon) - Icon system
- [@page-speed/forms](https://www.npmjs.com/package/@page-speed/forms) - Form components

---

Made with ❤️ for the DashTrack Platform

