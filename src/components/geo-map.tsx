"use client";

import * as React from "react";
import { MapLibre } from "../core";
import type {
  BasicMarkerInput,
  MapControlPosition,
  MapCoordinate,
  MapLibreFlyToOptions,
  MapViewState,
} from "../types";
import { cn } from "../utils/cn";
import { SimplePressable } from "../utils/simple-pressable";

// Optional peer dependencies - allow consuming apps to provide these
type IconComponent = React.ComponentType<{ name: string; size?: number; className?: string }>;
type ImgComponent = React.ComponentType<{
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  optixFlowConfig?: any;
}>;

type PanelPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

export type GeoMapMediaType = "image" | "video";

export interface GeoMapMediaItem {
  id?: string | number;
  src: string;
  type?: GeoMapMediaType;
  alt?: string;
  poster?: string;
}

export interface GeoMapMarker {
  id?: string | number;
  latitude: number;
  longitude: number;
  label?: React.ReactNode;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  summary?: React.ReactNode;
  locationLine?: React.ReactNode;
  locationUrl?: string;
  hoursLine?: React.ReactNode;
  mediaItems?: GeoMapMediaItem[];
  markerContentComponent?: React.ReactNode;
  actions?: ActionConfig[];
  draggable?: boolean;
  pinColor?: string;
  pinClassName?: string;
  markerElement?:
    | React.ReactNode
    | ((args: { isSelected: boolean }) => React.ReactNode);
}

export interface GeoMapCluster {
  id?: string | number;
  label?: React.ReactNode;
  title?: React.ReactNode;
  summary?: React.ReactNode;
  latitude?: number;
  longitude?: number;
  markers: GeoMapMarker[];
  pinColor?: string;
  pinClassName?: string;
  markerElement?:
    | React.ReactNode
    | ((args: { isSelected: boolean; count: number }) => React.ReactNode);
}

export interface GeoMapSelection {
  type: "none" | "marker" | "cluster";
  marker?: GeoMapMarker;
  cluster?: GeoMapCluster;
}

export interface ActionConfig {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  iconAfter?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
  onClick?: React.MouseEventHandler;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  asButton?: boolean;
  [key: string]: any;
}

export interface GeoMapProps {
  className?: string;
  mapWrapperClassName?: string;
  mapClassName?: string;
  panelClassName?: string;
  panelPosition?: PanelPosition;
  stadiaApiKey?: string;
  mapStyle?: string;
  styleUrl?: string;
  mapLibreCssHref?: string;
  markers?: GeoMapMarker[];
  clusters?: GeoMapCluster[];
  viewState?: Partial<MapViewState>;
  defaultViewState?: Partial<MapViewState>;
  onViewStateChange?: (state: Partial<MapViewState>) => void;
  onMapClick?: (coord: MapCoordinate) => void;
  onMarkerDrag?: (
    markerId: string | number | null,
    coord: MapCoordinate,
  ) => void;
  showNavigationControl?: boolean;
  showGeolocateControl?: boolean;
  navigationControlPosition?: MapControlPosition;
  geolocateControlPosition?: MapControlPosition;
  flyToOptions?: MapLibreFlyToOptions;
  markerFocusZoom?: number;
  clusterFocusZoom?: number;
  selectedMarkerId?: string | number;
  initialSelectedMarkerId?: string | number;
  onSelectionChange?: (selection: GeoMapSelection) => void;
  clearSelectionOnMapClick?: boolean;
  mapChildren?: React.ReactNode;
  optixFlowConfig?: any;
  // Optional component overrides for external dependencies
  IconComponent?: IconComponent;
  ImgComponent?: ImgComponent;
}

type NormalizedMarker = Omit<GeoMapMarker, "id"> & {
  id: string;
  clusterId?: string;
};

type NormalizedCluster = Omit<
  GeoMapCluster,
  "id" | "markers" | "latitude" | "longitude"
> & {
  id: string;
  latitude: number;
  longitude: number;
  markers: NormalizedMarker[];
};

