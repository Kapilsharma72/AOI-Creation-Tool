// src/types/aoi.ts
export type Point = [number, number]; // [longitude, latitude]
export type Polygon = Point[];

export interface Aoi {
  id: string;
  name: string;
  description?: string;
  geometry: Polygon;
  createdAt: string | Date;
  updatedAt?: string | Date;
  properties?: Record<string, any>;
}