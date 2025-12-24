import { DRAWING_MODES } from "~/constants/canvas";

export type Point = {
  x: number;
  y: number;
};

export type ShapeType = typeof DRAWING_MODES.QCURVE | typeof DRAWING_MODES.BCURVE | typeof DRAWING_MODES.LINEPOLYGON;

export interface BaseShapeModel {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  //TODO check if skew props are needed
  // skewX: number;  
  scaleX: number;
  scaleY: number;
  visible: boolean;
  opacity: number;
  // Style properties
  fill: string;
  stroke: string;
  strokeWidth: number;
  // Metadata
  name?: string;
  created: number;
  modified: number;
}

export interface QCurveShapeModel extends BaseShapeModel {
  type: typeof DRAWING_MODES.QCURVE;
  points: Point[];
  controlPoints: Point[];
}

export interface BCurveShapeModel extends BaseShapeModel {
  type: typeof DRAWING_MODES.BCURVE;
  points: Point[];
  controlPoints1: Point[];
  controlPoints2: Point[];
}

export interface LinePolygonShapeModel extends BaseShapeModel {
  type: typeof DRAWING_MODES.LINEPOLYGON;
  points: Point[];
}

export type ShapeModel = QCurveShapeModel | BCurveShapeModel | LinePolygonShapeModel;

export type DrawingMode = typeof DRAWING_MODES[keyof typeof DRAWING_MODES];

export interface CanvasState {
  // Shape Management
  shapes: Map<string, ShapeModel>;
  selectedShapeId: string | null;
  activeDrawingShape: ShapeModel | null;
  
  // Drawing Mode
  drawingMode: DrawingMode;
  
  // Canvas State
  currentMousePos: Point | null;
  
  // UI State
  // showGrid: boolean;
  // snapToGrid: boolean;
  // gridSize: number;
}

export interface CanvasAction {
  type: string;
  payload?: any;
} 