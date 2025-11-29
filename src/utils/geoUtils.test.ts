// src/utils/geoUtils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateArea, calculateCentroid, formatArea } from './geoUtils';
import type { Point } from '../types/aoi';

describe('geoUtils', () => {
  describe('calculateArea', () => {
    it('should return 0 for less than 3 points', () => {
      expect(calculateArea([])).toBe(0);
      expect(calculateArea([[0, 0]] as Point[])).toBe(0);
      expect(calculateArea([[0, 0], [1, 1]] as Point[])).toBe(0);
    });

    it('should calculate area for a simple square', () => {
      // A 1-degree square around Berlin (approximately)
      // This is a rough test - actual area depends on latitude
      const square: Point[] = [
        [13.0, 52.0], // bottom-left
        [14.0, 52.0], // bottom-right
        [14.0, 53.0], // top-right
        [13.0, 53.0], // top-left
        [13.0, 52.0], // close polygon
      ];
      
      const area = calculateArea(square);
      expect(area).toBeGreaterThan(0);
      // At this latitude, 1 degree ≈ 111km, so square should be ~7,500 km²
      // The actual calculated area is approximately 7.5 billion m²
      expect(area).toBeGreaterThan(5000000000); // > 5,000 km²
      expect(area).toBeLessThan(10000000000); // < 10,000 km²
    });

    it('should handle polygons with many points', () => {
      const polygon: Point[] = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0.5, 1.5],
        [0, 1],
        [0, 0],
      ];
      
      const area = calculateArea(polygon);
      expect(area).toBeGreaterThan(0);
    });
  });

  describe('calculateCentroid', () => {
    it('should return [0, 0] for empty array', () => {
      expect(calculateCentroid([])).toEqual([0, 0]);
    });

    it('should calculate centroid for a square', () => {
      const square: Point[] = [
        [0, 0],
        [2, 0],
        [2, 2],
        [0, 2],
      ];
      
      const centroid = calculateCentroid(square);
      expect(centroid[0]).toBeCloseTo(1, 5); // center x
      expect(centroid[1]).toBeCloseTo(1, 5); // center y
    });

    it('should calculate centroid for a triangle', () => {
      const triangle: Point[] = [
        [0, 0],
        [3, 0],
        [1.5, 3],
      ];
      
      const centroid = calculateCentroid(triangle);
      expect(centroid[0]).toBeCloseTo(1.5, 5);
      expect(centroid[1]).toBeCloseTo(1, 5);
    });
  });

  describe('formatArea', () => {
    it('should format small areas in square meters', () => {
      expect(formatArea(100)).toBe('100.00 m²');
      expect(formatArea(9999)).toBe('9999.00 m²');
    });

    it('should format medium areas in hectares', () => {
      expect(formatArea(10000)).toBe('1.00 ha');
      expect(formatArea(50000)).toBe('5.00 ha');
      // 999999 / 10000 = 99.9999, which rounds to 100.00 with 2 decimals
      expect(formatArea(999999)).toBe('100.00 ha');
      // Test a value that should format as 99.99 ha
      expect(formatArea(999900)).toBe('99.99 ha');
    });

    it('should format large areas in square kilometers', () => {
      expect(formatArea(1000000)).toBe('1.00 km²');
      expect(formatArea(5000000)).toBe('5.00 km²');
    });

    it('should handle edge cases', () => {
      expect(formatArea(0)).toBe('0.00 m²');
      expect(formatArea(9999.99)).toBe('9999.99 m²');
      expect(formatArea(1000000.01)).toBe('1.00 km²');
    });
  });
});

