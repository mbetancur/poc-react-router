import type { LineConfig } from "konva/lib/shapes/Line";
import { useMemo } from "react";
import { Circle, Line } from "react-konva";

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
  onSnapToStart?: () => void;
  isShapeClosed?: boolean;
}

export default function ShapeDrawer({
  points,
  currentMousePos,
  x = 0,
  y = 0,
  snapDistance = SNAP_DISTANCE,
  onSnapToStart,
  isShapeClosed = false,
  ...rest
}: ShapeDrawerProps) {

  const circleCoords = useMemo(() => {
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({ x: points[i], y: points[i + 1] });
    }
    return coords;
  }, [points]);

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

  const effectiveMousePos = useMemo(() => {
    if (!currentMousePos || isShapeClosed) return null;

    if (shouldSnapToStart) {
      return { x: points[0], y: points[1] };
    }

    return currentMousePos;
  }, [currentMousePos, shouldSnapToStart, points, isShapeClosed]);

  const previewLinePoints = useMemo(() => {
    if (points.length > 0 && effectiveMousePos && !isShapeClosed) {
      const lastPoint = { x: points[points.length - 2], y: points[points.length - 1] };
      return [lastPoint.x - x, lastPoint.y - y, effectiveMousePos.x - x, effectiveMousePos.y - y];
    }
    return [];
  }, [points, effectiveMousePos, x, y, isShapeClosed]);

  return (
    <>
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
          x={points[0]}
          y={points[1]}
          radius={8}
          fill="green"
          stroke="darkgreen"
          strokeWidth={2}
        />
      )}

      <Line
        points={linePoints}
        stroke="blue"
        strokeWidth={2}
        x={x}
        y={y}
        fill={isShapeClosed ? "blue" : undefined}
        closed={isShapeClosed}
        {...rest}
      />

      {previewLinePoints.length > 0 && (
        <Line
          points={previewLinePoints}
          stroke={shouldSnapToStart ? "green" : "red"}
          strokeWidth={2}
          x={x}
          y={y}
          dash={[5, 5]}
        />
      )}
    </>
  )
}