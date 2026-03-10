import React from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent
} from "react-map-gl/maplibre";

import type {
  BasicMarkerInput,
  MapLibreFlyToOptions,
  MapLibreMarker,
  MapLibreProps,
  MapViewState
} from "../types";
import { appendStadiaApiKey, getMapLibreStyleUrl } from "../utils";

const DEFAULT_MAPLIBRE_CSS_HREF =
  "https://cdn.jsdelivr.net/npm/maplibre-gl@5.18.0/dist/maplibre-gl.css";
const MAPLIBRE_STYLESHEET_ID = "page-speed-maplibre-gl-css";
const DEFAULT_FLY_TO_OPTIONS: Readonly<MapLibreFlyToOptions> = Object.freeze({});
const VIEW_STATE_COORDINATE_EPSILON = 0.000001;
const VIEW_STATE_ZOOM_EPSILON = 0.01;
const DEFAULT_FLY_TO_EASING = (t: number): number => 1 - Math.pow(1 - t, 3);

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
}

function hasMeaningfulViewStateDelta(
  previous: MapViewState,
  next: MapViewState
): boolean {
  return (
    Math.abs(previous.latitude - next.latitude) > VIEW_STATE_COORDINATE_EPSILON ||
    Math.abs(previous.longitude - next.longitude) > VIEW_STATE_COORDINATE_EPSILON ||
    Math.abs(previous.zoom - next.zoom) > VIEW_STATE_ZOOM_EPSILON
  );
}

function ensureMapLibreStylesheet(href: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const existingLink = document.getElementById(MAPLIBRE_STYLESHEET_ID);
  if (existingLink instanceof HTMLLinkElement) {
    if (existingLink.getAttribute("href") !== href) {
      existingLink.setAttribute("href", href);
    }
    return;
  }

  const matchingLink = Array.from(
    document.querySelectorAll("link[rel='stylesheet']")
  ).find((link) => link.getAttribute("href") === href);

  if (matchingLink instanceof HTMLLinkElement) {
    matchingLink.id = MAPLIBRE_STYLESHEET_ID;
    return;
  }

  const stylesheet = document.createElement("link");
  stylesheet.id = MAPLIBRE_STYLESHEET_ID;
  stylesheet.rel = "stylesheet";
  stylesheet.href = href;
  stylesheet.dataset.pageSpeedMaps = "maplibre-css";
  document.head.appendChild(stylesheet);
}

function DefaultMarker({ marker }: { marker: MapLibreMarker }) {
  return (
    <div
      style={{
        cursor: marker.draggable ? "grab" : "pointer",
        transform: "translate(-50%, -100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
      onClick={marker.onClick}
    >
      <svg
        aria-hidden="true"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill={marker.color || "#3B82F6"}
        style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))" }}
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 4.85 6.13 12.24 6.39 12.55a.75.75 0 0 0 1.16 0C12.87 21.24 19 13.85 19 9c0-3.87-3.13-7-7-7Zm0 9.75A2.75 2.75 0 1 1 12 6.25a2.75 2.75 0 0 1 0 5.5Z" />
      </svg>
      {marker.label ? (
        <div
          style={{
            position: "absolute",
            bottom: -28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#FFFFFF",
            borderRadius: 6,
            padding: "2px 8px",
            fontSize: 12,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)"
          }}
        >
          {marker.label}
        </div>
      ) : null}
    </div>
  );
}

function normalizeMarkers(
  markers: (MapLibreMarker | BasicMarkerInput)[]
): MapLibreMarker[] {
  return markers.map((marker, index) => {
    if (
      (marker as MapLibreMarker).lat !== undefined &&
      (marker as MapLibreMarker).lng !== undefined
    ) {
      return marker as MapLibreMarker;
    }

    const basicMarker = marker as BasicMarkerInput;
    return {
      id: basicMarker.id ?? index,
      lat: basicMarker.latitude,
      lng: basicMarker.longitude,
      color: basicMarker.color,
      draggable: basicMarker.draggable,
      label: basicMarker.label,
      element: basicMarker.element,
      onClick: basicMarker.onClick
    };
  });
}

