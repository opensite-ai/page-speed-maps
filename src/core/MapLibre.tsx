import React from "react";
import {
  GeolocateControl,
  Map,
  Marker,
  NavigationControl,
  type MapRef,
  type ViewStateChangeEvent
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import type {
  BasicMarkerInput,
  MapLibreMarker,
  MapLibreProps,
  MapViewState
} from "../types";
import { appendStadiaApiKey, getMapLibreStyleUrl } from "../utils";

function joinClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(" ");
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
  flyToOptions = {}
}: MapLibreProps) {
  const mapRef = React.useRef<MapRef>(null);
  const [internalViewState, setInternalViewState] = React.useState<MapViewState>({
    latitude: viewState?.latitude ?? center.lat,
    longitude: viewState?.longitude ?? center.lng,
    zoom: viewState?.zoom ?? zoom
  });

  const isUserInteracting = React.useRef(false);
  const isMarkerDragging = React.useRef(false);
  const dragAnimationFrame = React.useRef<number | null>(null);

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

      const hasChanged =
        previous.latitude !== next.latitude ||
        previous.longitude !== next.longitude ||
        previous.zoom !== next.zoom;

      if (!hasChanged) {
        return previous;
      }

      const {
        speed = 0.8,
        curve = 1.2,
        bearing = 0,
        easing = (t: number) => 1 - Math.pow(1 - t, 3)
      } = flyToOptions;

      mapRef.current?.flyTo({
        center: [next.longitude, next.latitude],
        zoom: next.zoom,
        speed,
        curve,
        bearing,
        easing,
        essential: true
      });

      return next;
    });
  }, [flyToOptions, viewState?.latitude, viewState?.longitude, viewState?.zoom]);

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

      onViewStateChange?.({
        latitude: Number(nextViewState.latitude.toFixed(6)),
        longitude: Number(nextViewState.longitude.toFixed(6)),
        zoom: Number(nextViewState.zoom.toFixed(2))
      });
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

  return (
    <div
      className={joinClassNames("relative w-full h-full", className)}
      style={{ width: "100%", height: "100%", ...style }}
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
