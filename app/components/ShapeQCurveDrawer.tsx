import type Konva from "konva";
import { useMemo, useEffect, useState, useRef } from "react";
import { Circle, Line, Group, Shape } from "react-konva";
import { getDistanceBetweenPoints } from "~/routes/canvas-shapes";

// TODO move to proper file
export type Point = {
  x: number;
  y: number;
};

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 2;

interface ShapeDrawerProps extends Konva.ShapeConfig {
  currentMousePos: Point | null;
  curveControlPoints: Point[];
  onCurveControlMove?: (i: number, newX: number, newY: number) => void;
  onPointMove?: (i: number, newX: number, newY: number) => void;
  onShapeSelect?: () => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  ref?: React.RefObject<Konva.Shape | null>;
  showAnchors?: boolean;
  snapDistance?: number;
}

const ShapeQCurveDrawer = ({
  closed = false,
  currentMousePos,
  curveControlPoints,
  onCurveControlMove,
  onPointMove,
  onShapeSelect,
  onTransformEnd,
  points = [],
  ref,
  showAnchors = false,
  snapDistance = SNAP_DISTANCE,
  ...rest
}: ShapeDrawerProps) => {

  const [finalBounds, setFinalBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  //TODO consider removing this useMemo
  const anchorCoords: Point[] = useMemo(() => {
    return [...points];
  }, [points]);

  const shouldSnapToStart: boolean = useMemo(() => {
    // TODO set a max number of points
    if (!currentMousePos || points.length < MIN_POINTS_FOR_SNAP || closed) return false;

    const initialPoint = points[0];
    const distance = getDistanceBetweenPoints(currentMousePos, initialPoint);

    return distance <= snapDistance;
  }, [currentMousePos, points, snapDistance, closed]);

  const completeShapeLinePos: Point | null = useMemo(() => {
    if (!currentMousePos || closed) return null;

    if (shouldSnapToStart) {
      return points[0];
    }

    return { x: currentMousePos.x, y: currentMousePos.y };
  }, [currentMousePos, shouldSnapToStart, points, closed]);

  const previewLinePoints = useMemo(() => {
    if (points.length > 0 && completeShapeLinePos && !closed) {
      const lastPoint = points[points.length - 1];
      return [lastPoint.x, lastPoint.y, completeShapeLinePos.x, completeShapeLinePos.y];
    }
    return [];
  }, [points, completeShapeLinePos, closed]);

  const handleCircleDragEnd = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onPointMove && closed) {
      const newX = e.target.x();
      const newY = e.target.y();
      onPointMove(i, newX, newY);
    }
  };

  const handleQCurveCircleDragEnd = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onCurveControlMove && closed) {
      const newX = e.target.x();
      const newY = e.target.y();
      onCurveControlMove(i, newX, newY);
    }
  };

  function rotatePoint(x: number, y: number, cx: number, cy: number, angleDeg: number) {
    // TODO  move to utils  
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    const dx = x - cx;
    const dy = y - cy;
    return {
      x: cx + dx * cos - dy * sin,
      y: cy + dx * sin + dy * cos,
    };
  }

  // TODO remove or improve useEffect
  useEffect(() => {
    if (closed && !finalBounds && points.length >= 2) {
      let minX = points[0].x;
      let maxX = points[0].x;
      let minY = points[0].y;
      let maxY = points[0].y;

      for (let i = 0; i < points.length; i++) {
        minX = Math.min(minX, points[i].x);
        maxX = Math.max(maxX, points[i].x);
        minY = Math.min(minY, points[i].y);
        maxY = Math.max(maxY, points[i].y);
      }

      setFinalBounds({
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      });
    }
  }, [closed, points, finalBounds]);

  const bounds = finalBounds || { x: 0, y: 0, width: 0, height: 0 };

  // This is a workaround to get the bounds of the shape and pass it to the transformer
  // TODO check if useEffect is needed
  useEffect(() => {
    if (ref?.current) {
      ref.current.getSelfRect = () => {
        return {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        };
      };
    }
  }, [bounds, ref]);

  return (
    <Group {...rest}>
      <Shape
        ref={ref}
        sceneFunc={(ctx, shape) => {
          // TODO improve this part
          if (points.length < 2) return;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < points.length - 1; i++) {
            const nextPoint = points[i + 1];
            const controlPoint = curveControlPoints[i];
            if (controlPoint) {
              ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, nextPoint.x, nextPoint.y);
            }
          }

          // if (closed) ctx.closePath(); // TODO check if needed
          ctx.fillStrokeShape(shape);
        }}
        fill="lightblue"
        stroke="blue"
        strokeWidth={2}
        onClick={() => onShapeSelect?.()}
        onTransformEnd={onTransformEnd}
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
          draggable={closed}
          onDragEnd={(e) => handleCircleDragEnd(i, e)}
        />
      ))}

      {showAnchors && curveControlPoints.length > 0 && curveControlPoints.map((coord: Point, i: number) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={4}
          fill="yellow"
          stroke="gray"
          strokeWidth={1}
          draggable={closed}
          onDragEnd={(e) => handleQCurveCircleDragEnd(i, e)}
        />
      ))}

      {shouldSnapToStart && !closed && (
        // TODO check if possible to merge this Snapable point preview state + condition
        // with the line preview
        <Circle
          x={points[0].x}
          y={points[0].y}
          radius={8}
          fill="green"
          stroke="darkgreen"
          strokeWidth={2}
        />
      )}

      {!closed &&
        <Line
          points={previewLinePoints}
          stroke={shouldSnapToStart ? "green" : "red"}
          strokeWidth={2}
          dash={[5, 5]}
        />}

    </Group >
  )
};

export default ShapeQCurveDrawer;