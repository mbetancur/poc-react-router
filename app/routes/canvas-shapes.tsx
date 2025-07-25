import type Konva from "konva";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Stage, Transformer, Image } from "react-konva";
import useImage from "use-image";

// TODO create Shape pattern for different shapes and properties
import ShapeQCurveDrawer, { MIN_POINTS_FOR_SNAP, SNAP_DISTANCE, type Point } from "~/components/ShapeQCurveDrawer";

// Utility functions
export const getDistanceBetweenPoints = (p1: Point, p2: Point): number =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

export const getCenter = (points: Point[]) => ({
  x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
  y: points.reduce((sum, p) => sum + p.y, 0) / points.length
});

const getCurveControlPoint = (point: Point, secondPoint: Point): Point => {
  return {
    x: (point.x + secondPoint.x) / 2,
    y: (point.y + secondPoint.y) / 2
  }
}

type ShapeType = "qcurve" | "bcurve"; // Add more types as needed

// TODO create custom hook to save info about the shape
export interface ShapeModel {
  points: Point[];
  controlPoints: Point[]; // curvePoints
  rotation: number;
  type: ShapeType;
  colorSroke: string;
  colorFill: string;
  strokeWidth: number;
  skewX: number; // TODO verify if this is needed
  skewY: number; // TODO verify if this is needed
  width: number;
  height: number;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
}