const PANEL_POSITION_CLASS: Record<PanelPosition, string> = {
  "top-left": "left-4 top-4",
  "top-right": "right-4 top-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

const DEFAULT_VIEW_STATE: MapViewState = {
  latitude: 39.5,
  longitude: -98.35,
  zoom: 3,
};

const VIDEO_FILE_EXTENSION_REGEX = /\.(mp4|webm|ogg|mov|m4v|m3u8)(\?.*)?$/i;

function resolveMediaType(item: GeoMapMediaItem): GeoMapMediaType {
  if (item.type) {
    return item.type;
  }

  return VIDEO_FILE_EXTENSION_REGEX.test(item.src) ? "video" : "image";
}

function normalizeId(
  value: string | number | undefined,
  fallback: string,
): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function buildClusterCenter(markers: GeoMapMarker[]): MapCoordinate | null {
  if (!markers.length) {
    return null;
  }

  const total = markers.reduce(
    (accumulator, marker) => ({
      latitude: accumulator.latitude + marker.latitude,
      longitude: accumulator.longitude + marker.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: total.latitude / markers.length,
    longitude: total.longitude / markers.length,
  };
}

function resolveActionKey(action: ActionConfig, index: number): string {
  if (typeof action.label === "string" && action.label.trim().length > 0) {
    return `label:${action.label}:${index}`;
  }

  if (action.href) {
    return `href:${action.href}:${index}`;
  }

  return `action:${index}`;
}

// Simple fallback icon component
const FallbackIcon: React.FC<{ name: string; size?: number; className?: string }> = ({
  size = 20,
  className,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
);

// Simple fallback image component
const FallbackImg: React.FC<{
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}> = ({ src, alt, className, loading }) => (
  <img src={src} alt={alt} className={className} loading={loading} />
);

function MarkerActions({ actions }: { actions?: ActionConfig[] }) {
  if (!actions || actions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((action, index) => {
        const {
          label,
          icon,
          iconAfter,
          children,
          href,
          onClick,
          className: actionClassName,
          variant,
          size,
          asButton,
          ...rest
        } = action;

        // Simple button styles
        const buttonStyles = cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors",
          variant === "outline"
            ? "border border-border bg-background hover:bg-muted"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
          size === "sm" && "text-sm px-3 py-1.5",
          size === "icon" && "p-2",
          actionClassName
        );

        return (
          <SimplePressable
            key={resolveActionKey(action, index)}
            href={href}
            onClick={onClick}
            className={buttonStyles}
            {...rest}
          >
            {children ?? (
              <>
                {icon}
                {label}
                {iconAfter}
              </>
            )}
          </SimplePressable>
        );
      })}
    </div>
  );
}

function MarkerMediaCarousel({
  mediaItems,
  optixFlowConfig,
  IconComponent = FallbackIcon,
  ImgComponent = FallbackImg,
}: {
  mediaItems: GeoMapMediaItem[];
  optixFlowConfig?: any;
  IconComponent?: IconComponent;
  ImgComponent?: ImgComponent;
}) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const totalItems = mediaItems.length;
  const mediaResetKey = React.useMemo(
    () =>
      mediaItems
        .map((item, index) => {
          const itemId = normalizeId(item.id, `media-${index}`);
          return `${itemId}:${item.src}:${item.type ?? ""}:${item.poster ?? ""}`;
        })
        .join("|"),
    [mediaItems],
  );
  const activeItemIndex = Math.min(activeIndex, Math.max(0, totalItems - 1));

  React.useEffect(() => {
    setActiveIndex(0);
  }, [mediaResetKey]);

  return (
    <div className="relative border-b border-border/60 bg-muted/40">
      <div className="relative aspect-video w-full overflow-hidden">
        {mediaItems.map((item, index) => {
          const isActive = index === activeItemIndex;
          const mediaType = resolveMediaType(item);

          return (
            <div
              key={normalizeId(item.id, `media-slide-${index}`)}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out",
                isActive
                  ? "opacity-100 z-1"
                  : "opacity-0 z-0 pointer-events-none",
              )}
            >
              {mediaType === "video" ? (
                <video
                  className="h-full w-full object-cover"
                  controls={isActive}
                  preload="metadata"
                  poster={item.poster}
                  tabIndex={isActive ? 0 : -1}
                >
                  <source src={item.src} />
                </video>
              ) : (
                <ImgComponent
                  src={item.src}
                  alt={item.alt ?? "Map marker media"}
                  className="h-full w-full object-cover"
                  loading="eager"
                  optixFlowConfig={optixFlowConfig}
                />
              )}
            </div>
          );
        })}
      </div>

      {totalItems > 1 ? (
        <>
          <button
            type="button"
            aria-label="Show previous media"
            className="absolute left-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-card text-card-foreground shadow-lg border-4 border-black hover:border-white hover:bg-black hover:text-white transition-all duration-500 z-[2]"
            onClick={() => {
              setActiveIndex(
                (current) => (current - 1 + totalItems) % totalItems,
              );
            }}
          >
            <IconComponent name="lucide/arrow-left" size={18} />
          </button>
          <button
            type="button"
            aria-label="Show next media"
            className="absolute right-4 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-2xl bg-card text-card-foreground shadow-lg border-4 border-black hover:border-white hover:bg-black hover:text-white transition-all duration-500 z-2"
            onClick={() => {
              setActiveIndex((current) => (current + 1) % totalItems);
            }}
          >
            <IconComponent name="lucide/arrow-right" size={18} />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 z-[2]">
            {mediaItems.map((item, index) => (
              <button
                key={normalizeId(item.id, `media-dot-${index}`)}
                type="button"
                aria-label={`Show media item ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === activeItemIndex
                    ? "w-6 bg-card"
                    : "w-2 bg-card opacity-50 hover:opacity-100",
                )}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function getMarkerTitle(
  marker: NormalizedMarker,
  markerIndex: number,
): React.ReactNode {
  if (marker.title !== undefined && marker.title !== null) {
    return marker.title;
  }

  if (marker.label !== undefined && marker.label !== null) {
    return marker.label;
  }

  return `Location ${markerIndex + 1}`;
}

/**
 * GeoMap - Feature-rich map component with markers, clusters, and rich media panels.
 *
 * Provides clustering, marker selection, media carousels, and customizable UI panels.
 * Built on top of MapLibre GL for high-performance rendering.
 *
 * @example
 * ```tsx
 * <GeoMap
 *   stadiaApiKey="your-api-key"
 *   markers={[
 *     {
 *       id: 'loc-1',
 *       latitude: 40.7128,
 *       longitude: -74.0060,
 *       title: 'New York Office',
 *       summary: 'Our flagship location',
 *       mediaItems: [{ src: '/office.jpg', alt: 'Office' }],
 *     }
 *   ]}
 *   defaultViewState={{ latitude: 40.7128, longitude: -74.0060, zoom: 12 }}
 * />
 * ```
 */
export function GeoMap({
  className,
  mapWrapperClassName,
  mapClassName,
  panelClassName,
  panelPosition = "top-left",
  stadiaApiKey = "",
  mapStyle = "osm-bright",
  styleUrl,
  mapLibreCssHref,
  markers = [],
  clusters = [],
  viewState,
  defaultViewState,
  onViewStateChange,
  onMapClick,
  onMarkerDrag,
  showNavigationControl = true,
  showGeolocateControl = false,
  navigationControlPosition = "top-right",
  geolocateControlPosition = "top-left",
  flyToOptions,
  markerFocusZoom = 14,
  clusterFocusZoom = 5,
  selectedMarkerId,
  initialSelectedMarkerId,
  onSelectionChange,
  clearSelectionOnMapClick = true,
  mapChildren,
  optixFlowConfig,
  IconComponent = FallbackIcon,
  ImgComponent = FallbackImg,
}: GeoMapProps): React.JSX.Element {
  const normalizedStandaloneMarkers = React.useMemo<NormalizedMarker[]>(
    () =>
      markers.map((marker, index) => ({
        ...marker,
        id: normalizeId(marker.id, `marker-${index}`),
      })),
    [markers],
  );

  const normalizedClusters = React.useMemo<NormalizedCluster[]>(() => {
    const results: NormalizedCluster[] = [];

    clusters.forEach((cluster, clusterIndex) => {
      const clusterId = normalizeId(cluster.id, `cluster-${clusterIndex}`);
      const normalizedClusterMarkers: NormalizedMarker[] = cluster.markers.map(
        (marker, markerIndex) => ({
          ...marker,
          id: normalizeId(marker.id, `${clusterId}-marker-${markerIndex}`),
          clusterId,
        }),
      );

      const clusterCenter =
        cluster.latitude !== undefined && cluster.longitude !== undefined
          ? { latitude: cluster.latitude, longitude: cluster.longitude }
          : buildClusterCenter(normalizedClusterMarkers);

      if (!clusterCenter) {
        return;
      }

      results.push({
        ...cluster,
        id: clusterId,
        latitude: clusterCenter.latitude,
        longitude: clusterCenter.longitude,
        markers: normalizedClusterMarkers,
      });
    });

    return results;
  }, [clusters]);

  const markerLookup = React.useMemo(() => {
    const lookup = new Map<string, NormalizedMarker>();

    normalizedStandaloneMarkers.forEach((marker) => {
      lookup.set(marker.id, marker);
    });

    normalizedClusters.forEach((cluster) => {
      cluster.markers.forEach((marker) => {
        lookup.set(marker.id, marker);
      });
    });

    return lookup;
  }, [normalizedClusters, normalizedStandaloneMarkers]);

  const clusterLookup = React.useMemo(() => {
    const lookup = new Map<string, NormalizedCluster>();
    normalizedClusters.forEach((cluster) => {
      lookup.set(cluster.id, cluster);
    });
    return lookup;
  }, [normalizedClusters]);

  // FIX: Calculate proper initial center from all markers/clusters
  const firstCoordinate = React.useMemo(() => {
    const allCoords: MapCoordinate[] = [];

    // Collect all marker coordinates
    normalizedStandaloneMarkers.forEach(marker => {
      allCoords.push({ latitude: marker.latitude, longitude: marker.longitude });
    });

    // Collect all cluster coordinates
    normalizedClusters.forEach(cluster => {
      allCoords.push({ latitude: cluster.latitude, longitude: cluster.longitude });
    });

    // If we have coordinates, calculate the center
    if (allCoords.length > 0) {
      const sum = allCoords.reduce(
        (acc, coord) => ({
          latitude: acc.latitude + coord.latitude,
          longitude: acc.longitude + coord.longitude,
        }),
        { latitude: 0, longitude: 0 }
      );

      return {
        latitude: sum.latitude / allCoords.length,
        longitude: sum.longitude / allCoords.length,
      };
    }

    return {
      latitude: DEFAULT_VIEW_STATE.latitude,
      longitude: DEFAULT_VIEW_STATE.longitude,
    };
  }, [normalizedClusters, normalizedStandaloneMarkers]);

  // FIX: Calculate proper initial zoom based on marker spread
  const calculatedZoom = React.useMemo(() => {
    if (normalizedStandaloneMarkers.length + normalizedClusters.length <= 1) {
      return markerFocusZoom; // Single marker, use focus zoom
    }

    const allCoords: MapCoordinate[] = [];
    normalizedStandaloneMarkers.forEach(marker => {
      allCoords.push({ latitude: marker.latitude, longitude: marker.longitude });
    });
    normalizedClusters.forEach(cluster => {
      allCoords.push({ latitude: cluster.latitude, longitude: cluster.longitude });
    });

    if (allCoords.length === 0) {
      return DEFAULT_VIEW_STATE.zoom;
    }

    // Calculate bounding box
    const lats = allCoords.map(c => c.latitude);
    const lngs = allCoords.map(c => c.longitude);
    const latDiff = Math.max(...lats) - Math.min(...lats);
    const lngDiff = Math.max(...lngs) - Math.min(...lngs);
    const maxDiff = Math.max(latDiff, lngDiff);

    // Estimate zoom level based on coordinate spread
    // This is a rough approximation - adjust multiplier as needed
    if (maxDiff > 10) return 3;
    if (maxDiff > 5) return 5;
    if (maxDiff > 2) return 7;
    if (maxDiff > 1) return 9;
    if (maxDiff > 0.5) return 10;
    if (maxDiff > 0.1) return 12;
    return 13;
  }, [normalizedClusters, normalizedStandaloneMarkers, markerFocusZoom]);

  const [uncontrolledViewState, setUncontrolledViewState] = React.useState<
    Partial<MapViewState>
  >({
    latitude: defaultViewState?.latitude ?? firstCoordinate.latitude,
    longitude: defaultViewState?.longitude ?? firstCoordinate.longitude,
    zoom: defaultViewState?.zoom ?? calculatedZoom,
  });

  // FIX: Update view state when markers/clusters change
  React.useEffect(() => {
    if (!viewState && !defaultViewState) {
      setUncontrolledViewState({
        latitude: firstCoordinate.latitude,
        longitude: firstCoordinate.longitude,
        zoom: calculatedZoom,
      });
    }
  }, [firstCoordinate, calculatedZoom, viewState, defaultViewState]);

  const isControlledViewState = viewState !== undefined;

  const resolvedViewState = isControlledViewState
    ? viewState
    : uncontrolledViewState;

  const applyViewState = React.useCallback(
    (nextState: Partial<MapViewState>) => {
      if (!isControlledViewState) {
        setUncontrolledViewState((current) => {
          const next = { ...current, ...nextState };
          const hasChanged =
            current.latitude !== next.latitude ||
            current.longitude !== next.longitude ||
            current.zoom !== next.zoom;

          return hasChanged ? next : current;
        });
      }

      onViewStateChange?.(nextState);
    },
    [isControlledViewState, onViewStateChange],
  );

  const [selection, setSelection] = React.useState<{
    type: "none" | "marker" | "cluster";
    markerId?: string;
    clusterId?: string;
  }>(() => {
    if (
      initialSelectedMarkerId !== undefined &&
      initialSelectedMarkerId !== null
    ) {
      return {
        type: "marker",
        markerId: String(initialSelectedMarkerId),
      };
    }

    return { type: "none" };
  });

  React.useEffect(() => {
    if (selectedMarkerId === undefined || selectedMarkerId === null) {
      return;
    }

    setSelection({
      type: "marker",
      markerId: String(selectedMarkerId),
    });
  }, [selectedMarkerId]);

  const selectedMarker = selection.markerId
    ? markerLookup.get(selection.markerId)
    : undefined;
  const selectedCluster = selection.clusterId
    ? clusterLookup.get(selection.clusterId)
    : undefined;

  React.useEffect(() => {
    if (selection.type === "marker" && selection.markerId && !selectedMarker) {
      setSelection({ type: "none" });
      onSelectionChange?.({ type: "none" });
    }
  }, [onSelectionChange, selectedMarker, selection]);

  const emitSelectionChange = React.useCallback(
    (
      nextSelection:
        | { type: "none" }
        | { type: "marker"; marker: NormalizedMarker }
        | { type: "cluster"; cluster: NormalizedCluster },
    ) => {
      if (nextSelection.type === "none") {
        onSelectionChange?.({ type: "none" });
        return;
      }

      if (nextSelection.type === "marker") {
        const parentCluster = nextSelection.marker.clusterId
          ? clusterLookup.get(nextSelection.marker.clusterId)
          : undefined;
        onSelectionChange?.({
          type: "marker",
          marker: nextSelection.marker,
          cluster: parentCluster,
        });
        return;
      }

      onSelectionChange?.({
        type: "cluster",
        cluster: nextSelection.cluster,
      });
    },
    [clusterLookup, onSelectionChange],
  );

  const selectMarker = React.useCallback(
    (marker: NormalizedMarker) => {
      setSelection({
        type: "marker",
        markerId: marker.id,
        clusterId: marker.clusterId,
      });

      applyViewState({
        latitude: marker.latitude,
        longitude: marker.longitude,
        zoom: markerFocusZoom,
      });

      emitSelectionChange({ type: "marker", marker });
    },
    [applyViewState, emitSelectionChange, markerFocusZoom],
  );

  const selectCluster = React.useCallback(
    (cluster: NormalizedCluster) => {
      setSelection({
        type: "cluster",
        clusterId: cluster.id,
      });

      applyViewState({
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        zoom: clusterFocusZoom,
      });

      emitSelectionChange({ type: "cluster", cluster });
    },
    [applyViewState, clusterFocusZoom, emitSelectionChange],
  );

  const clearSelection = React.useCallback(() => {
    setSelection({ type: "none" });
    emitSelectionChange({ type: "none" });
  }, [emitSelectionChange]);

  const mapMarkers = React.useMemo<BasicMarkerInput[]>(() => {
    const resolvedMarkers: BasicMarkerInput[] = [];

    normalizedClusters.forEach((cluster) => {
      const isSelected =
        selection.type === "cluster" && selection.clusterId === cluster.id;

      resolvedMarkers.push({
        id: `cluster-pin:${cluster.id}`,
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        element: () => {
          const customMarkerElement = cluster.markerElement;
          const markerBody =
            typeof customMarkerElement === "function"
              ? customMarkerElement({
                  isSelected,
                  count: cluster.markers.length,
                })
              : customMarkerElement;

          return (
            <button
              type="button"
              className="group cursor-pointer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                selectCluster(cluster);
              }}
              aria-label={`View ${cluster.markers.length} clustered locations`}
            >
              {markerBody ?? (
                <span
                  className={cn(
                    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border-2 border-white px-2 text-xs font-semibold text-white shadow-lg transition-transform duration-200 group-hover:scale-105",
                    isSelected && "ring-4 ring-primary/30",
                    cluster.pinClassName,
                  )}
                  style={{
                    backgroundColor: cluster.pinColor ?? "var(--foreground)",
                  }}
                >
                  {cluster.markers.length}
                </span>
              )}
            </button>
          );
        },
      });
    });

    normalizedStandaloneMarkers.forEach((marker) => {
      const isSelected =
        selection.type === "marker" && selection.markerId === marker.id;
      const customMarkerElement = marker.markerElement;

      resolvedMarkers.push({
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        draggable: marker.draggable,
        element: () => {
          const markerBody =
            typeof customMarkerElement === "function"
              ? customMarkerElement({ isSelected })
              : customMarkerElement;

          return (
            <button
              type="button"
              className="group cursor-pointer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                selectMarker(marker);
              }}
              aria-label={
                typeof marker.title === "string"
                  ? `View ${marker.title}`
                  : "View location details"
              }
            >
              {markerBody ?? (
                <span
                  className={cn(
                    "inline-flex h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-110",
                    isSelected && "h-5 w-5 ring-4 ring-primary/30",
                    marker.pinClassName,
                  )}
                  style={{
                    backgroundColor: marker.pinColor ?? "#f43f5e",
                  }}
                />
              )}
            </button>
          );
        },
      });
    });

    return resolvedMarkers;
  }, [
    normalizedClusters,
    normalizedStandaloneMarkers,
    selectCluster,
    selectMarker,
    selection,
  ]);

  const renderMarkerPanel = () => {
    if (selectedMarker) {
      const markerMediaItems = selectedMarker.mediaItems ?? [];

      return (
        <div
          className={cn(
            "relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl",
            panelClassName,
          )}
        >
          <button
            type="button"
            aria-label="Close marker details"
            className="flex size-12 items-center justify-center rounded-bl-lg rounded-br-0 rounded-t-0 bg-black text-white transition-all duration-500 absolute top-0 right-0 z-10 cursor-pointer ring-4 ring-white"
            onClick={clearSelection}
          >
            <IconComponent name="lucide/x" size={20} />
          </button>

          {markerMediaItems.length > 0 ? (
            <MarkerMediaCarousel
              mediaItems={markerMediaItems}
              optixFlowConfig={optixFlowConfig}
              IconComponent={IconComponent}
              ImgComponent={ImgComponent}
            />
          ) : null}

          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                {selectedMarker.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    {selectedMarker.eyebrow}
                  </p>
                ) : null}
                <div className="text-base font-semibold leading-tight">
                  {selectedMarker.title ?? selectedMarker.label ?? "Location"}
                </div>
              </div>
            </div>

            {selectedMarker.summary ? (
              <div className="text-sm leading-relaxed">
                {selectedMarker.summary}
              </div>
            ) : null}

            {selectedMarker.locationLine ? (
              <div className="flex flex-row items-center justify-start text-sm gap-2">
                <IconComponent
                  name="lucide:map-pin"
                  className="opacity-50"
                  size={18}
                />
                {typeof selectedMarker.locationLine === "string" ? (
                  <SimplePressable
                    href={selectedMarker.locationUrl}
                    className={cn(
                      "transition-all duration-500",
                      "font-medium opacity-75 hover:opacity-100",
                      selectedMarker.locationUrl
                        ? "underline underline-offset-4"
                        : "",
                    )}
                  >
                    {selectedMarker.locationLine}
                  </SimplePressable>
                ) : (
                  selectedMarker.locationLine
                )}
              </div>
            ) : null}

            {selectedMarker.hoursLine ? (
              <div className="flex flex-row items-center justify-start text-sm gap-2">
                <IconComponent
                  name="lucide:clock"
                  className="opacity-50"
                  size={18}
                />
                {typeof selectedMarker.hoursLine === "string" ? (
                  <div className="font-medium">{selectedMarker.hoursLine}</div>
                ) : (
                  selectedMarker.hoursLine
                )}
              </div>
            ) : null}

            {selectedMarker.markerContentComponent ? (
              <div className="relative">
                {selectedMarker.markerContentComponent}
              </div>
            ) : null}

            <MarkerActions actions={selectedMarker.actions} />
          </div>
        </div>
      );
    }

    if (selectedCluster) {
      return (
        <div
          className={cn(
            "relative w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-card text-card-foreground p-4 shadow-2xl",
            panelClassName,
          )}
        >
          <button
            type="button"
            aria-label="Close cluster details"
            className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-card-foreground transition hover:bg-muted hover:text-foreground absolute top-2 right-2 z-10"
            onClick={clearSelection}
          >
            <IconComponent name="lucide/x" size={20} />
          </button>

          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              {selectedCluster.label ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {selectedCluster.label}
                </p>
              ) : null}
              <div className="text-base font-semibold leading-tight text-foreground">
                {selectedCluster.title ?? "Clustered Locations"}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedCluster.summary ??
                  `${selectedCluster.markers.length} location${selectedCluster.markers.length === 1 ? "" : "s"} in this cluster.`}
              </p>
            </div>
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {selectedCluster.markers.map((marker, markerIndex) => (
              <button
                key={marker.id}
                type="button"
                className="w-full rounded-lg border border-border/60 p-3 text-left transition hover:border-border hover:bg-muted/50"
                onClick={() => selectMarker(marker)}
              >
                <div className="line-clamp-1 text-sm font-semibold text-foreground">
                  {getMarkerTitle(marker, markerIndex)}
                </div>
                {marker.summary ? (
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {marker.summary}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-background",
        className,
      )}
    >
      <div className={cn("h-[520px] w-full", mapWrapperClassName)}>
        <MapLibre
          stadiaApiKey={stadiaApiKey}
          mapStyle={mapStyle}
          styleUrl={styleUrl}
          mapLibreCssHref={mapLibreCssHref}
          viewState={resolvedViewState}
          onViewStateChange={applyViewState}
          markers={mapMarkers}
          onClick={(coord) => {
            onMapClick?.(coord);
            if (clearSelectionOnMapClick) {
              clearSelection();
            }
          }}
          onMarkerDrag={onMarkerDrag}
          showNavigationControl={showNavigationControl}
          showGeolocateControl={showGeolocateControl}
          navigationControlPosition={navigationControlPosition}
          geolocateControlPosition={geolocateControlPosition}
          flyToOptions={flyToOptions}
          className={cn("h-full w-full", mapClassName)}
        >
          {mapChildren}
        </MapLibre>
      </div>

      {selection.type !== "none" ? (
        <div
          className={cn(
            "pointer-events-none absolute z-20",
            PANEL_POSITION_CLASS[panelPosition],
          )}
        >
          <div className="pointer-events-auto">{renderMarkerPanel()}</div>
        </div>
      ) : null}
    </div>
  );
}
