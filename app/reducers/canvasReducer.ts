import type { CanvasState, ShapeModel } from "~/types/canvas";
import type { CanvasAction } from "./canvasActions";
import { createShapeByType, calculateQCurveControlPoints, isShapeComplete, shouldSnapToStart } from "~/utils/shapeFactory";

export const initialCanvasState: CanvasState = {
  activeDrawingShape: null,
  currentMousePos: null,
  drawingMode: 'select',
  selectedShapeId: null,
  shapes: new Map(),
  // showGrid: false,
  // snapToGrid: false,
  // gridSize: 20,
};

export const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'START_DRAWING': {
      const { shapeType, point } = action.payload;

      if (state.activeDrawingShape) {
        return state;
      }

      const newShape = createShapeByType(shapeType, point);

      return {
        ...state,
        activeDrawingShape: newShape,
        selectedShapeId: null,
      };
    }

    case 'ADD_POINT': {
      const { point } = action.payload;

      if (!state.activeDrawingShape) {
        return state;
      }

      const shape = state.activeDrawingShape;

      // TODO Consider creating diff cases for diff shapes and make this shorter
      if (shape.type === "qcurve" || shape.type === "bcurve") {
        // TODO Im validating this twice, check if needed or remove
        if (shape.points.length >= 3 && shouldSnapToStart(point, shape.points[0])) {
          const closedPoints = [...shape.points, shape.points[0]];
          let updatedShape: ShapeModel;

          if (shape.type === "qcurve") {
            updatedShape = {
              ...shape,
              points: closedPoints,
              controlPoints: calculateQCurveControlPoints(closedPoints),
              modified: Date.now(),
            };
          } else {
            updatedShape = {
              ...shape,
              controlPoints1: calculateQCurveControlPoints(closedPoints),
              points: closedPoints,
              modified: Date.now(),
            };
          }

          return {
            ...state,
            shapes: new Map(state.shapes).set(shape.id, updatedShape),
            activeDrawingShape: null,
            selectedShapeId: shape.id,
          };
        }

        const newPoints = [...shape.points, point];
        let updatedShape: ShapeModel;

        if (shape.type === "qcurve") {
          updatedShape = {
            ...shape,
            points: newPoints,
            controlPoints: calculateQCurveControlPoints(newPoints),
            modified: Date.now(),
          };
        } else {
          // TODO calculte properly the BCurve Control Points
          updatedShape = {
            ...shape,
            points: newPoints,
            controlPoints1: calculateQCurveControlPoints(newPoints),
            modified: Date.now(),
          };
        }

        return {
          ...state,
          activeDrawingShape: updatedShape,
        };
      }

      return state;
    }

    case 'CHANGE_SHAPE_POS': {
      if (state.shapes.size <= 1) {
        return state;
      }

      const { shape, direction } = action.payload
      const shapesArray = Array.from(state.shapes);
      // TODO consider sending the index instead
      const insertIndex = shapesArray.findIndex(sh => sh[0] === shape.id)

      if (insertIndex < 0) {
        console.warn("Shape not found")
        return state
      }
      // This avoids side effects on first and last item
      // TODO create type for direction
      else if ((insertIndex === 0 && direction === "up") || insertIndex === state.shapes.size - 1 && direction === "down") return state

      const tempShape = shapesArray.splice(insertIndex, 1)[0]

      if (direction === "up") {
        shapesArray.splice(insertIndex - 1, 0, tempShape)
      }
      else if (direction === "down") {
        shapesArray.splice(insertIndex + 1, 0, tempShape)
      }
      else {
        console.warn("Wrong input direction")
      }

      return {
        ...state,
        shapes: new Map(shapesArray)
      }

    }

    case 'COMPLETE_SHAPE': {
      if (!state.activeDrawingShape) {
        return state;
      }

      const shape = state.activeDrawingShape;

      if (shape.type === "linepolygon") {
        return {
          ...state,
          shapes: new Map(state.shapes).set(shape.id, shape),
          activeDrawingShape: null,
          selectedShapeId: shape.id,
        };
      }

      // TODO Consider removing this due Completion of curves is done manually
      // or extend this method to complete all kind of shapes
      if ((shape.type === "qcurve" || shape.type === "bcurve") && shape.points.length >= 3) {
        const updatedShape: ShapeModel = {
          ...shape,
          modified: Date.now(),
        };

        return {
          ...state,
          shapes: new Map(state.shapes).set(shape.id, updatedShape),
          activeDrawingShape: null,
          selectedShapeId: shape.id,
        };
      }

      return state;
    }

    case 'CANCEL_DRAWING': {
      return {
        ...state,
        activeDrawingShape: null,
      };
    }

    case 'SELECT_SHAPE': {
      const { shapeId } = action.payload;

      return {
        ...state,
        selectedShapeId: state.shapes.has(shapeId) ? shapeId : null,
        activeDrawingShape: null, // Cancel any active drawing
      };
    }

    case 'DESELECT_SHAPE': {
      return {
        ...state,
        selectedShapeId: null,
      };
    }

    case 'UPDATE_SHAPE': {
      const { shapeId, updates } = action.payload;
      const existingShape = state.shapes.get(shapeId);

      if (!existingShape) {
        return state;
      }

      if (existingShape.type === "qcurve" && updates?.points) {
        updates.controlPoints = calculateQCurveControlPoints(updates?.points);
      }

      const updatedShape: ShapeModel = {
        ...existingShape,
        ...updates,
        modified: Date.now(),
      };


      return {
        ...state,
        shapes: new Map(state.shapes).set(shapeId, updatedShape),
      };
    }

    case 'TRANSFORM_SHAPE': {
      const { shapeId, ...transform } = action.payload;
      const existingShape = state.shapes.get(shapeId);

      if (!existingShape) {
        return state;
      }

      let updatedShape: ShapeModel;

      if (existingShape.type === "qcurve" && transform.points) {
        updatedShape = {
          ...existingShape,
          ...transform,
          controlPoints: calculateQCurveControlPoints(transform.points),
          modified: Date.now(),
        } as ShapeModel;
      } else {
        updatedShape = {
          ...existingShape,
          ...transform,
          modified: Date.now(),
        } as ShapeModel;
      }

      return {
        ...state,
        shapes: new Map(state.shapes).set(shapeId, updatedShape),
      };
    }

    case 'DELETE_SHAPE': {
      const { shapeId } = action.payload;
      const newShapes = new Map(state.shapes);
      newShapes.delete(shapeId);

      return {
        ...state,
        shapes: newShapes,
        selectedShapeId: state.selectedShapeId === shapeId ? null : state.selectedShapeId,
      };
    }

    case 'SET_DRAWING_MODE': {
      const { mode } = action.payload;

      return {
        ...state,
        drawingMode: mode,
        activeDrawingShape: null,
        selectedShapeId: mode === 'select' ? state.selectedShapeId : null,
      };
    }

    case 'UPDATE_MOUSE_POS': {
      const { pos } = action.payload;

      return {
        ...state,
        currentMousePos: pos,
      };
    }

    //TODO IMPORTANT add a validation before clear the canvas
    case 'CLEAR_CANVAS': {
      return {
        ...state,
        shapes: new Map(),
        selectedShapeId: null,
        activeDrawingShape: null,
      };
    }

    default:
      return state;
  }
}; 