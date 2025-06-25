import type Konva from "konva";
import type { LineConfig } from "konva/lib/shapes/Line"; //  Is this import correct?
import { useMemo, useEffect, useState } from "react";
import { Circle, Line, Group, Shape } from "react-konva";

export type Point = {
  x: number;
  y: number;
};

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 6;

// TODO consider avoid using LineConfig and use only own interface
interface ShapeDrawerProps extends LineConfig {
  currentMousePos?: Point | null;
  snapDistance?: number;
  isShapeClosed?: boolean;
  showAnchors?: boolean;
  onPointMove?: (i: number, newX: number, newY: number) => void;
}

export default function ShapeBCurveDrawer({
  points = [],
  currentMousePos,
  snapDistance = SNAP_DISTANCE,
  isShapeClosed = false,
  showAnchors = false,
  onPointMove,
  ...rest
}: ShapeDrawerProps) {

  const [curveControlPoints, setCurveControlPoints] = useState<Point[]>([]);

  const anchorBCurveCoords = useMemo(() => {
    if (points.length < 4) return [];
    
    const coords: Point[] = [];
    for (let i = 0; i < points.length - 2; i += 2) {
      const startX = points[i];
      const startY = points[i + 1];
      const endX = points[i + 2];
      const endY = points[i + 3];

      const curveControlPoint = {
        x: startX + (endX - startX) / 3,
        y: startY + (endY - startY) / 3
      };
      const curveControlPoint2 = {
        x: startX + (endX - startX) * 2 / 3,
        y: startY + (endY - startY) * 2 / 3
      };
      coords.push(curveControlPoint, curveControlPoint2);
    }
    return coords;
  }, [points]);

  useEffect(() => {
    setCurveControlPoints(anchorBCurveCoords);
  }, [anchorBCurveCoords]);

  const anchorCoords = useMemo(() => {
    const coords: { x: number; y: number }[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({ x: points[i], y: points[i + 1] });
    }
    return coords;
  }, [points]);

  const shouldSnapToStart = useMemo(() => {
    // TODO set a max number of points
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

  const handleQCurveCircleDragEnd = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isShapeClosed) {
      const newX = e.target.x();
      const newY = e.target.y();
      setCurveControlPoints(prev => {
        const newPoints = [...prev];
        newPoints[i] = { x: newX, y: newY };
        return newPoints;
      });
    }
  };

  return (
    <Group {...rest}>
      <Shape
        sceneFunc={(ctx, shape) => {
          if (points.length < 4) return;
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
          // TODO Improve this mapping, it's not clear
          for (let i = 0; i < points.length - 2; i += 2) {
            const pointsIndex = i + 2;
            const controlPointIndex = i;
            const x = points[pointsIndex];
            const y = points[pointsIndex + 1];
            const cPx = curveControlPoints[controlPointIndex]?.x;
            const cPy = curveControlPoints[controlPointIndex]?.y;
            const cPx2 = curveControlPoints[controlPointIndex + 1]?.x;
            const cPy2 = curveControlPoints[controlPointIndex + 1]?.y;
            ctx.bezierCurveTo(cPx, cPy, cPx2, cPy2, x, y);
          }

          // if (isShapeClosed) ctx.closePath(); // TODO check if needed
          ctx.fillStrokeShape(shape);
        }}
        fill="lightblue"
        stroke="blue"
        strokeWidth={2}
      />

      {/* TODO Check if Grouping anchors is better */}
      {showAnchors && anchorCoords.map((coord, i) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={5}
          fill="white"
          stroke="gray"
          strokeWidth={1}
          draggable={isShapeClosed}
          onDragEnd={(e) => handleCircleDragEnd(i, e)}
        />
      ))}

      {showAnchors && curveControlPoints.length > 0 && curveControlPoints.map((coord, i) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={5}
          fill="yellow"
          stroke="gray"
          strokeWidth={1}
          draggable={isShapeClosed}
          onDragEnd={(e) => handleQCurveCircleDragEnd(i, e)}
        />
      ))}

      {shouldSnapToStart && (
        // TODO check if possible to merge this Snapable point preview state + condition
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