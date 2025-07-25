import type Konva from "konva";
import { useMemo, useEffect, useRef, type RefObject, useCallback } from "react";
import { Circle, Line, Group, Shape, Text } from "react-konva";
import type { QCurveShapeModel, Point } from "~/types/canvas";
import { getDistanceBetweenPoints, getTwoClosestPoints, isShapeComplete } from "~/utils/shapeFactory";

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 3;

interface QCurveShapeProps extends Konva.ShapeConfig {
  currentMousePos?: Point | null;
  isSelected?: boolean;
  onRestartTransformer?: (selectedShapeRef: RefObject<Konva.Shape>) => void;
  onShapeSelect?: (shapeId: string, selectedShapeRef: RefObject<Konva.Shape>) => void;
  onShapeUpdate?: (updates: Partial<QCurveShapeModel>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  ref?: React.RefObject<Konva.Shape | null>;
  shape: QCurveShapeModel;
  showAnchors?: boolean;
  snapDistance?: number;
}

const QCurveShape = ({
  currentMousePos,
  isSelected = false,
  onRestartTransformer,
  onShapeSelect,
  onShapeUpdate,
  onTransformEnd,
  ref,
  shape,
  showAnchors = false,
  snapDistance = SNAP_DISTANCE,
  ...rest
}: QCurveShapeProps) => {
  const textRef = useRef<Konva.Text>(null);

  const isClosed = useMemo(() => {
    return isShapeComplete(shape)
  }, [shape.points]);

  const shouldSnapToStart: boolean = useMemo(() => {
    // TODO Set a max number of points
    if (!currentMousePos || shape.points.length < MIN_POINTS_FOR_SNAP || isClosed) return false;

    const initialPoint = shape.points[0];
    const distance = getDistanceBetweenPoints(currentMousePos, initialPoint);

    return distance <= snapDistance;
  }, [currentMousePos, shape.points, snapDistance, isClosed]);

  const completeShapeLinePos: Point | null = useMemo(() => {
    if (!currentMousePos || isClosed) return null;

    if (shouldSnapToStart) {
      return shape.points[0];
    }

    return { x: currentMousePos.x, y: currentMousePos.y };
  }, [currentMousePos, shouldSnapToStart, shape.points, isClosed]);

  const previewLinePoints = useMemo(() => {
    if (shape.points.length > 0 && completeShapeLinePos && !isClosed) {
      const lastPoint = shape.points[shape.points.length - 1];
      return [lastPoint.x, lastPoint.y, completeShapeLinePos.x, completeShapeLinePos.y];
    }
    return [];
  }, [shape.points, completeShapeLinePos, isClosed]);

  const handleExtraPoint = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onShapeUpdate && isClosed && e.type === 'dblclick' && e.evt.ctrlKey === true) {
      const newPoint = { x: e.evt.x, y: e.evt.y };
      const tempPoints = [...shape.points];

      // Opening the shape for edition
      if (isShapeComplete(shape)) {
        tempPoints.pop();
      }

      const result = getTwoClosestPoints(tempPoints, newPoint);
      if (result) {
        const { closestPoint, secondClosestPoint } = result;
        const index = tempPoints.findIndex(point => point.x === closestPoint.x && point.y === closestPoint.y);
        switch (index) {
          case 0:
            if (tempPoints[index + 1] === secondClosestPoint) {
              tempPoints.splice(0, 0, newPoint)
            }
            else {
              tempPoints.push(newPoint)
            }
            break
          case tempPoints.length - 1:
            if (tempPoints[index - 1] === secondClosestPoint) {
              tempPoints.splice(tempPoints.length - 1, 0, newPoint)
            }
            else {
              tempPoints.push(newPoint)
            }
            break
          default:
            tempPoints.splice(index, 0, newPoint)
            break
        }
        // Closing the shape for completion
        tempPoints.push(shape.points[0])
        onShapeUpdate({ points: tempPoints });
      }
      else {
        console.warn('Error calculating shape points')
      }
    }
  };

  const handleAnchorDrag = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onShapeUpdate && isClosed) {
      const newX = e.target.x();
      const newY = e.target.y();

      const newPoints = [...shape.points];
      newPoints[i] = { x: newX, y: newY };

      // Sync first/last points for closed shapes
      if (i === 0) newPoints[newPoints.length - 1] = { x: newX, y: newY };
      else if (i === newPoints.length - 1) newPoints[0] = { x: newX, y: newY };

      onShapeUpdate({ points: newPoints });
    }
  };

  const handleControlPointMove = (i: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (onShapeUpdate && isClosed) {
      const newX = e.target.x();
      const newY = e.target.y();

      const newControlPoints = [...shape.controlPoints];
      newControlPoints[i] = { x: newX, y: newY };

      onShapeUpdate({ controlPoints: newControlPoints });
    }
  };

  // TODO This is creating a bug when dragging the text
  // avoid bubbling up the event to the shape
  // DONT REMOVE THIS FUNCTION
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
    if (!isClosed || shape.points.length < 2) {
      return { x: 0, y: 0 };
    }
    // Calculate centroid using shoelace formula
    const areaConstant = 0.5;
    const centerConstant = 6;

    let areaSum = 0;
    let sumCenterX = 0;
    let sumCenterY = 0;

    for (let i = 0; i < shape.points.length - 1; i++) {
      const { x, y } = shape.points[i];
      const { x: x1, y: y1 } = shape.points[i + 1];

      areaSum = (x * y1) - (x1 * y) + areaSum;
      sumCenterX = (x + x1) * (x * y1 - x1 * y) + sumCenterX;
      sumCenterY = (y + y1) * (x * y1 - x1 * y) + sumCenterY;
    }

    const area = areaConstant * areaSum;
    const centerX = sumCenterX / (centerConstant * area);
    const centerY = sumCenterY / (centerConstant * area);

    return { x: centerX, y: centerY };
  }, [isClosed, shape.points]);

  const textDimensions = useMemo(() => {
    if (isClosed && textRef.current) {
      return {
        width: textRef.current.width(),
        height: textRef.current.height()
      };
    }
    return { width: 0, height: 0 };
  }, [textRef.current, isClosed, shape.points, shape.controlPoints]);

  const calculateShapeBounds = useMemo(() => {
    if (!isClosed || shape.points.length < 2) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const allPoints = [...shape.points, ...shape.controlPoints];
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
  }, [isClosed, shape.points, shape.controlPoints]);

  // Set up shape bounds for transformer
  // This is needed because the transformer is not able to calculate the bounds of the shape
  // when the shape is a custom shape like qcurve
  useEffect(() => {
    if (ref?.current) {
      ref.current.getSelfRect = () => calculateShapeBounds;
    }
    onRestartTransformer?.(ref as RefObject<Konva.Shape>);

  }, [calculateShapeBounds, ref]);

  return (
    <Group {...rest}>
      <Shape
        ref={ref}
        sceneFunc={(ctx, konvaShape) => {
          if (shape.points.length < 2) return;
          // TODO improve this loop part ??
          ctx.beginPath();
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          for (let i = 0; i < shape.points.length - 1; i++) {
            const nextPoint = shape.points[i + 1];
            const controlPoint = shape.controlPoints[i];
            if (controlPoint) {
              ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, nextPoint.x, nextPoint.y);
            }
          }
          if (isClosed) ctx.closePath(); // TODO check if needed
          ctx.fillStrokeShape(konvaShape);
        }}
        fill={shape.fill}
        onClick={() => {
          onShapeSelect?.(shape.id, ref as RefObject<Konva.Shape>);
        }}
        onDblClick={(e) => {
          handleExtraPoint(e);
        }}
        onTransformEnd={onTransformEnd}
        opacity={shape.opacity}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        visible={shape.visible}
      />

      {/* TODO Check if Grouping anchors is better */}
      {/* This is the anchor for the vertex of the shape */}
      {showAnchors && shape.points.map((point, i) => (
        <Circle
          draggable={isClosed}
          fill="white"
          key={`anchor-${i}`}
          onDragEnd={(e) => handleAnchorDrag(i, e)}
          radius={5}
          stroke="gray"
          strokeWidth={1}
          x={point.x}
          y={point.y}
        />
      ))}

      {/* This is the anchor for the curve of the shape */}
      {showAnchors && shape.controlPoints.map((point, i) => (
        <Circle
          draggable={isClosed}
          fill="yellow"
          key={`control-${i}`}
          onDragEnd={(e) => handleControlPointMove(i, e)}
          radius={4}
          stroke="gray"
          strokeWidth={1}
          x={point.x}
          y={point.y}
        />
      ))}

      {shouldSnapToStart && !isClosed && (
        // TODO check if possible to merge this Snapable point preview state + condition
        // with the line preview
        <Circle
          fill="green"
          radius={8}
          stroke="darkgreen"
          strokeWidth={2}
          x={shape.points[0].x}
          y={shape.points[0].y}
        />
      )}

      {!isClosed && previewLinePoints.length > 0 && (
        <Line
          dash={[5, 5]}
          points={previewLinePoints}
          stroke={shouldSnapToStart ? "green" : "red"}
          strokeWidth={2}
        />
      )}

      {isClosed && (
        <Text
          // TODO This is creating a bug when dragging 
          // avoid bubbling up the event to the shape
          // dragBoundFunc={textDragBoundFunc}
          // draggable={isSelected}
          fill="white"
          fontSize={12} //TODO Calculate font size based on the text length and shape size
          offsetX={textDimensions.width / 2}
          offsetY={textDimensions.height / 2}
          ref={textRef}
          text={shape.name || "Opportunity name"}
          x={textCenter.x}
          y={textCenter.y}
        />
      )}
    </Group>
  );
};

export default QCurveShape; 