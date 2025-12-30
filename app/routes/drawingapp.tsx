import type Konva from "konva";
import { useRef, type RefObject, useState } from "react";
import { Layer, Stage, Transformer, Image } from "react-konva";
import { useCanvasReducer } from "~/hooks/useCanvasReducer";
import ShapeRenderer from "~/components/shapes/ShapeRenderer";
import DrawingPanel from "~/components/DrawingPanel";
import Zoom from "~/components/Zoom";
import DevInfo from "~/components/DevInfo";
import type { Point } from "~/types/canvas";
import { shouldSnapToStart, constrainToCardinalDirections } from "~/utils/shapeFactory";
import useImage from "use-image";
import ShapesPanel from "~/components/ShapesPanel";
import { DRAWING_MODES, CANVAS_WIDTH, CANVAS_HEIGHT, MIN_TRANSFORM_SIZE, TRANSFORMER_PADDING } from "~/constants/canvas";

export default function CanvasShapesNew() {
  const {
    addPoint,
    allShapes,
    changeShapePos,
    deleteShape,
    duplicateShape,
    clearCanvas,
    completeShape,
    deselectShape,
    isDrawing,
    selectedShape,
    selectShape,
    setDrawingMode,
    startDrawing,
    state,
    transformShape,
    updateMousePos,
    updateShape,
  } = useCanvasReducer();

  const transformerRef = useRef<Konva.Transformer>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getRelativePointerPosition();
    if (!pos) return;

    let point: Point = { x: pos.x, y: pos.y };

    if (state.drawingMode === DRAWING_MODES.SELECT) return;

    if (isDrawing && state.activeDrawingShape) {
      const activeShape = state.activeDrawingShape;

      if (activeShape.type === DRAWING_MODES.QCURVE || activeShape.type === DRAWING_MODES.BCURVE) {
        if (e.evt.shiftKey && activeShape.points.length > 0) {
          const lastPoint = activeShape.points[activeShape.points.length - 1];
          point = constrainToCardinalDirections(point, lastPoint);
        }

        // This checks if we should snap to start & close (complete the shape) w/ same initial point
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
      if (state.drawingMode === DRAWING_MODES.LINEPOLYGON) {
        startDrawing(DRAWING_MODES.LINEPOLYGON, point);
        completeShape();
      } else {
        startDrawing(state.drawingMode, point);
      }
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getRelativePointerPosition();
    if (!pos) {
      updateMousePos(null);
      return;
    }

    if (e.evt.shiftKey && isDrawing && state.activeDrawingShape) {
      const shape = state.activeDrawingShape;
      if (shape.points.length > 0) {
        const lastPoint = shape.points[shape.points.length - 1];
        const constrainedPos = constrainToCardinalDirections(pos, lastPoint);
        updateMousePos(constrainedPos);
        return;
      }
    }

    updateMousePos(pos);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage() && selectedShape && state.drawingMode === DRAWING_MODES.SELECT) {
      deselectShape();
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  };

  const handleShapeSelect = (shapeId: string, selectedShapeRef: RefObject<Konva.Shape>) => {
    if (state.drawingMode === DRAWING_MODES.SELECT) {
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

  const restartTransformer = (selectedShapeRef: RefObject<Konva.Shape>) => {
    if (transformerRef.current && selectedShapeRef.current && selectedShape) {
      transformerRef.current.nodes([selectedShapeRef.current]);
    }
  };

  // Temporal approach to add an image to the canvas
  const [mapImage] = useImage('./floorplan6.png');
  // Remove once is no longer needed

  return (
    <div className="flex h-screen">
      <div className="flex-1 overflow-auto">
        <Stage
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleStageClick}
          scaleX={zoomLevel}
          scaleY={zoomLevel}
        >
          <Layer>
            {/* Image temporal approach
            This will require manual size setting and positioning
             Remove once is no longer needed
            */}
            <Image
              image={mapImage}
              x={0}
              y={0}
            // width={600}
            // height={832}
            />
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

            {selectedShape && state.drawingMode === DRAWING_MODES.SELECT && (
              <Transformer
                ref={transformerRef}
                padding={TRANSFORMER_PADDING}
                boundBoxFunc={(oldBox, newBox) => {
                  // TODO add max size?
                  if (Math.abs(newBox.width) < MIN_TRANSFORM_SIZE || Math.abs(newBox.height) < MIN_TRANSFORM_SIZE) {
                    return oldBox;
                  }
                  return newBox;
                }}
                onDblClick={() => deselectShape()}
              />
            )}
          </Layer>
        </Stage>
        <Zoom onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      </div>

      {/* TODO create proper Side Panel component for these */}
      <div className="bg-gray-700">
        <DrawingPanel
          currentMode={state.drawingMode}
          onModeChange={setDrawingMode}
          onClearCanvas={clearCanvas}
        />
        <ShapesPanel
          shapes={allShapes}
          onChangeShapePosition={changeShapePos}
          onDuplicateShape={duplicateShape}
          onDeleteShape={deleteShape}
        />
        {process.env.NODE_ENV === 'development' && import.meta.env.DISPLAY_DEV_INFO && (
          <DevInfo
            currentMousePos={state.currentMousePos}
            drawingMode={state.drawingMode}
            shapes={allShapes}
            selectedShapeId={selectedShape?.id || null}
            isDrawing={isDrawing}
            activeDrawingShape={state.activeDrawingShape}
          />
        )}
      </div>
    </div>
  );
} 