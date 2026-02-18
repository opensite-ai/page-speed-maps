export function generateGoogleMapLink(
  latitude: number,
  longitude: number,
  zoom = 15
): string {
  return `https://www.google.com/maps/@${latitude},${longitude},${zoom}z`;
}

export function generateGoogleDirectionsLink(
  latitude: number,
  longitude: number
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
}
