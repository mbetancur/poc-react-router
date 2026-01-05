import type Konva from "konva";
import { useRef, useMemo, type RefObject } from "react";
import { Group, Text, Circle, Line } from "react-konva";
import type { LinePolygonShapeModel, Point } from "~/types/canvas";
import { getTwoClosestPoints } from "~/utils/shapeFactory";
import { calculateCentroid, getTextDimensions, createTextDragBoundFunc } from "~/utils/shapeHelpers";

interface LinePolygonShapeProps extends Konva.ShapeConfig {
  isSelected?: boolean;
  onShapeSelect?: (shapeId: string, selectedShapeRef: RefObject<Konva.Shape>) => void;
  onShapeUpdate?: (updates: Partial<LinePolygonShapeModel>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  ref?: React.RefObject<Konva.Line | null>;
  shape: LinePolygonShapeModel;
  showAnchors?: boolean;
}
// TODO COnsider mixing QCurve and LinePolygon shapes
const LinePolygonShape = ({
  isSelected = false,
  onShapeSelect,
  onShapeUpdate,
  onTransformEnd,
  ref,
  shape,
  showAnchors = false,
  ...rest
}: LinePolygonShapeProps) => {
  const textRef = useRef<Konva.Text>(null);

  const linePoints = [
    ...shape.points,
  ].flatMap(p => [p.x, p.y]);

  const textCenter: Point = useMemo(() => {
    if (shape.points.length < 2) {
      return { x: 0, y: 0 };
    }
    // LinePolygon is not closed in the points array, so we pass false
    return calculateCentroid(shape.points, false);
  }, [shape.points]);

  const textDimensions = useMemo(() => {
    if (textRef.current) {
      return getTextDimensions(textRef.current);
    }
    return { width: 0, height: 0 };
  }, [textRef.current, shape.points]);

  const textDragBoundFunc = useMemo(() => createTextDragBoundFunc(ref as React.RefObject<Konva.Shape | null>, textRef), [ref, textRef]);

  const handleAnchorDrag = (anchorIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true; 
    if (!onShapeUpdate) return;
    const newX = e.target.x();
    const newY = e.target.y();
    const newPoints = [...shape.points];
    newPoints[anchorIndex] = { x: newX, y: newY };
    onShapeUpdate({ points: newPoints });
  };

  const handleExtraPoint = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onShapeUpdate && e.type === 'dblclick' && e.evt.ctrlKey === true) {
      const stage = e.target.getStage();
      const pos = stage?.getRelativePointerPosition();
      if (!pos) return;
      
      const newPoint = { x: pos.x, y: pos.y };
      const tempPoints = [...shape.points];

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
        onShapeUpdate({ points: tempPoints });
      }
      else {
        console.warn('Error calculating shape points')
      }
    }
  };

  return (
    <Group {...rest}>
      <Line
        ref={ref}
        points={linePoints}
        closed
        fill={shape.fill}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        opacity={shape.opacity}
        visible={shape.visible}
        onClick={() => {
          onShapeSelect?.(shape.id, ref as RefObject<Konva.Shape>);
        }}
        onDblClick={(e) => {
          handleExtraPoint(e);
        }}
        onTransformEnd={onTransformEnd}
      />

      {showAnchors && shape.points.map((point, index) => (
        <Circle
          draggable
          fill="white"
          key={index}
          onDragEnd={(e) => handleAnchorDrag(index, e)}
          radius={5}
          stroke="gray"
          strokeWidth={1}
          x={point.x}
          y={point.y}
        />
      ))}

      <Text
        // TODO check bug with dragBoundFunc
        // dragBoundFunc={textDragBoundFunc}
        // // draggable={isSelected}
        fill="white"
        fontSize={12}
        offsetX={textDimensions.width / 2}
        offsetY={textDimensions.height / 2}
        ref={textRef}
        text={shape.name || "Opportunity name"}
        x={textCenter.x}
        y={textCenter.y}
      />
    </Group>
  );
};

export default LinePolygonShape; 