import type { Point, ShapeModel, ShapeType, DrawingMode } from "~/types/canvas";

// Shape Creation & Drawing Actions
export interface StartDrawingAction {
  type: 'START_DRAWING';
  payload: {
    shapeType: ShapeType;
    point: Point;
  };
}

export interface AddPointAction {
  type: 'ADD_POINT';
  payload: {
    point: Point;
  };
}

export interface CompleteShapeAction {
  type: 'COMPLETE_SHAPE';
}

export interface CancelDrawingAction {
  type: 'CANCEL_DRAWING';
}

// Shape Management Actions
export interface SelectShapeAction {
  type: 'SELECT_SHAPE';
  payload: {
    shapeId: string;
  };
}

export interface DeselectShapeAction {
  type: 'DESELECT_SHAPE';
}

export interface UpdateShapeAction {
  type: 'UPDATE_SHAPE';
  payload: {
    shapeId: string;
    updates: Partial<ShapeModel>;
  };
}

export interface TransformShapeAction {
  type: 'TRANSFORM_SHAPE';
  payload: {
    shapeId: string;
    points?: Point[];
    controlPoints?: Point[];
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
  };
}

export interface DeleteShapeAction {
  type: 'DELETE_SHAPE';
  payload: {
    shapeId: string;
  };
}

// UI State Actions
export interface SetDrawingModeAction {
  type: 'SET_DRAWING_MODE';
  payload: {
    mode: DrawingMode;
  };
}

export interface UpdateMousePosAction {
  type: 'UPDATE_MOUSE_POS';
  payload: {
    pos: Point | null;
  };
}

export interface ClearCanvasAction {
  type: 'CLEAR_CANVAS';
}

export type CanvasAction =
  | StartDrawingAction
  | AddPointAction
  | CompleteShapeAction
  | CancelDrawingAction
  | SelectShapeAction
  | DeselectShapeAction
  | UpdateShapeAction
  | TransformShapeAction
  | DeleteShapeAction
  | SetDrawingModeAction
  | UpdateMousePosAction
  | ClearCanvasAction;

export const canvasActions = {
  startDrawing: (shapeType: ShapeType, point: Point): StartDrawingAction => ({
    type: 'START_DRAWING',
    payload: { shapeType, point }
  }),

  addPoint: (point: Point): AddPointAction => ({
    type: 'ADD_POINT',
    payload: { point }
  }),

  completeShape: (): CompleteShapeAction => ({
    type: 'COMPLETE_SHAPE'
  }),

  cancelDrawing: (): CancelDrawingAction => ({
    type: 'CANCEL_DRAWING'
  }),

  selectShape: (shapeId: string): SelectShapeAction => ({
    type: 'SELECT_SHAPE',
    payload: { shapeId }
  }),

  deselectShape: (): DeselectShapeAction => ({
    type: 'DESELECT_SHAPE'
  }),

  updateShape: (shapeId: string, updates: Partial<ShapeModel>): UpdateShapeAction => ({
    type: 'UPDATE_SHAPE',
    payload: { shapeId, updates }
  }),

  transformShape: (shapeId: string, transform: Omit<TransformShapeAction['payload'], 'shapeId'>): TransformShapeAction => ({
    type: 'TRANSFORM_SHAPE',
    payload: { shapeId, ...transform }
  }),

  deleteShape: (shapeId: string): DeleteShapeAction => ({
    type: 'DELETE_SHAPE',
    payload: { shapeId }
  }),

  setDrawingMode: (mode: DrawingMode): SetDrawingModeAction => ({
    type: 'SET_DRAWING_MODE',
    payload: { mode }
  }),

  updateMousePos: (pos: Point | null): UpdateMousePosAction => ({
    type: 'UPDATE_MOUSE_POS',
    payload: { pos }
  }),

  clearCanvas: (): ClearCanvasAction => ({
    type: 'CLEAR_CANVAS'
  })
}; 