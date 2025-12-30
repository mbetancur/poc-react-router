import type { ShapeModel, DrawingMode, Point } from "~/types/canvas";
import { DRAWING_MODES } from "~/constants/canvas";
import { ShapeArraySchema } from "~/schemas/canvas.schemas";

interface DevInfoProps {
  currentMousePos: Point | null;
  drawingMode: DrawingMode;
  shapes: ShapeModel[];
  selectedShapeId: string | null;
  isDrawing: boolean;
  activeDrawingShape: ShapeModel | null;
}

const DevInfo = ({
  currentMousePos,
  drawingMode,
  shapes,
  selectedShapeId,
  isDrawing,
  activeDrawingShape,
}: DevInfoProps) => {
  const handleExport = () => {
    try {
      // Validate shapes before export
      const validatedShapes = ShapeArraySchema.parse(shapes);
      console.log('Validated shapes:', validatedShapes);

      const dataStr = JSON.stringify(validatedShapes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shapes-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`Successfully exported ${validatedShapes.length} shape(s)!`);
    } catch (error) {
      console.error('Export validation error:', error);
      alert('Failed to export shapes. Some shapes may have invalid data. Check console for details.');
    }
  };

  return (
    <div className="bg-gray-800 text-white text-xs max-w-40 fixed bottom-0 right-0">
      <div>Cursor pos x: {currentMousePos?.x} y: {currentMousePos?.y}</div>
      <div>Mode: {drawingMode}</div>
      <div>Shapes: {shapes.length}</div>
      <div>Selected: {selectedShapeId || 'none'}</div>
      <div>Drawing: {isDrawing ? 'yes' : 'no'}</div>
      {activeDrawingShape && (
        <div>
          Active: {activeDrawingShape.type}{' '}
          {(activeDrawingShape.type === DRAWING_MODES.QCURVE ||
            activeDrawingShape.type === DRAWING_MODES.BCURVE) &&
            `(${activeDrawingShape.points.length} points)`}
        </div>
      )}
      <button
        onClick={handleExport}
        className="bg-orange-500"
      >
        Export shapes (validated)
      </button>
    </div>
  );
};

export default DevInfo;

