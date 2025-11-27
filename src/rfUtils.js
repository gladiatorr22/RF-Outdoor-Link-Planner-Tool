// src/rfUtils.js

const EARTH_RADIUS_METERS = 6371e3;

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @returns {number} Distance in meters
 */
export function getDistance(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calculates the Fresnel Zone radius at the midpoint of the link.
 * @param {number} distanceMeters - Total link distance in meters
 * @param {number} freqGHz - Frequency in GHz
 * @returns {number} Radius in meters
 */
export function calculateFresnelRadius(distanceMeters, freqGHz) {
  if (!distanceMeters || !freqGHz) return 0;
  const speedOfLight = 3.0e8;
  const frequencyHz = freqGHz * 1.0e9;
  const wavelength = speedOfLight / frequencyHz;

  const d1 = distanceMeters / 2;
  const d2 = distanceMeters / 2;

  return Math.sqrt((wavelength * d1 * d2) / (d1 + d2));
}

/**
 * Generates points for an ellipse polygon representing the Fresnel zone.
 * @param {Array<number>} point1 - [lat, lng] of the first point
 * @param {Array<number>} point2 - [lat, lng] of the second point
 * @param {number} radiusMeters - Fresnel zone radius in meters
 * @returns {Array<Array<number>>} Array of [lat, lng] points forming the polygon
 */
export function generateFresnelPolygon(point1, point2, radiusMeters) {
  if (!point1 || !point2 || !radiusMeters) return [];

  const [lat1, lng1] = point1;
  const [lat2, lng2] = point2;

  const centerLat = (lat1 + lat2) / 2;
  const centerLng = (lng1 + lng2) / 2;

  const dist = getDistance(lat1, lng1, lat2, lng2);
  const semiMajorAxis = dist / 2;
  const semiMinorAxis = radiusMeters;

  // Calculate bearing
  const y = Math.sin(lng2 * Math.PI / 180 - lng1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(lng2 * Math.PI / 180 - lng1 * Math.PI / 180);
  const bearing = Math.atan2(y, x);

  const points = [];
  const steps = 36;
  const metersPerDegLat = 111132.95;
  const metersPerDegLng = 111132.95 * Math.cos(centerLat * (Math.PI / 180));

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;

    const xLocal = semiMajorAxis * Math.cos(t);
    const yLocal = semiMinorAxis * Math.sin(t);

    const xRot = xLocal * Math.cos(Math.PI / 2 - bearing) - yLocal * Math.sin(Math.PI / 2 - bearing);
    const yRot = xLocal * Math.sin(Math.PI / 2 - bearing) + yLocal * Math.cos(Math.PI / 2 - bearing);

    const latOffset = yRot / metersPerDegLat;
    const lngOffset = xRot / metersPerDegLng;

    points.push([centerLat + latOffset, centerLng + lngOffset]);
  }

  return points;
}

/**
 * Fetches elevation data for a single point from Open-Elevation API.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<number>} Elevation in meters
 */
export async function getElevation(lat, lng) {
  try {
    const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`);
    const data = await response.json();
    if (data?.results?.length > 0) {
      return data.results[0].elevation;
    }
  } catch (error) {
    console.warn("Failed to fetch elevation:", error);
  }
  return 0;
}

/**
 * Generates intermediate points between two coordinates.
 * @param {Array<number>} start - [lat, lng] start point
 * @param {Array<number>} end - [lat, lng] end point
 * @param {number} count - Number of intermediate points
 * @returns {Array<Object>} Array of points with lat, lng, and percent
 */
export function getProfilePoints(start, end, count = 20) {
  const points = [];
  const [lat1, lng1] = start;
  const [lat2, lng2] = end;

  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const lat = lat1 + (lat2 - lat1) * t;
    const lng = lng1 + (lng2 - lng1) * t;
    points.push({ lat, lng, percent: t });
  }
  return points;
}

/**
 * Fetches elevation profile for a set of points.
 * @param {Array<Object>} points - Array of point objects {lat, lng}
 * @returns {Promise<Array<number>>} Array of elevations
 */
export async function getElevationProfile(points) {
  try {
    const locationsParam = points.map(p => `${p.lat},${p.lng}`).join('|');
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${locationsParam}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data?.results) {
      return data.results.map(r => r.elevation);
    }
  } catch (error) {
    console.warn("Failed to fetch elevation profile:", error);
  }
  return new Array(points.length).fill(0);
}