import { useReducer, useCallback } from 'react';
import type { Point, ShapeType, ShapeModel, DrawingMode } from '~/types/canvas';
import { canvasReducer, initialCanvasState } from '~/reducers/canvasReducer';
import { canvasActions } from '~/reducers/canvasActions';
import type { Direction } from '~/constants/canvas';

export const useCanvasReducer = () => {
  const [state, dispatch] = useReducer(canvasReducer, initialCanvasState);

  //TODO consider creating diff customreducers to split this. Maybe useContext for canva state
  // Drawing operations
  const startDrawing = useCallback((shapeType: ShapeType, point: Point) => {
    dispatch(canvasActions.startDrawing(shapeType, point));
  }, []);

  const addPoint = useCallback((point: Point) => {
    dispatch(canvasActions.addPoint(point));
  }, []);

  const changeShapePos = useCallback((shape: ShapeModel, direction: Direction) => {
    dispatch(canvasActions.changeShapePos(shape, direction));
  }, []);

  const completeShape = useCallback(() => {
    dispatch(canvasActions.completeShape());
  }, []);

  const cancelDrawing = useCallback(() => {
    dispatch(canvasActions.cancelDrawing());
  }, []);

  // Shape management
  const selectShape = useCallback((shapeId: string) => {
    dispatch(canvasActions.selectShape(shapeId));
  }, []);

  const deselectShape = useCallback(() => {
    dispatch(canvasActions.deselectShape());
  }, []);

  const updateShape = useCallback((shapeId: string, updates: Partial<ShapeModel>) => {
    dispatch(canvasActions.updateShape(shapeId, updates));
  }, []);

  const transformShape = useCallback((shapeId: string, transform: any) => {
    dispatch(canvasActions.transformShape(shapeId, transform));
  }, []);

  const deleteShape = useCallback((shapeId: string) => {
    dispatch(canvasActions.deleteShape(shapeId));
  }, []);

  const duplicateShape = useCallback((shapeId: string) => {
    dispatch(canvasActions.duplicateShape(shapeId));
  }, []);

  // UI operations
  const setDrawingMode = useCallback((mode: DrawingMode) => {
    dispatch(canvasActions.setDrawingMode(mode));
  }, []);

  const updateMousePos = useCallback((pos: Point | null) => {
    dispatch(canvasActions.updateMousePos(pos));
  }, []);

  const clearCanvas = useCallback(() => {
    // Only show confirmation if there are shapes on the canvas
    if (state.shapes.size > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to clear the canvas? This will delete all ${state.shapes.size} shape(s) and cannot be undone.`
      );
      if (!confirmed) {
        return;
      }
    }
    dispatch(canvasActions.clearCanvas());
  }, [state.shapes.size]);

  const createShapeFromDetection = useCallback((points: Point[]) => {
    dispatch(canvasActions.createShapeFromDetection(points));
  }, []);

  const allShapes = Array.from(state.shapes.values());
  const selectedShape = state.selectedShapeId ? state.shapes.get(state.selectedShapeId) : null;
  const isDrawing = state.activeDrawingShape !== null;

  return {
    state,
    allShapes,
    selectedShape,
    isDrawing,
    startDrawing,
    addPoint,
    changeShapePos,
    completeShape,
    cancelDrawing,
    selectShape,
    deselectShape,
    updateShape,
    transformShape,
    deleteShape,
    duplicateShape,
    setDrawingMode,
    updateMousePos,
    clearCanvas,
    createShapeFromDetection,
  };
}; 