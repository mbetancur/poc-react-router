import type { Point } from "~/types/canvas";

/**
 * Mock external detection function
 * In the future, this will call an actual external API
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Promise<Point[]> - Array of detected points
 */
export async function detectShape(x: number, y: number): Promise<Point[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Mock detection: create a polygon around the clicked point
  const size = 150;
  const offset = size / 2;
  
  const mockPoints: Point[] = [
    { x: x - offset, y: y - offset },
    { x: x + offset, y: y - offset },
    { x: x + offset, y: y + offset },
    { x: x - offset, y: y + offset },
  ];

  return mockPoints;
}

