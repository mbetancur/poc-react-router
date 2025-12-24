import type { CanvasState, ShapeModel } from "~/types/canvas";
import type { CanvasAction } from "./canvasActions";
import { createShapeByType, calculateQCurveControlPoints, isShapeComplete, shouldSnapToStart } from "~/utils/shapeFactory";
import { DRAWING_MODES, DIRECTIONS, DUPLICATE_OFFSET } from "~/constants/canvas";
import type { Point } from "~/types/canvas";
import {
  StartDrawingPayloadSchema,
  AddPointPayloadSchema,
  ChangeShapePosPayloadSchema,
  SelectShapePayloadSchema,
  UpdateShapePayloadSchema,
  TransformShapePayloadSchema,
  DeleteShapePayloadSchema,
  DuplicateShapePayloadSchema,
  SetDrawingModePayloadSchema,
  UpdateMousePosPayloadSchema,
} from "~/schemas/canvas.schemas";

export const initialCanvasState: CanvasState = {
  activeDrawingShape: null,
  currentMousePos: null,
  drawingMode: DRAWING_MODES.SELECT,
  selectedShapeId: null,
  shapes: new Map(),
  // showGrid: false,
  // snapToGrid: false,
  // gridSize: 20,
};

export const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'START_DRAWING': {
      const validatedPayload = StartDrawingPayloadSchema.parse(action.payload);
      const { shapeType, point } = validatedPayload;

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
      const validatedPayload = AddPointPayloadSchema.parse(action.payload);
      const { point } = validatedPayload;

      if (!state.activeDrawingShape) {
        return state;
      }

      const shape = state.activeDrawingShape;

      // TODO Consider creating diff cases for diff shapes and make this shorter
      if (shape.type === DRAWING_MODES.QCURVE || shape.type === DRAWING_MODES.BCURVE) {
        // TODO Im validating this twice, check if needed or remove
        if (shape.points.length >= 3 && shouldSnapToStart(point, shape.points[0])) {
          const closedPoints = [...shape.points, shape.points[0]];
          let updatedShape: ShapeModel;

          if (shape.type === DRAWING_MODES.QCURVE) {
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

        if (shape.type === DRAWING_MODES.QCURVE) {
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

      const validatedPayload = ChangeShapePosPayloadSchema.parse(action.payload);
      const { shape, direction } = validatedPayload
      const shapesArray = Array.from(state.shapes);
      // TODO consider sending the index instead
      const insertIndex = shapesArray.findIndex(sh => sh[0] === shape.id)

      if (insertIndex < 0) {
        console.warn("Shape not found")
        return state
      }
      // This avoids side effects on first and last item
      else if ((insertIndex === 0 && direction === DIRECTIONS.UP) || insertIndex === state.shapes.size - 1 && direction === DIRECTIONS.DOWN) return state

      const tempShape = shapesArray.splice(insertIndex, 1)[0]

      if (direction === DIRECTIONS.UP) {
        shapesArray.splice(insertIndex - 1, 0, tempShape)
      }
      else if (direction === DIRECTIONS.DOWN) {
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

      if (shape.type === DRAWING_MODES.LINEPOLYGON) {
        return {
          ...state,
          shapes: new Map(state.shapes).set(shape.id, shape),
          activeDrawingShape: null,
          selectedShapeId: shape.id,
        };
      }

      // TODO Consider removing this due Completion of curves is done manually
      // or extend this method to complete all kind of shapes
      if ((shape.type === DRAWING_MODES.QCURVE || shape.type === DRAWING_MODES.BCURVE) && shape.points.length >= 3) {
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
      const validatedPayload = SelectShapePayloadSchema.parse(action.payload);
      const { shapeId } = validatedPayload;

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
      const validatedPayload = UpdateShapePayloadSchema.parse(action.payload);
      const { shapeId, updates } = validatedPayload;
      const existingShape = state.shapes.get(shapeId);

      if (!existingShape) {
        return state;
      }

      if (existingShape.type === DRAWING_MODES.QCURVE && updates?.points) {
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
      const validatedPayload = TransformShapePayloadSchema.parse(action.payload);
      const { shapeId, ...transform } = validatedPayload;
      const existingShape = state.shapes.get(shapeId);

      if (!existingShape) {
        return state;
      }

      let updatedShape: ShapeModel;

      if (existingShape.type === DRAWING_MODES.QCURVE && transform.points) {
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
      const validatedPayload = DeleteShapePayloadSchema.parse(action.payload);
      const { shapeId } = validatedPayload;
      const newShapes = new Map(state.shapes);
      newShapes.delete(shapeId);

      return {
        ...state,
        shapes: newShapes,
        selectedShapeId: state.selectedShapeId === shapeId ? null : state.selectedShapeId,
      };
    }

    case 'DUPLICATE_SHAPE': {
      const validatedPayload = DuplicateShapePayloadSchema.parse(action.payload);
      const { shapeId } = validatedPayload;
      const original = state.shapes.get(shapeId);
      if (!original) return state;

      const now = Date.now();
      const newId = crypto.randomUUID();

      const offsetPoint = (p: Point) => ({ x: p.x + DUPLICATE_OFFSET, y: p.y + DUPLICATE_OFFSET });

      let duplicated: ShapeModel;
      if (original.type === DRAWING_MODES.QCURVE) {
        duplicated = {
          ...original,
          id: newId,
          name: original.name ? `${original.name} (copy)` : undefined,
          points: original.points.map(offsetPoint),
          controlPoints: original.controlPoints.map(offsetPoint),
          created: now,
          modified: now,
        };
      } else if (original.type === DRAWING_MODES.BCURVE) {
        duplicated = {
          ...original,
          id: newId,
          name: original.name ? `${original.name} (copy)` : undefined,
          points: original.points.map(offsetPoint),
          controlPoints1: original.controlPoints1.map(offsetPoint),
          controlPoints2: original.controlPoints2.map(offsetPoint),
          created: now,
          modified: now,
        };
      } else {
        duplicated = {
          ...original,
          id: newId,
          name: original.name ? `${original.name} (copy)` : undefined,
          points: original.points.map(offsetPoint),
          created: now,
          modified: now,
        };
      }

      const arr = Array.from(state.shapes);
      const idx = arr.findIndex(([id]) => id === shapeId);
      const entry: [string, ShapeModel] = [duplicated.id, duplicated];
      if (idx === -1) {
        arr.push(entry);
      } else {
        arr.splice(idx + 1, 0, entry);
      }

      return {
        ...state,
        shapes: new Map(arr),
        selectedShapeId: duplicated.id,
      };
    }

    case 'SET_DRAWING_MODE': {
      const validatedPayload = SetDrawingModePayloadSchema.parse(action.payload);
      const { mode } = validatedPayload;

      return {
        ...state,
        drawingMode: mode,
        activeDrawingShape: null,
        selectedShapeId: mode === DRAWING_MODES.SELECT ? state.selectedShapeId : null,
      };
    }

    case 'UPDATE_MOUSE_POS': {
      const validatedPayload = UpdateMousePosPayloadSchema.parse(action.payload);
      const { pos } = validatedPayload;

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