# API Reference

## `MapLibre`

```tsx
<MapLibre
  stadiaApiKey={string}
  viewState={{ latitude, longitude, zoom }}
  mapStyle="osm-bright"
  markers={[{ id, latitude, longitude }]}
/>
```

### Key Props

- `stadiaApiKey` (required): Stadia Maps API key used for built-in Stadia styles.
- `mapStyle` (optional): Built-in style key or URL string.
- `styleUrl` (optional): Explicit style URL (wins over `mapStyle`).
- `viewState` / `onViewStateChange`: Controlled view state hooks.
- `markers`: Accepts both `{ lat, lng }` and `{ latitude, longitude }` marker shapes.
- `onClick`: Returns `{ latitude, longitude }` map coordinate.
- `onMarkerDrag`: Returns marker id + updated coordinate.

## Style Utilities

### `getMapLibreStyleUrl(value, stadiaApiKey)`

Resolves supported style keys to full URLs and appends `api_key` for Stadia URLs.

Supported keys:
- `default`
- `osm-bright`
- `alidade-smooth`
- `alidade-smooth-dark`
- `stadia-outdoors`
- `stamen-toner`
- `stamen-terrain`
- `stamen-watercolor`
- `maplibre-default`

### `appendStadiaApiKey(styleUrl, stadiaApiKey)`

Appends the key only if the URL host is `tiles.stadiamaps.com`.

## Google Helpers

- `generateGoogleMapLink(latitude, longitude, zoom?)`
- `generateGoogleDirectionsLink(latitude, longitude)`