export default function CanvasShapes() {

  // TODO move to proper file, maybe a reducer - parent for this
  const [shapes, setShapes] = useState<ShapeModel[]>([]);
  const [selectedShape, setSelectedShape] = useState<ShapeModel | null>(null);

  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [isShapeSelected, setIsShapeSelected] = useState(false);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [curveControlPoints, setCurveControlPoints] = useState<Point[]>([]);
  const [rotation, setRotation] = useState(0);

  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Shape>(null);

  const isDrawingStarted = useMemo(() => points.length > 0, [points]);

  // TODO Validate if we want to move the curve control points every time the points change
  // TODO why is react triggerin setPoints twice? WTF!
  useEffect(() => {
    if (points.length >= 2) {
      const newControlPoints: Point[] = [];
      for (let i = 0; i < points.length - 1; i++) {
        newControlPoints.push(getCurveControlPoint(points[i + 1], points[i]));
      }
      setCurveControlPoints(newControlPoints);
    } else {
      setCurveControlPoints([]);
    }
  }, [points]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();
    if (!pos || isShapeClosed) return;

    // TODO validate pos w/ zod or other
    const point: Point = { x: pos.x, y: pos.y };

    if (points.length > MIN_POINTS_FOR_SNAP && getDistanceBetweenPoints(points[0], point) <= SNAP_DISTANCE) {
      setPoints(prev => [...prev, points[0]]);
      setIsShapeClosed(true);
      setCurrentMousePos(null);
      return;
    }

    setPoints(prev => [...prev, point]);
  };


  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawingStarted || isShapeClosed) return;

    const pos = e?.target?.getStage()?.getPointerPosition();
    if (pos) setCurrentMousePos({ x: pos.x, y: pos.y });
  };

  const handlePointMove = (i: number, newX: number, newY: number) => {
    if (!isShapeClosed) return;

    setPoints(prev => {
      const newPoints = [...prev];
      newPoints[i] = { x: newX, y: newY };

      // This is a workaround to sync first/last points
      if (i === 0) newPoints[newPoints.length - 1] = { x: newX, y: newY };
      else if (i === newPoints.length - 1) newPoints[0] = { x: newX, y: newY };

      return newPoints;
    });
  };

  const handleCurveControlMove = (i: number, newX: number, newY: number) => {
    if (!isShapeClosed) return;

    setCurveControlPoints(prev => {
      const newPoints = [...prev];
      newPoints[i] = { x: newX, y: newY };
      return newPoints;
    });
  }

  const selectShapeWithTransformer = () => {
    if (transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
    }
  }

  const handleShapeSelect = () => {
    selectShapeWithTransformer()
    setIsShapeSelected(true);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() && isShapeSelected && isShapeClosed) {
      setIsShapeSelected(false);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    if (!isShapeClosed) return;
    const node = e.target as Konva.Shape;

    const rotation = node.getAbsoluteRotation();
    setRotation(rotation)
    const transform = node._getAbsoluteTransform();
    console.log("node.getAbsolutePosition", node.getAbsolutePosition());
    console.log("transform", transform);
    console.log("node.position", node.position());

    const transformMatrix = transform.getMatrix();
    console.log("transformMatrix", transformMatrix);

    const newPoints = points.map((point, index) => {
      const transformedPoint = transform.point({ x: point.x, y: point.y });

      console.log(`Point ${index}:`, {
        original: point,
        transformed: transformedPoint
      });

      return { x: transformedPoint.x, y: transformedPoint.y };
    });

    console.log("All original points:", points);
    console.log("All transformed points:", newPoints);

    // TODO verify if all these are needed
    // Reset the node's transformation transformations
    node.scaleX(1);
    node.scaleY(1);
    node.rotation(0);
    node.x(0);
    node.y(0);

    setPoints(newPoints);

    console.log("points", points);

    // TODO Verify if this is better than transform point as points above
    // if (newPoints.length >= 2) {
    //   const newControlPoints: Point[] = [];
    //   for (let i = 0; i < newPoints.length - 1; i++) {
    //     newControlPoints.push(getCurveControlPoint(newPoints[i + 1], newPoints[i]));
    //   }
    //   setCurveControlPoints(newControlPoints);
    // }

  };
  // const [mammImage] = useImage('./testmap.png');

  return (
    <div>
      <h1>Drawing Shapes</h1>
      <Stage
        width={2000}
        height={1000}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
      >
        <Layer>
          {/* <ShapeBCurveDrawer
          ref={shapeRef}
          points={points}
          currentMousePos={currentMousePos}
          snapDistance={SNAP_DISTANCE}
          isShapeClosed={isShapeClosed}
          showAnchors={!isShapeClosed || isShapeSelected}
          onPointMove={handlePointMove}
          draggable
          onClick={() => handleShapeSelect()}
        /> */}
          {/* <Image x={1} y={0} image={mammImage} width={2400} height={1563} /> */}
          <ShapeQCurveDrawer
            // TODO improve props + rest props  
            closed={isShapeClosed}
            currentMousePos={currentMousePos}
            curveControlPoints={curveControlPoints}
            draggable={isShapeClosed}
            onCurveControlMove={handleCurveControlMove}
            onPointMove={handlePointMove}
            onRestartTransformer={selectShapeWithTransformer}
            onShapeSelect={handleShapeSelect}
            onTransformEnd={handleTransformEnd}
            points={points}
            ref={shapeRef}
            showAnchors={!isShapeClosed || isShapeSelected}
          />

          {/* DONT REMOVE YET first aprproach with Shapes no curves */}
          {/* <ShapeDrawer
          ref={shapeRef}
          points={points}
          currentMousePos={currentMousePos}
          snapDistance={SNAP_DISTANCE}
          isShapeClosed={isShapeClosed}
          showAnchors={!isShapeClosed || isShapeSelected}
          onPointMove={handlePointMove}
          draggable
          onClick={() => handleShapeSelect()}
        // Watch for changes in points and update the shape
        // check onDragEnd event
        // onPointsChange={() => {
        //   if (shapeRef.current) {
        //     shapeRef.current.points(points);
        //   }
        // }}
        /> */}
          {
            isShapeSelected && (
              <Transformer
                ref={transformerRef}
                padding={20}
                boundBoxFunc={(oldBox, newBox) => {
                  // TODO Add max size
                  if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onDblClick={() => setIsShapeSelected(false)}
              />
            )
          }
        </Layer>
      </Stage>
    </div>
  );
}