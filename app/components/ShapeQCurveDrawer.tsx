import type Konva from "konva";
import { useMemo, useEffect, useRef } from "react";
import { Circle, Line, Group, Shape, Text } from "react-konva";
import { getDistanceBetweenPoints, type ShapeModel } from "~/routes/canvas-shapes";

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
  onRestartTransformer?: () => void;
  onShapeSelect?: () => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  points: Point[]
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
  onRestartTransformer,
  onShapeSelect,
  onTransformEnd,
  points = [],
  ref,
  showAnchors = false,
  snapDistance = SNAP_DISTANCE,
  ...rest
}: ShapeDrawerProps) => {

  const textRef = useRef<Konva.Text>(null);

  //TODO consider removing this useMemo
  const anchorCoords: Point[] = useMemo(() => {
    return [...points];
  }, [points]);

  const shouldSnapToStart: boolean = useMemo(() => {
    // TODO set a max number of points
    if (!currentMousePos || points.length < MIN_POINTS_FOR_SNAP + 1 || closed) return false;

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

  type ShapeBounds = Pick<ShapeModel, "x" | "y" | "width" | "height">;

  type TextBounds = Pick<ShapeModel, "width" | "height">;

  const textDragBoundFunc = (pos: Point): Point => {
    if (ref?.current && textRef.current) {
      if (ref.current.intersects(pos)) {
        return pos;
      }
      return textRef.current.position();
    }
    return pos;
  };

  const textCenter: Point = useMemo(() => {
    if (!closed || points.length < 2 || !ref?.current) {
      return { x: 0, y: 0 };
    }
    // These math constants are used to calculate the center of the shape
    const areaConstant = 0.5
    const centerConstant = 6

    let areaSum = 0;
    let sumCenterX = 0;
    let sumCenterY = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const { x, y } = points[i];
      const { x: x1, y: y1 } = points[i + 1];

      areaSum = (x * y1) - (x1 * y) + areaSum;

      sumCenterX = (x + x1) * (x * y1 - x1 * y) + sumCenterX;
      sumCenterY = (y + y1) * (x * y1 - x1 * y) + sumCenterY
    }
    const area = areaConstant * areaSum;
    const centerX = sumCenterX / (centerConstant * area);
    const centerY = sumCenterY / (centerConstant * area);

    return { x: centerX, y: centerY };
  }, [closed, points, curveControlPoints, ref]);

  const textDimensions: TextBounds = useMemo(() => {
    if (textRef.current) {
      return {
        width: textRef.current.width(),
        height: textRef.current.height()
      };
    }
    return { width: 0, height: 0 };
  }, [textRef, closed, points, curveControlPoints]);

  const calculateShapeBounds: ShapeBounds = useMemo(() => {
    if (!closed || points.length < 2) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    const allPoints = [...points, ...curveControlPoints];

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
  }, [closed, points, curveControlPoints]);

  // This is a workaround to get the bounds of the shape and pass it to the transformer
  // TODO check if useEffect is needed
  useEffect(() => {
    console.log("Pos", ref?.current?.getSelfRect());
    if (ref?.current) {
      ref.current.getSelfRect = () => {
        return {
          x: calculateShapeBounds.x,
          y: calculateShapeBounds.y,
          width: calculateShapeBounds.width,
          height: calculateShapeBounds.height
        };
      };
    }
    onRestartTransformer?.();
  }, [calculateShapeBounds, ref]);

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

      {closed && (
        <Text
          // align="center"
          // verticalAlign="middle"
          draggable={closed}
          dragBoundFunc={textDragBoundFunc}
          fill="white"
          fontSize={12} //TODO Calculate font size based on the text length and shape size
          offsetX={textDimensions.width / 2}
          offsetY={textDimensions.height / 2}
          ref={textRef}
          text="Opportunity name"
          x={textCenter.x}
          y={textCenter.y}
        />
      )}

    </Group >
  )
};

export default ShapeQCurveDrawer;