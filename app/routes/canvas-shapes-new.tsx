import type Konva from "konva";
import { useRef, type RefObject } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import { useCanvasReducer } from "~/hooks/useCanvasReducer";
import ShapeRenderer from "~/components/shapes/ShapeRenderer";
import DrawingPanel from "~/components/DrawingPanel";
import type { Point } from "~/types/canvas";
import { shouldSnapToStart } from "~/utils/shapeFactory";

export default function CanvasShapesNew() {
  const {
    state,
    allShapes,
    selectedShape,
    isDrawing,
    startDrawing,
    addPoint,
    completeShape,
    selectShape,
    deselectShape,
    updateShape,
    transformShape,
    setDrawingMode,
    updateMousePos,
    clearCanvas,
  } = useCanvasReducer();

  const transformerRef = useRef<Konva.Transformer>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();
    if (!pos) return;

    const point: Point = { x: pos.x, y: pos.y };

    if (state.drawingMode === 'select') return;

    if (isDrawing && state.activeDrawingShape) {
      const activeShape = state.activeDrawingShape;

      if (activeShape.type === "qcurve" || activeShape.type === "bcurve") {
        // This checks if we should snap to start (complete the shape) w/ same initial point
        if (activeShape.points.length >= 3 &&
          shouldSnapToStart(point, activeShape.points[0])) {
          addPoint(activeShape.points[0]);
          return;
        }

        addPoint(point);
        return;
      }
    }

    if (!isDrawing) {
      if (state.drawingMode === 'linepolygon') {
        startDrawing('linepolygon', point);
        completeShape();
      } else {
        startDrawing(state.drawingMode, point);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();
    updateMousePos(pos || null);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() && selectedShape && state.drawingMode === 'select') {
      deselectShape();
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  };

  const handleShapeSelect = (shapeId: string, selectedShapeRef: RefObject<Konva.Shape>) => {
    //TODO extract modes in consts
    if (state.drawingMode === 'select') {
      selectShape(shapeId);

      //TODO check the diff with nextTick
      setTimeout(() => {
        if (transformerRef.current && selectedShapeRef.current) {
          transformerRef.current.nodes([selectedShapeRef.current]);
        }
      }, 0);
    }
  };

  const handleShapeUpdate = (shapeId: string, updates: any) => {
    updateShape(shapeId, updates);
  };

  const handleTransformEnd = (shapeId: string, e: Konva.KonvaEventObject<Event>) => {
    console.log('handleTransformEnd', shapeId, e);
    const node = e.target as Konva.Shape;
    const transform = node._getAbsoluteTransform();

    const shape = state.shapes.get(shapeId);
    if (!shape) return;

    if (shape.type === "qcurve" || shape.type === "bcurve") {
      // Transform points for curve shapes
      const transformedPoints = shape.points.map((point) => {
        const transformedPoint = transform.point({ x: point.x, y: point.y });
        return { x: transformedPoint.x, y: transformedPoint.y };
      });

      // Reset node transformation
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);

      transformShape(shapeId, { points: transformedPoints });
    } else if (shape.type === "linepolygon") {
      // For regular polygons, handle position and scale changes
      const rotation = node.getAbsoluteRotation();
      const scale = node.getAbsoluteScale();
      const position = node.getAbsolutePosition();

      // Reset node transformation
      node.scaleX(1);
      node.scaleY(1);
      node.rotation(0);
      node.x(0);
      node.y(0);

      transformShape(shapeId, {
        x: position.x,
        y: position.y,
        points: shape.points,
        rotation: rotation,
      });
    }
  };

  const restartTransformer = (selectedShapeRef: RefObject<Konva.Shape>) => {
    if (transformerRef.current && selectedShapeRef.current && selectedShape) {
      transformerRef.current.nodes([selectedShapeRef.current]);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-hidden">
        <Stage
          // TODO set variables for these size values
          width={1000}
          height={1000 - 80}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleStageClick}
        >
          <Layer>
            {/* This renders the created shapes */}
            {allShapes.map((shape) => (
              <ShapeRenderer
                key={shape.id}
                shape={shape}
                isSelected={selectedShape?.id === shape.id}
                showAnchors={selectedShape?.id === shape.id}
                onShapeSelect={handleShapeSelect}
                onShapeUpdate={(updates) => handleShapeUpdate(shape.id, updates)}
                // onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
                onRestartTransformer={restartTransformer}
              />
            ))}

            {/* This renders the current drawing shape */}
            {isDrawing && state.activeDrawingShape && (
              <ShapeRenderer
                shape={state.activeDrawingShape}
                showAnchors={true}
                currentMousePos={state.currentMousePos}
              />
            )}

            {selectedShape && state.drawingMode === 'select' && (
              <Transformer
                ref={transformerRef}
                padding={20}
                boundBoxFunc={(oldBox, newBox) => {
                  // TODO add max size?
                  if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onDblClick={() => deselectShape()}
              />
            )}
          </Layer>
        </Stage>
      </div>

      <DrawingPanel
        currentMode={state.drawingMode}
        onModeChange={setDrawingMode}
        onClearCanvas={clearCanvas}
      />

      {/* TODO create a component */}
      {/* Dev info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-800 text-white text-xs max-w-40">
          <div>Cursor pos x: {state.currentMousePos?.x} y: {state.currentMousePos?.y}</ div>
          <div>Mode: {state.drawingMode}</div>
          <div>Shapes: {allShapes.length}</div>
          <div>Selected: {selectedShape?.id || 'none'}</div>
          <div>Drawing: {isDrawing ? 'yes' : 'no'}</div>
          {state.activeDrawingShape && (
            <div>Active: {state.activeDrawingShape.type} {(state.activeDrawingShape.type === 'qcurve' || state.activeDrawingShape.type === 'bcurve') && `(${state.activeDrawingShape.points.length} points)`}</div>
          )}
        </div>
      )}
    </div>
  );
} 