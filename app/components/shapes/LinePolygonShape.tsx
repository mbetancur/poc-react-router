import type Konva from "konva";
import { useRef, useMemo, type RefObject } from "react";
import { Group, Text, Circle, Line } from "react-konva";
import type { LinePolygonShapeModel, Point } from "~/types/canvas";

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

  // TODO: Move to utils due both QCurve and LinePolygon use it
  const textCenter: Point = useMemo(() => {
    if (shape.points.length < 2) {
      return { x: 0, y: 0 };
    }
    // Copying first point to end to calculate centroid accurately
    const tmpPoints = [...shape.points, shape.points[0]];
    // Calculate centroid using shoelace formula
    const areaConstant = 0.5;
    const centerConstant = 6;

    let areaSum = 0;
    let sumCenterX = 0;
    let sumCenterY = 0;

    for (let i = 0; i < tmpPoints.length - 1; i++) {
      const { x, y } = tmpPoints[i];
      const { x: x1, y: y1 } = tmpPoints[i + 1];

      areaSum = (x * y1) - (x1 * y) + areaSum;
      sumCenterX = (x + x1) * (x * y1 - x1 * y) + sumCenterX;
      sumCenterY = (y + y1) * (x * y1 - x1 * y) + sumCenterY;
    }

    const area = areaConstant * areaSum;
    const centerX = sumCenterX / (centerConstant * area);
    const centerY = sumCenterY / (centerConstant * area);

    return { x: centerX, y: centerY };
  }, [shape.points]);

  // TODO: Move to utils due both QCurve and LinePolygon use it
  const textDimensions = useMemo(() => {
    if (textRef.current) {
      return {
        width: textRef.current.width(),
        height: textRef.current.height()
      };
    }
    return { width: 0, height: 0 };
  }, [textRef.current, shape.points]);

  // TODO: Move to utils due both QCurve and LinePolygon use it
  const textDragBoundFunc = (pos: Point): Point => {
    if (ref?.current && textRef.current) {
      if (ref.current.intersects(pos)) {
        return pos;
      }
      return textRef.current.position();
    }
    return pos;
  };

  const handleAnchorDrag = (anchorIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!onShapeUpdate) return;
    const newX = e.target.x();
    const newY = e.target.y();
    const newPoints = [...shape.points];
    newPoints[anchorIndex] = { x: newX, y: newY };
    onShapeUpdate({ points: newPoints });
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