export function MapLibre({
  stadiaApiKey,
  mapLibreCssHref,
  viewState,
  onViewStateChange,
  mapStyle,
  center = viewState
    ? { lat: viewState.latitude ?? 0, lng: viewState.longitude ?? 0 }
    : { lat: 0, lng: 0 },
  zoom = viewState?.zoom ?? 14,
  styleUrl,
  markers = [],
  onMoveEnd,
  onClick,
  onMarkerDrag,
  className,
  style,
  children,
  showNavigationControl = true,
  showGeolocateControl = false,
  navigationControlPosition = "bottom-right",
  geolocateControlPosition = "top-left",
  flyToOptions = DEFAULT_FLY_TO_OPTIONS
}: MapLibreProps) {
  const mapRef = React.useRef<MapRef>(null);
  const resolvedMapLibreCssHref =
    mapLibreCssHref && mapLibreCssHref.trim().length > 0
      ? mapLibreCssHref
      : DEFAULT_MAPLIBRE_CSS_HREF;

  const [internalViewState, setInternalViewState] = React.useState<MapViewState>({
    latitude: viewState?.latitude ?? center.lat,
    longitude: viewState?.longitude ?? center.lng,
    zoom: viewState?.zoom ?? zoom
  });

  const isUserInteracting = React.useRef(false);
  const isMarkerDragging = React.useRef(false);
  const dragAnimationFrame = React.useRef<number | null>(null);
  const lastReportedViewState = React.useRef<MapViewState | null>(null);

  const resolvedFlyToOptions = React.useMemo(
    () => ({
      speed: flyToOptions.speed ?? 0.8,
      curve: flyToOptions.curve ?? 1.2,
      bearing: flyToOptions.bearing ?? 0,
      easing: flyToOptions.easing ?? DEFAULT_FLY_TO_EASING
    }),
    [
      flyToOptions.bearing,
      flyToOptions.curve,
      flyToOptions.easing,
      flyToOptions.speed
    ]
  );

  React.useEffect(() => {
    ensureMapLibreStylesheet(resolvedMapLibreCssHref);
  }, [resolvedMapLibreCssHref]);

  React.useEffect(() => {
    if (
      !mapRef.current ||
      !viewState ||
      isUserInteracting.current ||
      isMarkerDragging.current
    ) {
      return;
    }

    setInternalViewState((previous) => {
      const next = {
        latitude: viewState.latitude ?? previous.latitude,
        longitude: viewState.longitude ?? previous.longitude,
        zoom: viewState.zoom ?? previous.zoom
      };

      const hasChanged = hasMeaningfulViewStateDelta(previous, next);

      if (!hasChanged) {
        return previous;
      }

      const isEchoedMoveState =
        !!lastReportedViewState.current &&
        !hasMeaningfulViewStateDelta(lastReportedViewState.current, next);

      if (!isEchoedMoveState) {
        mapRef.current?.flyTo({
          center: [next.longitude, next.latitude],
          zoom: next.zoom,
          speed: resolvedFlyToOptions.speed,
          curve: resolvedFlyToOptions.curve,
          bearing: resolvedFlyToOptions.bearing,
          easing: resolvedFlyToOptions.easing,
          essential: true
        });
      }

      return next;
    });
  }, [
    resolvedFlyToOptions,
    viewState?.latitude,
    viewState?.longitude,
    viewState?.zoom
  ]);

  const handleMoveStart = React.useCallback(() => {
    isUserInteracting.current = true;
  }, []);

  const handleMove = React.useCallback(
    (event: ViewStateChangeEvent) => {
      const nextViewState = event.viewState;
      setInternalViewState({
        latitude: nextViewState.latitude,
        longitude: nextViewState.longitude,
        zoom: nextViewState.zoom
      });

      const roundedViewState = {
        latitude: Number(nextViewState.latitude.toFixed(6)),
        longitude: Number(nextViewState.longitude.toFixed(6)),
        zoom: Number(nextViewState.zoom.toFixed(2))
      };

      lastReportedViewState.current = roundedViewState;
      onViewStateChange?.(roundedViewState);
    },
    [onViewStateChange]
  );

  const handleMoveEnd = React.useCallback(
    (event: ViewStateChangeEvent) => {
      isUserInteracting.current = false;

      if (!onMoveEnd) {
        return;
      }

      const map = event.target;
      const nextCenter = map.getCenter();
      const nextZoom = map.getZoom();
      const bounds = map.getBounds();

      onMoveEnd(
        {
          lat: Number(nextCenter.lat.toFixed(6)),
          lng: Number(nextCenter.lng.toFixed(6))
        },
        Number(nextZoom.toFixed(2)),
        bounds
      );
    },
    [onMoveEnd]
  );

  const handleMapClick = React.useCallback(
    (event: { lngLat: { lng: number; lat: number } }) => {
      if (!onClick) {
        return;
      }

      onClick({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
    },
    [onClick]
  );

  const normalizedMarkers = React.useMemo(
    () => normalizeMarkers(markers),
    [markers]
  );

  const markerElements = React.useMemo(
    () =>
      normalizedMarkers.map((marker) => (
        <Marker
          key={marker.id}
          longitude={marker.lng}
          latitude={marker.lat}
          draggable={marker.draggable}
          onDragStart={() => {
            isMarkerDragging.current = true;
          }}
          onDrag={(event) => {
            if (!mapRef.current) {
              return;
            }

            const nextLngLat = (event as { lngLat?: { lng?: number; lat?: number } }).lngLat;
            if (!nextLngLat || nextLngLat.lng === undefined || nextLngLat.lat === undefined) {
              return;
            }
            const draggedLng = nextLngLat.lng;
            const draggedLat = nextLngLat.lat;

            if (dragAnimationFrame.current) {
              cancelAnimationFrame(dragAnimationFrame.current);
            }

            dragAnimationFrame.current = requestAnimationFrame(() => {
              if (!mapRef.current) {
                return;
              }

              const bounds = mapRef.current.getBounds();
              const viewportWidth = bounds.getEast() - bounds.getWest();
              const viewportHeight = bounds.getNorth() - bounds.getSouth();

              const edgePadding = 0.1;
              const westThreshold = bounds.getWest() + viewportWidth * edgePadding;
              const eastThreshold = bounds.getEast() - viewportWidth * edgePadding;
              const southThreshold = bounds.getSouth() + viewportHeight * edgePadding;
              const northThreshold = bounds.getNorth() - viewportHeight * edgePadding;

              const nearWestEdge = draggedLng < westThreshold;
              const nearEastEdge = draggedLng > eastThreshold;
              const nearSouthEdge = draggedLat < southThreshold;
              const nearNorthEdge = draggedLat > northThreshold;

              if (!nearWestEdge && !nearEastEdge && !nearSouthEdge && !nearNorthEdge) {
                return;
              }

              let panLng = draggedLng;
              let panLat = draggedLat;
              const offsetAmount = 0.2;

              if (nearWestEdge) {
                panLng = draggedLng - viewportWidth * offsetAmount;
              }
              if (nearEastEdge) {
                panLng = draggedLng + viewportWidth * offsetAmount;
              }
              if (nearSouthEdge) {
                panLat = draggedLat - viewportHeight * offsetAmount;
              }
              if (nearNorthEdge) {
                panLat = draggedLat + viewportHeight * offsetAmount;
              }

              mapRef.current?.easeTo({
                center: [panLng, panLat],
                duration: 200
              });
            });
          }}
          onDragEnd={(event) => {
            isMarkerDragging.current = false;

            if (dragAnimationFrame.current) {
              cancelAnimationFrame(dragAnimationFrame.current);
              dragAnimationFrame.current = null;
            }

            if (!onMarkerDrag) {
              return;
            }

            const nextLngLat = (event as { lngLat?: { lng?: number; lat?: number } }).lngLat;
            if (!nextLngLat || nextLngLat.lng === undefined || nextLngLat.lat === undefined) {
              return;
            }

            onMarkerDrag(marker.id ?? null, {
              latitude: nextLngLat.lat,
              longitude: nextLngLat.lng
            });
          }}
        >
          {marker.element
            ? typeof marker.element === "function"
              ? marker.element()
              : marker.element
            : <DefaultMarker marker={marker} />}
        </Marker>
      )),
    [normalizedMarkers, onMarkerDrag]
  );

  const resolvedMapStyleUrl = React.useMemo(() => {
    if (styleUrl) {
      return appendStadiaApiKey(styleUrl, stadiaApiKey);
    }

    if (mapStyle) {
      return getMapLibreStyleUrl(mapStyle, stadiaApiKey);
    }

    return getMapLibreStyleUrl("osm-bright", stadiaApiKey);
  }, [mapStyle, stadiaApiKey, styleUrl]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // Fix for MapLibre canvas height growth issue
  React.useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;

    // Force the map to respect container bounds
    const enforceContainerHeight = () => {
      const container = containerRef.current;
      const map = mapRef.current;

      if (!container || !map) return;

      // Get the actual container height
      const rect = container.getBoundingClientRect();
      const maxHeight = Math.min(rect.height, window.innerHeight);

      // Ensure the map canvas doesn't exceed container
      const canvas = map.getCanvas();
      if (canvas && canvas.style.height) {
        const canvasHeight = parseInt(canvas.style.height);
        if (canvasHeight > maxHeight || canvasHeight > 2000) {
          // Force resize to container dimensions
          map.resize();
        }
      }
    };

    // Check periodically to prevent runaway growth
    const interval = setInterval(enforceContainerHeight, 1000);

    // Also check on any resize events if ResizeObserver is available
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        enforceContainerHeight();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearInterval(interval);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={joinClassNames("relative w-full h-full", className)}
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "100vh", // Prevent excessive height
        overflow: "hidden",
        position: "relative",
        ...style
      }}
    >
      <Map
        ref={mapRef}
        {...internalViewState}
        mapStyle={resolvedMapStyleUrl}
        onMoveStart={handleMoveStart}
        onMove={handleMove}
        onMoveEnd={handleMoveEnd}
        onClick={handleMapClick}
        attributionControl={false}
        trackResize
        dragRotate={false}
        touchZoomRotate={false}
      >
        {showGeolocateControl ? (
          <GeolocateControl position={geolocateControlPosition} />
        ) : null}

        {showNavigationControl ? (
          <NavigationControl position={navigationControlPosition} />
        ) : null}

        {markerElements}

        {children}
      </Map>
    </div>
  );
}

export const DTMapLibreMap = MapLibre;
