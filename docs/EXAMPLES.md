# Examples - @page-speed/maps

Complete examples showing all features of the @page-speed/maps library.

## Table of Contents

1. [Basic Map](#basic-map)
2. [Markers with Rich Panels](#markers-with-rich-panels)
3. [Custom Marker Elements](#custom-marker-elements)
4. [Clustering](#clustering)
5. [Media Carousels](#media-carousels)
6. [Interactive Actions](#interactive-actions)
7. [Controlled State](#controlled-state)
8. [Custom Styles](#custom-styles)

---

## Basic Map

Simple map with automatic center/zoom:

```tsx
import { GeoMap } from "@page-speed/maps";

export function BasicMap() {
  const markers = [
    {
      id: 'sf',
      latitude: 37.7749,
      longitude: -122.4194,
      title: 'San Francisco Office',
    },
  ];

  return (
    <GeoMap
      stadiaApiKey="your-api-key"
      markers={markers}
    />
  );
}
```

---

## Markers with Rich Panels

Markers with eyebrows, summaries, locations, and hours:

```tsx
import { GeoMap, type GeoMapMarker } from "@page-speed/maps";

export function RichPanelMap() {
  const markers: GeoMapMarker[] = [
    {
      id: 'downtown',
      latitude: 33.4585232,
      longitude: -112.0715382,
      eyebrow: 'Phoenix Flagship',
      title: 'Downtown PHX Craft',
      summary: 'A central downtown gathering space with elevated craft cocktails...',
      locationLine: '128 E Roosevelt St, Phoenix, AZ 85004',
      locationUrl: 'https://maps.app.goo.gl/example',
      hoursLine: 'Mon-Sun: 11:00 AM - 12:00 AM',
      pinColor: '#f97316',
    },
  ];

  return (
    <GeoMap
      markers={markers}
      stadiaApiKey="your-api-key"
      panelPosition="bottom-left"
      markerFocusZoom={14}
    />
  );
}
```

---

## Custom Marker Elements

Use the MapMarker component for beautiful concentric circles:

```tsx
import {
  GeoMap,
  MapMarker,
  NeutralMapMarker,
  createMapMarkerElement,
} from "@page-speed/maps";

export function CustomMarkersMap() {
  const markers = [
    {
      id: 'loc-1',
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'Custom Blue Marker',
      // Option 1: Inline marker element
      markerElement: ({ isSelected }) => (
        <MapMarker
          isSelected={isSelected}
          size="lg"
          dotColor="#1E40AF"
          innerRingColor="#3B82F6"
          middleRingColor="#93C5FD"
          outerRingColor="#DBEAFE"
        />
      ),
    },
    {
      id: 'loc-2',
      latitude: 40.7580,
      longitude: -73.9855,
      title: 'Neutral Gray Marker',
      // Option 2: Pre-configured neutral marker
      markerElement: ({ isSelected }) => (
        <NeutralMapMarker isSelected={isSelected} size="md" />
      ),
    },
    {
      id: 'loc-3',
      latitude: 40.7489,
      longitude: -73.9680,
      title: 'Factory Function Marker',
      // Option 3: Factory function (most concise)
      markerElement: createMapMarkerElement({
        size: 'sm',
        dotColor: '#10B981',
        innerRingColor: '#34D399',
        middleRingColor: '#6EE7B7',
        outerRingColor: '#A7F3D0',
      }),
    },
  ];

  return <GeoMap markers={markers} stadiaApiKey="your-api-key" />;
}
```

---

## Clustering

Group nearby markers into clusters:

```tsx
import { GeoMap, createMapMarkerElement } from "@page-speed/maps";
import type { GeoMapCluster } from "@page-speed/maps";

export function ClusteringMap() {
  const clusters: GeoMapCluster[] = [
    {
      id: 'northeast-cluster',
      label: 'Northeast Region',
      title: 'East Coast Locations',
      summary: 'Our 3 east coast offices',
      pinColor: '#3B82F6',
      markers: [
        {
          id: 'nyc',
          latitude: 40.7128,
          longitude: -74.0060,
          title: 'New York Office',
          summary: 'Headquarters',
        },
        {
          id: 'boston',
          latitude: 42.3601,
          longitude: -71.0589,
          title: 'Boston Office',
          summary: 'R&D Center',
        },
        {
          id: 'philly',
          latitude: 39.9526,
          longitude: -75.1652,
          title: 'Philadelphia Office',
          summary: 'Operations Hub',
        },
      ],
    },
  ];

  return (
    <GeoMap
      clusters={clusters}
      stadiaApiKey="your-api-key"
      clusterFocusZoom={6}
      markerFocusZoom={14}
    />
  );
}
```

---

## Media Carousels

Rich media in marker panels with carousel navigation:

```tsx
import { GeoMap } from "@page-speed/maps";
import { Img } from "@page-speed/img";
import { DynamicIcon } from "@page-speed/icon";
import type { GeoMapMarker } from "@page-speed/maps";

export function MediaCarouselMap() {
  const markers: GeoMapMarker[] = [
    {
      id: 'restaurant',
      latitude: 33.6510546,
      longitude: -111.924473,
      eyebrow: 'Scottsdale Location',
      title: 'North Scottsdale',
      summary: 'Modern dining with premium cocktails and weekend experiences',
      locationLine: '17797 N Scottsdale Rd, Scottsdale, AZ 85255',
      hoursLine: 'Mon-Sun: 10:00 AM - 11:00 PM',
      mediaItems: [
        {
          id: 'img-1',
          src: '/images/interior.jpg',
          alt: 'Restaurant interior',
        },
        {
          id: 'img-2',
          src: '/images/food.jpg',
          alt: 'Fine dining',
        },
        {
          id: 'vid-1',
          src: '/videos/ambiance.mp4',
          type: 'video',
          poster: '/images/poster.jpg',
        },
      ],
    },
  ];

  return (
    <GeoMap
      markers={markers}
      stadiaApiKey="your-api-key"
      IconComponent={DynamicIcon}
      ImgComponent={Img}
      panelPosition="top-left"
    />
  );
}
```

---

## Interactive Actions

Add buttons and actions to marker panels:

```tsx
import { GeoMap } from "@page-speed/maps";
import { DynamicIcon } from "@page-speed/icon";
import type { GeoMapMarker } from "@page-speed/maps";

export function InteractiveMap() {
  const handleReservation = () => {
    console.log('Opening reservation form...');
  };

  const markers: GeoMapMarker[] = [
    {
      id: 'restaurant',
      latitude: 40.7128,
      longitude: -74.0060,
      title: 'Fine Dining Restaurant',
      summary: 'Award-winning cuisine in the heart of the city',
      actions: [
        {
          label: 'Directions',
          href: 'https://maps.app.goo.gl/example',
          icon: <DynamicIcon name="lucide/navigation" size={14} />,
          variant: 'default',
          size: 'md',
        },
        {
          label: 'Call Us',
          href: 'tel:+14322386131',
          icon: <DynamicIcon name="lucide/phone" size={14} />,
          variant: 'outline',
          size: 'md',
        },
        {
          label: 'Reserve Table',
          onClick: handleReservation,
          icon: <DynamicIcon name="lucide/calendar" size={14} />,
          variant: 'default',
          size: 'md',
        },
      ],
    },
  ];

  return (
    <GeoMap
      markers={markers}
      stadiaApiKey="your-api-key"
      IconComponent={DynamicIcon}
    />
  );
}
```

---

## Controlled State

Control map view state and selection programmatically:

```tsx
import { useState, useCallback } from 'react';
import { GeoMap } from "@page-speed/maps";
import type { GeoMapSelection, MapViewState } from "@page-speed/maps";

export function ControlledMap() {
  const [viewState, setViewState] = useState<Partial<MapViewState>>({
    latitude: 37.7749,
    longitude: -122.4194,
    zoom: 12,
  });

  const [selection, setSelection] = useState<GeoMapSelection>({
    type: 'none',
  });

  const handleViewStateChange = useCallback((state: Partial<MapViewState>) => {
    setViewState(state);
    console.log('View state changed:', state);
  }, []);

  const handleSelectionChange = useCallback((sel: GeoMapSelection) => {
    setSelection(sel);
    if (sel.type === 'marker') {
      console.log('Selected marker:', sel.marker?.title);
    }
  }, []);

  const handleFlyToSF = () => {
    setViewState({
      latitude: 37.7749,
      longitude: -122.4194,
      zoom: 14,
    });
  };

  const markers = [
    { id: 'sf', latitude: 37.7749, longitude: -122.4194, title: 'San Francisco' },
    { id: 'oak', latitude: 37.8044, longitude: -122.2712, title: 'Oakland' },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={handleFlyToSF}>Fly to San Francisco</button>
        <div>Current zoom: {viewState.zoom?.toFixed(2)}</div>
        {selection.type !== 'none' && (
          <div>Selected: {selection.marker?.title}</div>
        )}
      </div>

      <GeoMap
        markers={markers}
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        onSelectionChange={handleSelectionChange}
        stadiaApiKey="your-api-key"
      />
    </div>
  );
}
```

---

## Custom Styles

Customize map appearance and styles:

```tsx
import { GeoMap } from "@page-speed/maps";

export function CustomStyleMap() {
  return (
    <GeoMap
      markers={[
        { id: '1', latitude: 40.7128, longitude: -74.0060, title: 'NYC' },
      ]}
      stadiaApiKey="your-api-key"
      mapStyle="alidade-smooth-dark"  // Dark theme
      className="rounded-3xl shadow-2xl"
      mapWrapperClassName="h-[600px]"
      panelClassName="backdrop-blur-lg bg-white/90 dark:bg-black/90"
      showNavigationControl={true}
      showGeolocateControl={true}
      navigationControlPosition="bottom-right"
    />
  );
}
```

### Available Map Styles

- `osm-bright` (default): Light OpenStreetMap style
- `osm-bright-smooth`: Smoothed light style
- `outdoors`: Outdoor/terrain style
- `alidade-smooth`: Clean modern style
- `alidade-smooth-dark`: Dark modern style

---

## Complete Production Example

Full-featured map combining all features:

```tsx
import { useState } from 'react';
import {
  GeoMap,
  createMapMarkerElement,
  type GeoMapMarker,
  type GeoMapCluster,
} from "@page-speed/maps";
import { DynamicIcon } from "@page-speed/icon";
import { Img } from "@page-speed/img";

export function ProductionMap() {
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | number>();

  const downtownMarker: GeoMapMarker = {
    id: 'downtown-phx',
    latitude: 33.4585232,
    longitude: -112.0715382,
    eyebrow: 'Phoenix Flagship',
    title: 'Downtown PHX Craft',
    summary: 'Central downtown gathering space with elevated craft cocktails.',
    locationLine: '128 E Roosevelt St, Phoenix, AZ 85004',
    locationUrl: 'https://maps.app.goo.gl/example',
    hoursLine: 'Mon-Sun: 11:00 AM - 12:00 AM',
    mediaItems: [
      { id: '1', src: '/images/downtown-1.jpg', alt: 'Signature cocktail' },
      { id: '2', src: '/images/downtown-2.jpg', alt: 'Interior' },
    ],
    markerElement: createMapMarkerElement({
      size: 'lg',
      dotColor: '#F97316',
      innerRingColor: '#FB923C',
      middleRingColor: '#FDBA74',
      outerRingColor: '#FED7AA',
    }),
    markerContentComponent: (
      <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Highlights</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Happy hour daily from 4 PM - 6 PM</li>
          <li>Private event lounge available</li>
          <li>Chef tasting menu on weekends</li>
        </ul>
      </div>
    ),
    actions: [
      {
        label: 'Directions',
        href: 'https://maps.app.goo.gl/example',
        icon: <DynamicIcon name="lucide/navigation" size={14} />,
        variant: 'default',
        size: 'md',
      },
      {
        href: '#menu',
        iconAfter: <DynamicIcon name="lucide/arrow-right" size={14} />,
        variant: 'outline',
        size: 'icon',
      },
    ],
  };

  const scottsdaleMarker: GeoMapMarker = {
    id: 'scottsdale',
    latitude: 33.6510546,
    longitude: -111.924473,
    eyebrow: 'Scottsdale Location',
    title: 'North Scottsdale',
    summary: 'Modern location designed for group dining and premium cocktails.',
    locationLine: '17797 N Scottsdale Rd, Scottsdale, AZ 85255',
    hoursLine: 'Mon-Sun: 10:00 AM - 11:00 PM',
    mediaItems: [
      { id: '1', src: '/images/scottsdale-1.jpg', alt: 'Venue interior' },
      { id: '2', src: '/images/scottsdale-2.jpg', alt: 'Fine dining' },
      { id: '3', src: '/images/scottsdale-3.jpg', alt: 'Guests dining' },
    ],
    markerElement: createMapMarkerElement({
      size: 'lg',
      dotColor: '#0EA5E9',
      innerRingColor: '#38BDF8',
      middleRingColor: '#7DD3FC',
      outerRingColor: '#BAE6FD',
    }),
    actions: [
      {
        label: 'Directions',
        href: 'https://maps.app.goo.gl/example',
        icon: <DynamicIcon name="lucide/navigation" size={14} />,
        size: 'md',
      },
    ],
  };

  return (
    <GeoMap
      markers={[downtownMarker, scottsdaleMarker]}
      stadiaApiKey={process.env.NEXT_PUBLIC_STADIA_API_KEY}
      selectedMarkerId={selectedMarkerId}
      onSelectionChange={(selection) => {
        if (selection.type === 'marker') {
          setSelectedMarkerId(selection.marker?.id);
          console.log('Selected:', selection.marker?.title);
        } else {
          setSelectedMarkerId(undefined);
        }
      }}
      IconComponent={DynamicIcon}
      ImgComponent={Img}
      className="rounded-2xl border border-border"
      mapWrapperClassName="h-[520px] md:h-[600px]"
      panelPosition="bottom-left"
      showNavigationControl={true}
      navigationControlPosition="top-right"
      markerFocusZoom={13.75}
    />
  );
}
```

---

## Tree-Shakable Imports

For maximum performance, use granular imports:

```tsx
// Import only what you need
import { GeoMap } from "@page-speed/maps/components/geo-map";
import { MapMarker } from "@page-speed/maps/components/map-marker";
import type { GeoMapProps, GeoMapMarker } from "@page-speed/maps/components";
import { cn } from "@page-speed/maps/utils/cn";
```

This ensures your bundle only includes the code you actually use.
