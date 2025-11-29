// src/utils/geoUtils.ts
import type { Point } from '../types/aoi';

// Calculate area in square meters using the shoelace formula
export function calculateArea(coordinates: Point[]): number {
  if (coordinates.length < 3) return 0;

  const R = 6378137; // Earth's radius in meters
  let area = 0;

  // Convert coordinates to radians
  const points = coordinates.map(([lng, lat]) => ({
    lat: (lat * Math.PI) / 180,
    lng: (lng * Math.PI) / 180,
  }));

  // Calculate area using the spherical excess formula
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area +=
      (points[j].lng - points[i].lng) *
      (2 + Math.sin(points[i].lat) + Math.sin(points[j].lat));
  }

  // Convert to positive value and apply Earth's radius
  area = Math.abs(area * (R * R)) / 2;
  return area;
}

// Calculate center point of a polygon
export function calculateCentroid(coordinates: Point[]): Point {
  const n = coordinates.length;
  if (n === 0) return [0, 0];

  let x = 0;
  let y = 0;

  for (const [lng, lat] of coordinates) {
    x += lng;
    y += lat;
  }

  return [x / n, y / n];
}

// Format area to human-readable string
export function formatArea(area: number): string {
  if (area < 10000) {
    return `${area.toFixed(2)} m²`;
  } else if (area < 1000000) {
    return `${(area / 10000).toFixed(2)} ha`;
  } else {
    return `${(area / 1000000).toFixed(2)} km²`;
  }
}