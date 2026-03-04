# AGENTS.md – Instructions for coding agents working on `@page-speed/maps`

This document provides AI coding agents with the context needed to work effectively on this library.

## Package Overview

`@page-speed/maps` is a tree-shakable React library providing MapLibre GL primitives for the DashTrack/OpenSite ecosystem. It wraps `react-map-gl` and `maplibre-gl` with opinionated defaults, auto-CSS loading, and geographic computation hooks.

**Package name**: `@page-speed/maps`  
**Registry**: npm (public)  
**Framework**: React 18+  
**Build tool**: tsup  
**Test runner**: Vitest  

---

## Project Structure

```
src/
├── index.ts              # Main barrel export (re-exports all)
├── core/
│   ├── index.ts          # Core barrel
│   └── MapLibre.tsx      # Main map component
├── hooks/
│   ├── index.ts          # Hooks barrel
│   ├── useGeoCenter.ts   # Geographic center computation
│   └── useDefaultZoom.ts # Auto-zoom computation
├── utils/
│   ├── index.ts          # Utils barrel
│   ├── getMapLibreStyleUrl.ts  # Style URL resolution
│   └── googleMapLinks.ts       # Google Maps link generators
└── types/
    ├── index.ts          # Types barrel
    └── map.ts            # All TypeScript interfaces
```

---

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build the package (generates dist/)
pnpm run build

# Watch mode for development
pnpm run dev

# Type-check without emitting
pnpm run type-check

# Run tests
pnpm run test

# Run tests in CI mode (no watch)
pnpm run test:ci

# Run tests with coverage
pnpm run test:coverage

# Analyze bundle size
pnpm run bundle-analysis

# Full prepublish check (build + type-check + test)
pnpm run prepublish
```

**Important**: Always run `pnpm run build && pnpm run type-check` after making changes to verify the build succeeds and types are correct.

---

## Export Architecture

This package uses **granular exports** for tree-shaking. Each subpath is a separate entry point in `tsup.config.ts` and `package.json` exports.

### Entry Points

| Subpath | Entry File | Purpose |
|---------|-----------|---------|
| `.` | `src/index.ts` | Full barrel (all exports) |
| `./core` | `src/core/index.ts` | MapLibre component only |
| `./core/map-libre` | `src/core/MapLibre.tsx` | Direct component import |
| `./hooks` | `src/hooks/index.ts` | All hooks |
| `./hooks/useGeoCenter` | `src/hooks/useGeoCenter.ts` | Center hook only |
| `./hooks/useDefaultZoom` | `src/hooks/useDefaultZoom.ts` | Zoom hook only |
| `./utils` | `src/utils/index.ts` | All utilities |
| `./utils/style-url` | `src/utils/getMapLibreStyleUrl.ts` | Style URL utils |
| `./utils/google-links` | `src/utils/googleMapLinks.ts` | Google link generators |
| `./types` | `src/types/index.ts` | TypeScript types only |

### Adding New Exports

When adding a new module:

1. Create the source file in the appropriate `src/` subdirectory
2. Export from the subdirectory's `index.ts` barrel
3. Re-export from `src/index.ts` (main barrel)
4. Add entry point to `tsup.config.ts`:
   ```typescript
   entry: {
     // existing entries...
     "subdir/newModule": "src/subdir/newModule.ts",
   }
   ```
5. Add export mapping to `package.json`:
   ```json
   "./subdir/newModule": {
     "types": "./dist/subdir/newModule.d.ts",
     "import": "./dist/subdir/newModule.js",
     "require": "./dist/subdir/newModule.cjs"
   }
   ```
6. Run `pnpm run build` to verify

---

## Key Components

### MapLibre Component (`src/core/MapLibre.tsx`)

The main map component. Key behaviors:

- **Auto-loads CSS**: Injects MapLibre stylesheet into `<head>` if not present
- **Stadia API key handling**: Automatically appends API key to Stadia URLs
- **Keyless fallback**: Falls back to Carto Positron if no API key provided
- **Controlled/uncontrolled**: Supports both patterns via `viewState` prop
- **Fly-to animations**: Smooth transitions when `viewState` changes externally
- **Marker normalization**: Accepts both `MapLibreMarker` and `BasicMarkerInput` formats
- **Drag support**: Markers can be draggable with auto-pan at viewport edges

### useGeoCenter Hook (`src/hooks/useGeoCenter.ts`)

Computes geographic midpoint using Cartesian 3D averaging:

```typescript
// Algorithm: Convert lat/lng to unit sphere (x,y,z), average, convert back
// Handles antimeridian crossing and polar coordinates correctly

function computeGeoCenter(coordinates: GeoCoordinate[]): GeoCenterResult | null;
function useGeoCenter(coordinates: GeoCoordinate[]): GeoCenterResult | null;
```

**Edge cases**:
- Empty array → `null`
- Single coordinate → returns that coordinate unchanged
- Coordinates at antimeridian (179° / -179°) → correct center near 180°

### useDefaultZoom Hook (`src/hooks/useDefaultZoom.ts`)

Computes optimal zoom using Mercator projection math:

```typescript
// Uses TILE_SIZE = 512 (MapLibre's native tile size)
// Converts bounds to pixel coordinates at zoom 0
// Solves for zoom where bounds fit viewport with padding

function computeDefaultZoom(options: DefaultZoomOptions): number | null;
function useDefaultZoom(options: DefaultZoomOptions): number | null;
```

**Edge cases**:
- Empty array → `null`
- Single coordinate → returns `maxZoom`
- All identical coordinates → returns `maxZoom`
- Zero/negative dimensions → `null` or `minZoom`
- Padding larger than viewport → `minZoom`

---

## Type Definitions

All types are in `src/types/map.ts`. Key types:

```typescript
// Coordinate formats (note the property name differences)
type MapCoordinate = { latitude: number; longitude: number };
type GeoCoordinate = { lat: number; lng: number };

