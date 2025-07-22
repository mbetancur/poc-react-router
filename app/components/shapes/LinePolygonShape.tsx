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

  // Use points from shape (should always be 4 for a rectangle)
  const rectPoints: Point[] = useMemo(() => shape.points, [shape.points]);

  // To close polygon, repeat first point at end
  const linePoints = [
    ...rectPoints,
    rectPoints[0]
  ].flatMap(p => [p.x, p.y]);

  // Center of the polygon (average of all points)
  const textCenter: Point = useMemo(() => {
    if (rectPoints.length === 0) return { x: 0, y: 0 };
    const sum = rectPoints.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return {
      x: sum.x / rectPoints.length,
      y: sum.y / rectPoints.length
    };
  }, [rectPoints]);

  const textDimensions = useMemo(() => {
    if (textRef.current) {
      return {
        width: textRef.current.width(),
        height: textRef.current.height()
      };
    }
    return { width: 0, height: 0 };
  }, [textRef, rectPoints]);

  // Bound text within the polygon's bounding box
  const textDragBoundFunc = (pos: Point): Point => {
    const xs = rectPoints.map(p => p.x);
    const ys = rectPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const constrainedX = Math.max(minX, Math.min(pos.x, maxX));
    const constrainedY = Math.max(minY, Math.min(pos.y, maxY));
    return { x: constrainedX, y: constrainedY };
  };

  // Dragging an anchor updates the corresponding point
  const handleAnchorDrag = (anchorIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!onShapeUpdate) return;
    const newX = e.target.x();
    const newY = e.target.y();
    const newPoints = rectPoints.map((p, i) => i === anchorIndex ? { x: newX, y: newY } : p);
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

      {showAnchors && rectPoints.map((point, index) => (
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
        draggable
        dragBoundFunc={textDragBoundFunc}
        fill="white"
        fontSize={12}
        offsetX={textDimensions.width / 2}
        offsetY={textDimensions.height / 2}
        ref={textRef}
        text={shape.name || "Polygon"}
        x={textCenter.x}
        y={textCenter.y}
      />
    </Group>
  );
};

export default LinePolygonShape; 