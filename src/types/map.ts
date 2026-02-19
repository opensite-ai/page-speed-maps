import type React from "react";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

export type MapViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export type MapControlPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type MapLibreFlyToOptions = {
  speed?: number;
  curve?: number;
  easing?: (t: number) => number;
  bearing?: number;
};

export type MapLibreMarker = {
  id: string | number;
  lat: number;
  lng: number;
  element?: (() => React.ReactNode) | React.ReactNode;
  onClick?: () => void;
  color?: string;
  label?: string;
  draggable?: boolean;
};

export type BasicMarkerInput = {
  id?: string | number;
  latitude: number;
  longitude: number;
  color?: string;
  draggable?: boolean;
  label?: string;
  element?: (() => React.ReactNode) | React.ReactNode;
  onClick?: () => void;
};

export type MapLibreProps = {
  stadiaApiKey: string;
  /**
   * Optional stylesheet URL override for MapLibre CSS auto-loading.
   * Defaults to jsDelivr maplibre-gl stylesheet for the bundled version.
   */
  mapLibreCssHref?: string;
  viewState?: Partial<MapViewState>;
  onViewStateChange?: (state: Partial<MapViewState>) => void;
  mapStyle?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  styleUrl?: string;
  markers?: (MapLibreMarker | BasicMarkerInput)[];
  onMoveEnd?: (
    center: { lat: number; lng: number },
    zoom: number,
    bounds: unknown
  ) => void;
  onClick?: (coord: MapCoordinate) => void;
  onMarkerDrag?: (
    markerId: string | number | null,
    coord: MapCoordinate
  ) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  showNavigationControl?: boolean;
  showGeolocateControl?: boolean;
  navigationControlPosition?: MapControlPosition;
  geolocateControlPosition?: MapControlPosition;
  flyToOptions?: MapLibreFlyToOptions;
};
