export type Point = {
  x: number;
  y: number;
};

export type ShapeType = "qcurve" | "bcurve" | "linepolygon";

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
  type: "qcurve";
  points: Point[];
  controlPoints: Point[];
}

export interface BCurveShapeModel extends BaseShapeModel {
  type: "bcurve";
  points: Point[];
  controlPoints1: Point[];
  controlPoints2: Point[];
}

export interface LinePolygonShapeModel extends BaseShapeModel {
  type: "linepolygon";
  points: Point[];
}

export type ShapeModel = QCurveShapeModel | BCurveShapeModel | LinePolygonShapeModel;

export type DrawingMode = 'select' | 'qcurve' | 'bcurve' | 'linepolygon';

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