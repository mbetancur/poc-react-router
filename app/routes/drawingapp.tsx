import type Konva from "konva";
import { useRef, type RefObject } from "react";
import { Layer, Stage, Transformer, Image } from "react-konva";
import { useCanvasReducer } from "~/hooks/useCanvasReducer";
import ShapeRenderer from "~/components/shapes/ShapeRenderer";
import DrawingPanel from "~/components/DrawingPanel";
import type { Point } from "~/types/canvas";
import { shouldSnapToStart, constrainToCardinalDirections } from "~/utils/shapeFactory";
import useImage from "use-image";
import ShapesPanel from "~/components/ShapesPanel";

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

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getRelativePointerPosition();
    if (!pos) return;

    let point: Point = { x: pos.x, y: pos.y };

    if (state.drawingMode === 'select') return;

    if (isDrawing && state.activeDrawingShape) {
      const activeShape = state.activeDrawingShape;

      if (activeShape.type === "qcurve" || activeShape.type === "bcurve") {
        if (e.evt.shiftKey && activeShape.points.length > 0) {
          const lastPoint = activeShape.points[activeShape.points.length - 1];
          point = constrainToCardinalDirections(point, lastPoint);
        }

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
          // TODO set variables for these size values
          width={5230}
          height={5299}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onClick={handleStageClick}
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
        {/* TODO create a component */}
        {/* Dev info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-800 text-white text-xs max-w-40 fixed bottom-0 right-0" >
            <div>Cursor pos x: {state.currentMousePos?.x} y: {state.currentMousePos?.y}</ div>
            <div>Mode: {state.drawingMode}</div>
            <div>Shapes: {allShapes.length}</div>
            <div>Selected: {selectedShape?.id || 'none'}</div>
            <div>Drawing: {isDrawing ? 'yes' : 'no'}</div>
            {state.activeDrawingShape && (
              <div>Active: {state.activeDrawingShape.type} {(state.activeDrawingShape.type === 'qcurve' || state.activeDrawingShape.type === 'bcurve') && `(${state.activeDrawingShape.points.length} points)`}</div>
            )}
            {/* Temporal approach to export shapes 
            Remove once is no longer needed
          */}
            <button
              onClick={() => {
                console.log(allShapes);
                const dataStr = JSON.stringify(allShapes, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'shapes-export.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="bg-orange-500 "
            >
              Temporal export shapes
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 