import { useMemo } from "react";
import type { GeoCoordinate } from "./useGeoCenter";

export interface DefaultZoomOptions {
  /** Array of coordinates to fit */
  coordinates: GeoCoordinate[];
  /** Map container width in pixels */
  mapWidth: number;
  /** Map container height in pixels */
  mapHeight: number;
  /** Padding in pixels around the bounds (default: 50) */
  padding?: number;
  /** Maximum zoom level to return (default: 18) */
  maxZoom?: number;
  /** Minimum zoom level to return (default: 1) */
  minZoom?: number;
}

const TILE_SIZE = 512; // MapLibre GL JS uses 512px tiles

/**
 * Converts latitude to Mercator Y pixel coordinate at zoom 0.
 */
function latToMercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return (TILE_SIZE / (2 * Math.PI)) * (Math.PI - mercN);
}

/**
 * Converts longitude to Mercator X pixel coordinate at zoom 0.
 */
function lngToMercatorX(lng: number): number {
  return (TILE_SIZE / (2 * Math.PI)) * (((lng + 180) / 360) * 2 * Math.PI);
}

/**
 * Pure function: computes the ideal zoom level to fit all coordinates
 * within the given map dimensions.
 *
 * Returns null if fewer than 1 coordinate is provided.
 * For a single coordinate, returns maxZoom (caller should use markerFocusZoom).
 */
export function computeDefaultZoom(options: DefaultZoomOptions): number | null {
  const {
    coordinates,
    mapWidth,
    mapHeight,
    padding = 50,
    maxZoom = 18,
    minZoom = 1,
  } = options;

  if (coordinates.length === 0) return null;
  if (coordinates.length === 1) return maxZoom;
  if (mapWidth <= 0 || mapHeight <= 0) return null;

  // Compute bounding box
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const coord of coordinates) {
    if (coord.lat < minLat) minLat = coord.lat;
    if (coord.lat > maxLat) maxLat = coord.lat;
    if (coord.lng < minLng) minLng = coord.lng;
    if (coord.lng > maxLng) maxLng = coord.lng;
  }

  // Compute pixel span at zoom 0
  const pixelXMin = lngToMercatorX(minLng);
  const pixelXMax = lngToMercatorX(maxLng);
  const pixelYMin = latToMercatorY(maxLat); // Note: Y is inverted in Mercator
  const pixelYMax = latToMercatorY(minLat);

  const dx = Math.abs(pixelXMax - pixelXMin);
  const dy = Math.abs(pixelYMax - pixelYMin);

  // Available viewport after padding
  const availableWidth = mapWidth - padding * 2;
  const availableHeight = mapHeight - padding * 2;

  if (availableWidth <= 0 || availableHeight <= 0) return minZoom;

  // Compute zoom for each axis: viewport = pixelSpan * 2^zoom
  // So zoom = log2(viewport / pixelSpan)
  let zoom: number;

  if (dx === 0 && dy === 0) {
    // All coordinates are identical
    return maxZoom;
  } else if (dx === 0) {
    zoom = Math.log2(availableHeight / dy);
  } else if (dy === 0) {
    zoom = Math.log2(availableWidth / dx);
  } else {
    const zoomX = Math.log2(availableWidth / dx);
    const zoomY = Math.log2(availableHeight / dy);
    zoom = Math.min(zoomX, zoomY); // Use the more restrictive axis
  }

  // Clamp to min/max and floor to avoid sub-pixel jitter
  return Math.max(minZoom, Math.min(maxZoom, Math.floor(zoom * 100) / 100));
}

/**
 * React hook wrapper around computeDefaultZoom.
 */
export function useDefaultZoom(options: DefaultZoomOptions): number | null {
  const { coordinates, mapWidth, mapHeight, padding, maxZoom, minZoom } = options;

  return useMemo(
    () =>
      computeDefaultZoom({
        coordinates,
        mapWidth,
        mapHeight,
        padding,
        maxZoom,
        minZoom,
      }),
    [coordinates, mapWidth, mapHeight, padding, maxZoom, minZoom]
  );
}
