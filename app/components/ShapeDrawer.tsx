import type Konva from "konva";
import type { LineConfig } from "konva/lib/shapes/Line";
import { useMemo } from "react";
import { Circle, Line, Group, Shape } from "react-konva";

export type Point = {
  x: number;
  y: number;
};

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 6;

interface ShapeDrawerProps extends LineConfig {
  points: number[];
  currentMousePos?: Point | null;
  snapDistance?: number;
  isShapeClosed?: boolean;
  showCircles?: boolean;
  onPointMove?: (i: number, newX: number, newY: number) => void;
}

export default function ShapeDrawer({
  points,
  currentMousePos,
  snapDistance = SNAP_DISTANCE,
  isShapeClosed = false,
  showCircles = false,
  onPointMove,
  ...rest
}: ShapeDrawerProps) {
  const shouldShowCircles = !isShapeClosed || showCircles;

  const circleCoords = useMemo(() => {
    if (!shouldShowCircles) return [];
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({ x: points[i], y: points[i + 1] });
    }
    return coords;
  }, [points, shouldShowCircles]);

  const linePoints = useMemo(() => {
    const linePoints: number[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      linePoints.push(points[i], points[i + 1]);
    }
    return linePoints;
  }, [points]);

  const shouldSnapToStart = useMemo(() => {
    // TODO set a max number of points
    console.log(points);
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
      return { x: points[0], y: points[1] };
    }

    return { x: currentMousePos.x, y: currentMousePos.y };
  }, [currentMousePos, shouldSnapToStart, points, isShapeClosed]);

  const previewLinePoints = useMemo(() => {
    if (points.length > 0 && completeShapeLinePos && !isShapeClosed) {
      const lastPoint = { x: points[points.length - 2], y: points[points.length - 1] };
      return [lastPoint.x, lastPoint.y, completeShapeLinePos.x, completeShapeLinePos.y];
    }
    return [];
  }, [points, completeShapeLinePos, isShapeClosed]);

  const handleCircleDragEnd = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onPointMove && isShapeClosed) {
      const newX = e.target.x();
      const newY = e.target.y();
      onPointMove(i, newX, newY);
    }
  };

  return (
    <Group {...rest}>
      <Shape
        sceneFunc={(ctx, shape) => {
          if (linePoints.length < 4) return;
          ctx.beginPath();
          console.log(ctx);

          for (let i = 0; i < linePoints.length; i += 2) {
            const x = linePoints[i];
            const y = linePoints[i + 1];
            ctx.quadraticCurveTo(x, y, x, y);
          }
          if (isShapeClosed) ctx.closePath();
          ctx.fillStrokeShape(shape);
        }}
        fill="lightblue"
        stroke="blue"
        strokeWidth={2}
      />

      {/* <Line
        name="shape"
        points={linePoints}
        stroke="blue"
        strokeWidth={2}
        fill={isShapeClosed ? "lightblue" : undefined}
        closed={isShapeClosed}
      /> */}

      {circleCoords.map((coord, i) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={5}
          fill="white"
          stroke="gray"
          strokeWidth={1}
          draggable={isShapeClosed && showCircles}
          onDragEnd={(e) => handleCircleDragEnd(i, e)}
        />
      ))}

      {shouldSnapToStart && (
        // TODO check if possible to merge this Snapable point preview
        // with the line preview
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
        points={previewLinePoints}
        stroke={shouldSnapToStart ? "green" : "red"}
        strokeWidth={2}
        dash={[5, 5]}
      />

    </Group>
  )
}