import type Konva from "konva";
import { useRef, type RefObject } from "react";
import type { ShapeModel, Point } from "~/types/canvas";
import QCurveShape from "./QCurveShape";
import LinePolygonShape from "./LinePolygonShape";

interface ShapeRendererProps {
  shape: ShapeModel;
  isSelected?: boolean;
  showAnchors?: boolean;
  currentMousePos?: Point | null;
  onShapeSelect?: (shapeId: string, selectedShapeRef: RefObject<Konva.Shape>) => void;
  onTransformEnd?: (e: Konva.KonvaEventObject<Event>) => void;
  onShapeUpdate?: (updates: Partial<ShapeModel>) => void;
  onRestartTransformer?: (selectedShapeRef: RefObject<Konva.Shape>) => void;
}

const ShapeRenderer = ({
  shape,
  isSelected = false,
  showAnchors = false,
  currentMousePos,
  onShapeSelect,
  onTransformEnd,
  onShapeUpdate,
  onRestartTransformer,
}: ShapeRendererProps) => {

  const shapeRef = useRef<Konva.Line | null>(null);

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!onShapeUpdate) return;

    const node = e.target as Konva.Shape;
    const transform = node._getAbsoluteTransform();

    // TODO add bcurve support
    if (shape.type === "qcurve") {
      const transformedPoints = shape.points.map((point) => {
        const transformedPoint = transform.point({ x: point.x, y: point.y });
        return { x: transformedPoint.x, y: transformedPoint.y };
      });

      const transformedControlPoints = shape.controlPoints.map((point) => {
        const transformedPoint = transform.point({ x: point.x, y: point.y });
        return { x: transformedPoint.x, y: transformedPoint.y };
      });

      // Reset node transformation
      // TODO verify if all these are needed
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);

      onShapeUpdate({ points: transformedPoints, controlPoints: transformedControlPoints } as Partial<ShapeModel>);
    } else if (shape.type === "linepolygon") {
      // For rectangles, handle position and scale changes
      const rotation = node.getAbsoluteRotation();
      const scale = node.getAbsoluteScale();
      const position = node.getAbsolutePosition();

      // Reset node transformation
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);

      onShapeUpdate({
        x: position.x,
        y: position.y,
        points: shape.points,
        // TODO verify if storing rotation is needed
        rotation: rotation,
      } as Partial<ShapeModel>);
    }

    onTransformEnd?.(e);
  };

  const handleShapeUpdate = (updates: Partial<ShapeModel>) => {
    onShapeUpdate?.(updates);
  };

  switch (shape.type) {
    case "qcurve":
      return (
        <QCurveShape
          currentMousePos={currentMousePos}
          draggable={isSelected}
          isSelected={isSelected}
          onRestartTransformer={onRestartTransformer}
          onShapeSelect={onShapeSelect}
          onShapeUpdate={handleShapeUpdate}
          onTransformEnd={handleTransformEnd}
          ref={shapeRef}
          shape={shape}
          showAnchors={showAnchors}
        />
      );
    case "bcurve":
      // TODO: Implement BCurveShape component
      return (
        <QCurveShape
          ref={shapeRef}
          shape={shape as any}
          isSelected={isSelected}
          showAnchors={showAnchors}
          currentMousePos={currentMousePos}
          onShapeSelect={onShapeSelect}
          onTransformEnd={handleTransformEnd}
          onShapeUpdate={handleShapeUpdate}
        />
      );
    case "linepolygon":
      return (
        <LinePolygonShape
          draggable={isSelected}
          isSelected={isSelected}
          onShapeSelect={onShapeSelect}
          onShapeUpdate={handleShapeUpdate}
          onTransformEnd={handleTransformEnd}
          ref={shapeRef}
          shape={shape}
          showAnchors={showAnchors}
        />
      );

    default:
      console.warn(`Unknown shape type: ${(shape as any).type}`);
      return null;
  }
};

export default ShapeRenderer; 