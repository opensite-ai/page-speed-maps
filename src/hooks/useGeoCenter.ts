import { useMemo } from "react";

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface GeoCenterResult {
  lat: number;
  lng: number;
}

/**
 * Computes the geographic midpoint of an array of coordinates
 * using the Cartesian 3D averaging method (handles antimeridian, poles, etc.)
 *
 * Returns null if the input array is empty.
 */
export function computeGeoCenter(
  coordinates: GeoCoordinate[]
): GeoCenterResult | null {
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1) {
    return { lat: coordinates[0].lat, lng: coordinates[0].lng };
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  let x = 0;
  let y = 0;
  let z = 0;

  for (const coord of coordinates) {
    const latRad = toRad(coord.lat);
    const lngRad = toRad(coord.lng);
    x += Math.cos(latRad) * Math.cos(lngRad);
    y += Math.cos(latRad) * Math.sin(lngRad);
    z += Math.sin(latRad);
  }

  const total = coordinates.length;
  x /= total;
  y /= total;
  z /= total;

  const hyp = Math.sqrt(x * x + y * y);
  const lat = toDeg(Math.atan2(z, hyp));
  const lng = toDeg(Math.atan2(y, x));

  return { lat, lng };
}

/**
 * React hook wrapper around computeGeoCenter.
 * Memoizes based on the coordinates array reference.
 */
export function useGeoCenter(
  coordinates: GeoCoordinate[]
): GeoCenterResult | null {
  return useMemo(() => computeGeoCenter(coordinates), [coordinates]);
}
