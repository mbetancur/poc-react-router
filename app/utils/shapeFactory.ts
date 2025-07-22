import type { Point, ShapeModel, ShapeType, QCurveShapeModel, BCurveShapeModel, LinePolygonShapeModel } from "~/types/canvas";

export const generateShapeId = (): string => {
  return `shape_${Math.random().toString(12)}-createdAt${Date.now()}`;
};

export function getTwoClosestPoints(points: Point[], newPoint: Point): [Point, Point] | null {
  if (points.length < 2) return null;
  const sorted = [...points]
    .map(point => ({ point, dist: getDistanceBetweenPoints(point, newPoint) }))
    .sort((a, b) => a.dist - b.dist);
  return [sorted[0].point, sorted[1].point];
}

export const getDefaultShapeStyles = () => ({
  fill: "lightblue",
  stroke: "blue",
  strokeWidth: 2,
  opacity: 1,
  visible: true,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  x: 0,
  y: 0,
});

export const getCurveControlPoint = (point: Point, secondPoint: Point): Point => {
  return {
    x: (point.x + secondPoint.x) / 2,
    y: (point.y + secondPoint.y) / 2
  };
};

export const calculateQCurveControlPoints = (points: Point[]): Point[] => {
  if (points.length < 2) return [];

  const controlPoints: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    controlPoints.push(getCurveControlPoint(points[i], points[i + 1]));
  }
  return controlPoints;
};

export const createQCurveShape = (firstPoint: Point): QCurveShapeModel => ({
  id: generateShapeId(),
  type: "qcurve",
  points: [firstPoint],
  controlPoints: [],
  name: "Opportunity name",
  created: Date.now(),
  modified: Date.now(),
  ...getDefaultShapeStyles(),
});

export const createBCurveShape = (firstPoint: Point): BCurveShapeModel => ({
  id: generateShapeId(),
  type: "bcurve",
  points: [firstPoint],
  controlPoints1: [],
  controlPoints2: [],
  name: "Opportunity name",
  created: Date.now(),
  modified: Date.now(),
  ...getDefaultShapeStyles(),
});

const createPolygonPoints = (startPoint: Point, numPoints: number = 4, distance: number = 100): Point[] => {
  const points: Point[] = [
    { x: startPoint.x, y: startPoint.y },
    { x: startPoint.x + distance, y: startPoint.y },
    { x: startPoint.x + distance, y: startPoint.y + distance },
    { x: startPoint.x, y: startPoint.y + distance },]
  return points;
};

export const createLinePolygonShape = (startPoint: Point): LinePolygonShapeModel => ({
  id: generateShapeId(),
  type: "linepolygon",
  points: createPolygonPoints(startPoint),
  name: "Opportunity name",
  created: Date.now(),
  modified: Date.now(),
  ...getDefaultShapeStyles(),
  x: startPoint.x,
  y: startPoint.y,
});

export const createShapeByType = (shapeType: ShapeType, point: Point): ShapeModel => {
  // Add new shapes here
  switch (shapeType) {
    case "qcurve":
      return createQCurveShape(point);
    case "bcurve":
      return createBCurveShape(point);
    case "linepolygon":
      return createLinePolygonShape(point);
    default:
      throw new Error(`Unknown shape type: ${shapeType}`);
  }
};

export const isShapeComplete = (shape: ShapeModel): boolean => {
  switch (shape.type) {
    case "qcurve":
    case "bcurve":
      return shape.points.length >= 3 && shape.points[0].x === shape.points[shape.points.length - 1].x
        && shape.points[0].y === shape.points[shape.points.length - 1].y;
    case "linepolygon":
      return true; // Polygons are completed shapes by default
    default:
      return false;
  }
};

export const getDistanceBetweenPoints = (p1: Point, p2: Point): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const shouldSnapToStart = (
  currentPos: Point,
  startPoint: Point,
  snapDistance: number = 20,
  minPoints: number = 3
): boolean => {
  return getDistanceBetweenPoints(currentPos, startPoint) <= snapDistance;
}; 