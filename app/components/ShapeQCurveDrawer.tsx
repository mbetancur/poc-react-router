import type Konva from "konva";
import { useMemo, useEffect, useState } from "react";
import { Circle, Line, Group, Shape, Rect } from "react-konva";

// TODO move to proper file
export type Point = {
  x: number;
  y: number;
};

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 6;

interface ShapeDrawerProps extends Konva.ShapeConfig {
  currentMousePos?: Point | null;
  onPointMove?: (i: number, newX: number, newY: number) => void;
  onShapeSelect?: () => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  shapeRef?: React.RefObject<Konva.Rect>;
  showAnchors?: boolean;
  snapDistance?: number;
  customRotation?: number;
}

export default function ShapeQCurveDrawer({
  closed = false,
  currentMousePos,
  customRotation = 0,
  onPointMove,
  onShapeSelect,
  onTransformEnd,
  points = [],
  shapeRef,
  showAnchors = false,
  snapDistance = SNAP_DISTANCE,
  ...rest
}: ShapeDrawerProps) {

  const [curveControlPoints, setCurveControlPoints] = useState<Point[]>([]);
  const [finalBounds, setFinalBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const calculatedAnchorQCurveCoords: Point[] = useMemo(() => {
    if (points.length < 4) return [];
    const coords: Point[] = [];
    for (let i = 0; i < points.length - 2; i += 2) {
      const startX = points[i];
      const startY = points[i + 1];
      const endX = points[i + 2];
      const endY = points[i + 3];
      const curveControlPoint: Point = { x: (startX + endX) / 2, y: (startY + endY) / 2 };
      coords.push(curveControlPoint);
    }
    return coords;
  }, [points]);

  useEffect(() => {
    setCurveControlPoints(calculatedAnchorQCurveCoords);
  }, [calculatedAnchorQCurveCoords]);

  const anchorCoords: Point[] = useMemo(() => {
    const coords: Point[] = [];
    for (let i = 0; i < points.length - 1; i += 2) {
      coords.push({ x: points[i], y: points[i + 1] });
    }
    return coords;
  }, [points]);

  const shouldSnapToStart: boolean = useMemo(() => {
    // TODO set a max number of points
    if (!currentMousePos || points.length < MIN_POINTS_FOR_SNAP || closed) return false;

    const initialPoint = { x: points[0], y: points[1] };
    // TODO extract in utils
    const distance = Math.sqrt(
      Math.pow(currentMousePos.x - initialPoint.x, 2) +
      Math.pow(currentMousePos.y - initialPoint.y, 2)
    );

    return distance <= snapDistance;
  }, [currentMousePos, points, snapDistance, closed]);

  const completeShapeLinePos: Point | null = useMemo(() => {
    if (!currentMousePos || closed) return null;

    if (shouldSnapToStart) {
      return { x: points[0], y: points[1] };
    }

    return { x: currentMousePos.x, y: currentMousePos.y };
  }, [currentMousePos, shouldSnapToStart, points, closed]);

  const previewLinePoints = useMemo(() => {
    if (points.length > 0 && completeShapeLinePos && !closed) {
      const lastPoint = { x: points[points.length - 2], y: points[points.length - 1] };
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
    if (closed) {
      const newX = e.target.x();
      const newY = e.target.y();
      setCurveControlPoints(prev => {
        const newPoints = [...prev];
        newPoints[i] = { x: newX, y: newY };
        return newPoints;
      });
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

  useEffect(() => {
    if (closed && !finalBounds && points.length >= 4) {
      let minX = points[0];
      let maxX = points[0];
      let minY = points[1];
      let maxY = points[1];

      for (let i = 0; i < points.length; i += 2) {
        minX = Math.min(minX, points[i]);
        maxX = Math.max(maxX, points[i]);
        minY = Math.min(minY, points[i + 1]);
        maxY = Math.max(maxY, points[i + 1]);
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

  // TODO  move to utils  
  const center = useMemo(() => ({
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }), [bounds]);

  const rotatedAnchorCoords = anchorCoords.map(coord =>
    rotatePoint(coord.x, coord.y, center.x, center.y, customRotation)
  );

  const rotatedCurveControlPoints = curveControlPoints.map(coord =>
    rotatePoint(coord.x, coord.y, center.x, center.y, customRotation)
  );

  return (
    <Group {...rest}>
      {closed && (
        <Rect
          ref={shapeRef}
          x={bounds.x}
          y={bounds.y}
          width={bounds.width}
          height={bounds.height}
          fill="yellow"
          draggable={false}
          onTransformEnd={onTransformEnd}
        />
      )}
      <Shape
        sceneFunc={(ctx, shape) => {
          ctx.translate(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
          ctx.rotate(customRotation * Math.PI / 180);
          ctx.translate(-bounds.x - bounds.width / 2, -bounds.y - bounds.height / 2);

          if (points.length < 4) return;
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
          for (let i = 0; i < points.length - 2; i += 2) {
            const pointsIndex = i + 2;
            const controlPointIndex = i / 2;
            const x = points[pointsIndex];
            const y = points[pointsIndex + 1];
            const cPx = curveControlPoints[controlPointIndex]?.x;
            const cPy = curveControlPoints[controlPointIndex]?.y;
            ctx.quadraticCurveTo(cPx, cPy, x, y);
          }

          // if (closed) ctx.closePath(); // TODO check if needed
          ctx.fillStrokeShape(shape);
        }}
        fill="lightblue"
        stroke="blue"
        strokeWidth={2}
        onClick={() => onShapeSelect?.()}
      />

      {/* TODO Check if Grouping anchors is better */}
      {showAnchors && rotatedAnchorCoords.map((coord, i) => (
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

      {showAnchors && rotatedCurveControlPoints.length > 0 && rotatedCurveControlPoints.map((coord, i) => (
        <Circle
          key={i}
          x={coord.x}
          y={coord.y}
          radius={5}
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
          x={points[0]}
          y={points[1]}
          radius={8}
          fill="green"
          stroke="darkgreen"
          strokeWidth={2}
        />
      )}

      {!closed && <Line
        points={previewLinePoints}
        stroke={shouldSnapToStart ? "green" : "red"}
        strokeWidth={2}
        dash={[5, 5]}
      />}

    </Group >
  )
}