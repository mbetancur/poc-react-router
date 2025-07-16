import type { Point, QCurveShapeModel } from "~/types/canvas";
import { createQCurveShape, calculateQCurveControlPoints } from "./shapeFactory";

/**
 * Converts old single-shape state to new multi-shape format
 */
export interface OldShapeState {
  points: Point[];
  curveControlPoints: Point[];
  isShapeClosed: boolean;
  rotation: number;
}

export const migrateOldShapeToNew = (oldState: OldShapeState): QCurveShapeModel | null => {
  if (oldState.points.length === 0) return null;

  const baseShape = createQCurveShape(oldState.points[0]);
  
  return {
    ...baseShape,
    points: oldState.points,
    controlPoints: oldState.curveControlPoints.length > 0 
      ? oldState.curveControlPoints 
      : calculateQCurveControlPoints(oldState.points),
    rotation: oldState.rotation,
    name: "Migrated Shape",
  };
};

/**
 * Helper to check if we can migrate from old component
 */
export const canMigrateFromOldState = (
  points: Point[], 
  isShapeClosed: boolean
): boolean => {
  return points.length >= 3 && isShapeClosed;
}; 