// View state
type MapViewState = { latitude: number; longitude: number; zoom: number };

// Marker inputs (both formats accepted by MapLibre component)
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

type MapLibreMarker = {
  id: string | number;
  lat: number;
  lng: number;
  element?: (() => React.ReactNode) | React.ReactNode;
  onClick?: () => void;
  color?: string;
  label?: string;
  draggable?: boolean;
};
```

**Important**: The codebase uses two coordinate formats:
- `latitude/longitude` for component props and `MapCoordinate`
- `lat/lng` for `GeoCoordinate` (hooks) and internal `MapLibreMarker`

---

## Testing Guidelines

Tests are in the `tests/` directory using Vitest.

```bash
# Run all tests
pnpm run test

# Run specific test file
pnpm run test tests/useGeoCenter.test.ts

# Run with coverage
pnpm run test:coverage
```

### Test Patterns

```typescript
import { describe, it, expect } from "vitest";
import { computeGeoCenter } from "../src/hooks/useGeoCenter";

describe("computeGeoCenter", () => {
  it("returns null for empty array", () => {
    expect(computeGeoCenter([])).toBeNull();
  });

  it("returns input coordinate for single item", () => {
    const result = computeGeoCenter([{ lat: 33.45, lng: -112.07 }]);
    expect(result).toEqual({ lat: 33.45, lng: -112.07 });
  });
});
```

### Key Test Cases for Hooks

**useGeoCenter**:
- Empty array → `null`
- Single coordinate → returns same coordinate
- Two symmetric coordinates → returns midpoint
- Antimeridian crossing (179° and -179°) → center near 180°
- Phoenix area markers → known expected center

**useDefaultZoom**:
- Empty array → `null`
- Single coordinate → `maxZoom`
- Two markers in 600x400 viewport → zoom ~10-11
- Opposite sides of globe → zoom ~1
- Identical coordinates → `maxZoom`
- Small container → lower zoom than large container

---

## Dependencies

### Peer Dependencies (must be installed by consumer)
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

### Runtime Dependencies
- `maplibre-gl` ^5.x - Core map rendering
- `react-map-gl` ^8.x - React bindings for MapLibre

### Dev Dependencies
- `tsup` - Build tool
- `typescript` - Type checking
- `vitest` - Test runner
- `@testing-library/react` - Component testing

---

## Common Tasks

### Adding a New Hook

1. Create `src/hooks/useNewHook.ts`:
   ```typescript
   import { useMemo } from "react";

   export interface NewHookOptions { /* ... */ }
   export interface NewHookResult { /* ... */ }

   export function computeNewHook(options: NewHookOptions): NewHookResult | null {
     // Pure function implementation
   }

   export function useNewHook(options: NewHookOptions): NewHookResult | null {
     return useMemo(() => computeNewHook(options), [/* deps */]);
   }
   ```

2. Export from `src/hooks/index.ts`:
   ```typescript
   export { useNewHook, computeNewHook, type NewHookOptions, type NewHookResult } from "./useNewHook";
   ```

3. Re-export from `src/index.ts`

4. Add to `tsup.config.ts` entry points

5. Add to `package.json` exports

6. Write tests in `tests/useNewHook.test.ts`

7. Run `pnpm run build && pnpm run type-check && pnpm run test:ci`

### Adding a New Utility

Same pattern as hooks, but in `src/utils/` directory.

### Modifying the MapLibre Component

The component is in `src/core/MapLibre.tsx`. Key areas:

- **Props**: Add to `MapLibreProps` in `src/types/map.ts`
- **Marker rendering**: `markerElements` useMemo
- **Style resolution**: `resolvedMapStyleUrl` useMemo
- **Event handlers**: `handleMove`, `handleMoveEnd`, etc.

---

## Conventions

### Code Style

- Use `useMemo` for expensive computations
- Export both pure function (`computeX`) and hook (`useX`) versions
- Use explicit return types on exported functions
- Prefer `interface` over `type` for object shapes

### Naming

- Hooks: `useX` (e.g., `useGeoCenter`)
- Pure functions: `computeX` (e.g., `computeGeoCenter`)
- Types: PascalCase (e.g., `GeoCoordinate`)
- Files: camelCase matching export name (e.g., `useGeoCenter.ts`)

### Package.json Exports

Always use this structure for each export:
```json
"./path": {
  "types": "./dist/path.d.ts",
  "import": "./dist/path.js",
  "require": "./dist/path.cjs"
}
```

---

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf dist && pnpm run build
```

### Type Errors

```bash
# Check types without building
pnpm run type-check
```

### Test Failures

```bash
# Run specific test with verbose output
pnpm run test tests/filename.test.ts -- --reporter=verbose
```

### Missing Exports

If consumers report "export not found":
1. Verify export in source barrel (`src/*/index.ts`)
2. Verify entry point in `tsup.config.ts`
3. Verify export mapping in `package.json`
4. Rebuild: `pnpm run build`

---

## Consumer Libraries

This package is consumed by:

- **`@opensite/ui`**: UI component library (GeoMap component)
- **`dt-cms`**: Main DashTrack CMS application

When making breaking changes, coordinate with these downstream consumers.

---

## Version Bumping

This package uses semantic versioning. After making changes:

1. Update version in `package.json`
2. Run full verification: `pnpm run prepublish`
3. Commit and tag

**Breaking changes** (major version):
- Removing exports
- Changing function signatures
- Changing type shapes

**New features** (minor version):
- Adding new hooks/utilities
- Adding optional props

**Bug fixes** (patch version):
- Fixing incorrect behavior
- Performance improvements
