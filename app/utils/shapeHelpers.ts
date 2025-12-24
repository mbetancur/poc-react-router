import type Konva from "konva";
import type { Point } from "~/types/canvas";

/**
 * Calculate the centroid of a polygon using the shoelace formula
 * @param points - Array of points representing the polygon vertices
 * @param isClosed - Whether the polygon is closed (first point equals last point)
 * @returns The centroid point {x, y}
 */
export const calculateCentroid = (points: Point[], isClosed: boolean = true): Point => {
  if (points.length < 2) {
    return { x: 0, y: 0 };
  }

  // If not closed, we need to add the first point at the end for calculation
  const tmpPoints = isClosed ? points : [...points, points[0]];
  
  // Calculate centroid using shoelace formula
  const areaConstant = 0.5;
  const centerConstant = 6;

  let areaSum = 0;
  let sumCenterX = 0;
  let sumCenterY = 0;

  for (let i = 0; i < tmpPoints.length - 1; i++) {
    const { x, y } = tmpPoints[i];
    const { x: x1, y: y1 } = tmpPoints[i + 1];

    areaSum = (x * y1) - (x1 * y) + areaSum;
    sumCenterX = (x + x1) * (x * y1 - x1 * y) + sumCenterX;
    sumCenterY = (y + y1) * (x * y1 - x1 * y) + sumCenterY;
  }

  const area = areaConstant * areaSum;
  const centerX = sumCenterX / (centerConstant * area);
  const centerY = sumCenterY / (centerConstant * area);

  return { x: centerX, y: centerY };
};

/**
 * Get text dimensions from a Konva Text node
 * @param textRef - Reference to the Konva Text node
 * @returns Object with width and height, or {0, 0} if ref is null
 */
export const getTextDimensions = (textRef: Konva.Text | null): { width: number; height: number } => {
  if (textRef) {
    return {
      width: textRef.width(),
      height: textRef.height()
    };
  }
  return { width: 0, height: 0 };
};

/**
 * Create a drag bound function for text that keeps it within a shape
 * @param shapeRef - Reference to the parent shape
 * @param textRef - Reference to the text node
 * @returns A function that constrains drag position
 */
export const createTextDragBoundFunc = (
  shapeRef: React.RefObject<Konva.Shape | null>,
  textRef: React.RefObject<Konva.Text | null>
) => {
  return (pos: Point): Point => {
    if (shapeRef?.current && textRef?.current) {
      if (shapeRef.current.intersects(pos)) {
        return pos;
      }
      return textRef.current.position();
    }
    return pos;
  };
};

/**
 * Calculate the bounding box for a shape given its points
 * @param points - Array of points
 * @param controlPoints - Optional array of control points (for curves)
 * @returns Bounding box {x, y, width, height}
 */
export const calculateShapeBounds = (
  points: Point[],
  controlPoints: Point[] = []
): { x: number; y: number; width: number; height: number } => {
  if (points.length < 1) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const allPoints = [...points, ...controlPoints];
  let minX = allPoints[0].x;
  let maxX = allPoints[0].x;
  let minY = allPoints[0].y;
  let maxY = allPoints[0].y;

  for (const point of allPoints) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
};

