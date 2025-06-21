import type { LineConfig } from "konva/lib/shapes/Line";
import { useMemo } from "react";
import { Circle, Line, Group } from "react-konva";

export type Point = {
  x: number;
  y: number;
};

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 3;

interface ShapeDrawerProps extends LineConfig {
  points: number[];
  currentMousePos?: Point | null;
  snapDistance?: number;
  isShapeClosed?: boolean;
}

export default function ShapeDrawer({
  points,
  currentMousePos,
  x = 0,
  y = 0,
  snapDistance = SNAP_DISTANCE,
  isShapeClosed = false,
  ...rest
}: ShapeDrawerProps) {

  const circleCoords = useMemo(() => {
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({ x: points[i] - x, y: points[i + 1] - y });
    }
    return coords;
  }, [points, x, y]);

  const linePoints = useMemo(() => {
    const relative: number[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      relative.push(points[i] - x, points[i + 1] - y);
    }
    return relative;
  }, [points, x, y]);

  const shouldSnapToStart = useMemo(() => {
    if (!currentMousePos || points.length < MIN_POINTS_FOR_SNAP || isShapeClosed) return false;

    const initialPoint = { x: points[0], y: points[1] };
    // TODO extract in utils
    const distance = Math.sqrt(
      Math.pow(currentMousePos.x - initialPoint.x, 2) +
      Math.pow(currentMousePos.y - initialPoint.y, 2)
    );

    return distance <= snapDistance;
  }, [currentMousePos, points, snapDistance, isShapeClosed]);

  const completeShapeLinePos = useMemo(() => {
    if (!currentMousePos || isShapeClosed) return null;

    if (shouldSnapToStart) {
      return { x: points[0] - x, y: points[1] - y };
    }

    return { x: currentMousePos.x - x, y: currentMousePos.y - y };
  }, [currentMousePos, shouldSnapToStart, points, x, y, isShapeClosed]);

  const previewLinePoints = useMemo(() => {
    if (points.length > 0 && completeShapeLinePos && !isShapeClosed) {
      const lastPoint = { x: points[points.length - 2] - x, y: points[points.length - 1] - y };
      return [lastPoint.x, lastPoint.y, completeShapeLinePos.x, completeShapeLinePos.y];
    }
    return [];
  }, [points, completeShapeLinePos, x, y, isShapeClosed]);

  return (
    <Group x={x} y={y} {...rest}>
      {circleCoords.map((coord, i) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={5}
          fill="white"
          stroke="gray"
          strokeWidth={1}
        />
      ))}

      {shouldSnapToStart && points.length > 0 && (
        <Circle
          x={points[0] - x}
          y={points[1] - y}
          radius={8}
          fill="green"
          stroke="darkgreen"
          strokeWidth={2}
        />
      )}

      <Line
        name="shape"
        points={linePoints}
        stroke="blue"
        strokeWidth={2}
        fill={isShapeClosed ? "blue" : undefined}
        closed={isShapeClosed}
      />

      {previewLinePoints.length > 0 && (
        <Line
          points={previewLinePoints}
          stroke={shouldSnapToStart ? "green" : "red"}
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}
    </Group>
  )
}