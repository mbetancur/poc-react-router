import type Konva from "konva";
import { useRef, useMemo } from "react";
import { Rect, Group, Text, Circle } from "react-konva";
import type { RectangleShapeModel, Point } from "~/types/canvas";

interface RectangleShapeProps extends Konva.ShapeConfig {
  isSelected?: boolean;
  onShapeSelect?: () => void;
  onShapeUpdate?: (updates: Partial<RectangleShapeModel>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  ref?: React.RefObject<Konva.Rect | null>;
  shape: RectangleShapeModel;
  showAnchors?: boolean;
}

const RectangleShape = ({
  isSelected = false,
  onShapeSelect,
  onShapeUpdate,
  onTransformEnd,
  ref,
  shape,
  showAnchors = false,
  ...rest
}: RectangleShapeProps) => {
  const textRef = useRef<Konva.Text>(null);

  const textCenter: Point = useMemo(() => {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2
    };
  }, [shape.x, shape.y, shape.width, shape.height]);

  const textDimensions = useMemo(() => {
    if (textRef.current) {
      return {
        width: textRef.current.width(),
        height: textRef.current.height()
      };
    }
    return { width: 0, height: 0 };
  }, [textRef, shape]);

  const textDragBoundFunc = (pos: Point): Point => {
    // Keep text within rectangle bounds
    const rectBounds = {
      left: shape.x,
      right: shape.x + shape.width,
      top: shape.y,
      bottom: shape.y + shape.height
    };

    const constrainedX = Math.max(rectBounds.left, Math.min(pos.x, rectBounds.right));
    const constrainedY = Math.max(rectBounds.top, Math.min(pos.y, rectBounds.bottom));

    return { x: constrainedX, y: constrainedY };
  };

  const anchorPoints = useMemo(() => {
    if (!showAnchors) return [];

    return [
      { x: shape.x, y: shape.y }, // top-left
      { x: shape.x + shape.width, y: shape.y }, // top-right
      { x: shape.x + shape.width, y: shape.y + shape.height }, // bottom-right
      { x: shape.x, y: shape.y + shape.height }, // bottom-left
    ];
  }, [shape, showAnchors]);

  const handleAnchorDrag = (anchorIndex: number, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!onShapeUpdate) return;

    const newX = e.target.x();
    const newY = e.target.y();

    let updates: Partial<RectangleShapeModel> = {};

    switch (anchorIndex) {
      case 0: // top-left
        updates = {
          x: newX,
          y: newY,
          width: shape.width + (shape.x - newX),
          height: shape.height + (shape.y - newY)
        };
        break;
      case 1: // top-right
        updates = {
          y: newY,
          width: newX - shape.x,
          height: shape.height + (shape.y - newY)
        };
        break;
      case 2: // bottom-right
        updates = {
          width: newX - shape.x,
          height: newY - shape.y
        };
        break;
      case 3: // bottom-left
        updates = {
          x: newX,
          width: shape.width + (shape.x - newX),
          height: newY - shape.y
        };
        break;
    }

    onShapeUpdate(updates);
  };

  return (
    <Group {...rest}>
      <Rect
        fill={shape.fill}
        height={shape.height}
        onClick={() => onShapeSelect?.()}
        onTransformEnd={onTransformEnd}
        opacity={shape.opacity}
        ref={ref}
        rotation={shape.rotation}
        scaleX={shape.scaleX}
        scaleY={shape.scaleY}
        stroke={shape.stroke}
        strokeWidth={shape.strokeWidth}
        visible={shape.visible}
        width={shape.width}
        x={shape.x}
        y={shape.y}
      />

      {showAnchors && anchorPoints.map((point, index) => (
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
        text={shape.name || "Rectangle"}
        x={textCenter.x}
        y={textCenter.y}
      />
    </Group>
  );
};

export default RectangleShape; 