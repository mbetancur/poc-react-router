import type Konva from "konva";
import { useMemo, useRef, useState } from "react";
import { Layer, Stage, Transformer } from "react-konva";

// TODO create Shape pattern for different shapes and properties
import ShapeBCurveDrawer, { MIN_POINTS_FOR_SNAP, SNAP_DISTANCE, type Point } from "~/components/ShapeBCurveDrawer";
import ShapeQCurveDrawer from "~/components/ShapeQCurveDrawer";

export default function CanvasShapes() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Rect>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();

    if (pos && !isShapeClosed) {
      // TODO consider merging state of points here and shapeDrawer (flat map of points)
      if (points.length >= (MIN_POINTS_FOR_SNAP / 2)) {
        const initialPoint = points[0];
        // TODO move to utils
        const distance = Math.sqrt(
          Math.pow(pos.x - initialPoint.x, 2) +
          Math.pow(pos.y - initialPoint.y, 2)
        );

        if (distance <= SNAP_DISTANCE) {
          setPoints(prev => [...prev, initialPoint]);
          setIsShapeClosed(true);
          setCurrentMousePos(null);
          return;
        }
      }

      setPoints(prev => [...prev, pos]);
    }
  };

  const isDrawingStarted: boolean = useMemo(() => points.length > 0, [points]);

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    //TODO change to false when shape is closed
    if (!isDrawingStarted) return;

    const pos = e?.target?.getStage()?.getPointerPosition();

    if (pos && !isShapeClosed) {
      setCurrentMousePos(pos);
    }
  };

  const handlePointMove = (i: number, newX: number, newY: number) => {
    if (!isShapeClosed) return;

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints[i] = { x: newX, y: newY };

      if (prev.length > 0) {
        if (i === 0) {
          newPoints[newPoints.length - 1] = { x: newX, y: newY };
        } else if (i === newPoints.length - 1) {
          newPoints[0] = { x: newX, y: newY };
        }
      }

      return newPoints;
    });
  };

  const handleShapeSelect = () => {
    setIsSelected(true);
    if (transformerRef && transformerRef.current && shapeRef.current) {
      transformerRef.current?.nodes([shapeRef.current as Konva.Node]);
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!isShapeClosed) return;

    const node = e.target as Konva.Rect;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    let sumX = 0;
    let sumY = 0;
    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
    }
    const centerX = sumX / points.length;
    const centerY = sumY / points.length;

    const newPoints = points.map(point => ({
      x: centerX + (point.x - centerX) * scaleX,
      y: centerY + (point.y - centerY) * scaleY
    }));

    setPoints(newPoints);
  };

  return (
    <div>
      <h1>Drawing Shapes</h1>
      <Stage
        width={1200}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          {/* <ShapeBCurveDrawer
          ref={shapeRef}
          points={points.flatMap(point => [point.x, point.y])}
          currentMousePos={currentMousePos}
          snapDistance={SNAP_DISTANCE}
          isShapeClosed={isShapeClosed}
          showAnchors={!isShapeClosed || isSelected}
          onPointMove={handlePointMove}
          draggable
          onClick={() => handleShapeSelect()}
        /> */}
          <ShapeQCurveDrawer
            shapeRef={shapeRef as React.RefObject<Konva.Rect>}
            points={points.flatMap(point => [point.x, point.y])}
            currentMousePos={currentMousePos}
            snapDistance={SNAP_DISTANCE}
            closed={isShapeClosed}
            showAnchors={!isShapeClosed || isSelected}
            onPointMove={handlePointMove}
            onShapeSelect={handleShapeSelect}
            draggable
            onTransformEnd={handleTransformEnd}
          />

          {/* DONT REMOVE YET first aprproach with Shapes no curves */}
          {/* <ShapeDrawer
          ref={shapeRef}
          points={points.flatMap(point => [point.x, point.y])}
          currentMousePos={currentMousePos}
          snapDistance={SNAP_DISTANCE}
          isShapeClosed={isShapeClosed}
          showAnchors={!isShapeClosed || isSelected}
          onPointMove={handlePointMove}
          draggable
          onClick={() => handleShapeSelect()}
        // Watch for changes in points and update the shape
        // check onDragEnd event
        // onPointsChange={() => {
        //   if (shapeRef.current) {
        //     shapeRef.current.points(points.flatMap(point => [point.x, point.y]));
        //   }
        // }}
        /> */}
          {
            isSelected && (
              // TODO consider if avoid using expander due it looks ugly 
              // or check how to expand the shape instead of visually scaling
              // FIXME bug in tranformer , creating extra space - check hitFunc vs sceneFunc
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Add max size
                  if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onDblClick={() => setIsSelected(false)}
              />
            )
          }
        </Layer>
      </Stage>
    </div>
  );
}