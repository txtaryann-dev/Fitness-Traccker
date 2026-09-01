import { LatLng } from '../types';

/**
 * Calculates accurate geodesic distance between two latitude/longitude points
 * using the Haversine formula on the WGS-84 Earth ellipsoid model.
 */
export function calculateHaversineDistanceKm(p1: LatLng, p2: LatLng): number {
  if (p1.lat === p2.lat && p1.lng === p2.lng) return 0;

  const R = 6371; // Earth's mean radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates total route distance in kilometers.
 */
export function calculateTotalDistanceKm(points: LatLng[]): number {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calculateHaversineDistanceKm(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Calculates initial compass bearing (heading) in degrees (0-360) from point A to point B.
 */
export function calculateBearing(p1: LatLng, p2: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const lat1 = toRad(p1.lat);
  const lat2 = toRad(p2.lat);
  const dLng = toRad(p2.lng - p1.lng);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  const brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

/**
 * Intelligent GPS noise & drift filter.
 * Prevents phantom distance accumulation when stationary or encountering noisy fixes.
 */
export function isGpsPointValid(
  newPos: LatLng,
  prevPos: LatLng | null,
  accuracy: number,
  speedMs: number | null
): boolean {
  // If GPS accuracy radius is worse than 45 meters, drop the fix to avoid erratic leaps
  if (accuracy > 45) {
    return false;
  }

  if (!prevPos) return true;

  const distKm = calculateHaversineDistanceKm(prevPos, newPos);
  const distMeters = distKm * 1000;

  // If user is practically stationary (delta < 2.5 meters and speed is near zero),
  // ignore the sub-meter GPS drift
  if (distMeters < 2.5 && (speedMs === null || speedMs < 0.4)) {
    return false;
  }

  // Teleport filter: if jump is > 150 meters in 1 second, it's a GPS glitch
  if (distMeters > 150) {
    return false;
  }

  return true;
}

/**
 * Reverse geocodes latitude/longitude to a clean, human-readable city/location name.
 */
export async function reverseGeocodeLocation(
  lat: number,
  lng: number
): Promise<{ fullLocation: string; city: string; neighborhood: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Geocoding network error');
    }

    const data = await response.json();
    const addr = data.address || {};

    const neighborhood =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.commercial ||
      addr.residential ||
      addr.road ||
      '';

    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.village ||
      addr.county ||
      '';

    const stateOrCountry = addr.state || addr.country || '';

    let parts = [neighborhood, city, stateOrCountry].filter(Boolean);
    if (parts.length === 0) {
      return {
        fullLocation: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
        city: 'Nearby Route',
        neighborhood: 'Live GPS Point',
      };
    }

    return {
      fullLocation: parts.slice(0, 2).join(', '),
      city: city || stateOrCountry || 'Local Area',
      neighborhood: neighborhood || city || 'Route',
    };
  } catch (err) {
    return {
      fullLocation: `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`,
      city: 'Local Workout',
      neighborhood: 'GPS Track',
    };
  }
}
