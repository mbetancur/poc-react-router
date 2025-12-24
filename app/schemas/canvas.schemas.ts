import { z } from "zod";
import { DRAWING_MODES, DIRECTIONS } from "~/constants/canvas";

// Point schema
export const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

// Shape type schema
export const ShapeTypeSchema = z.enum([
  DRAWING_MODES.QCURVE,
  DRAWING_MODES.BCURVE,
  DRAWING_MODES.LINEPOLYGON,
]);

// Drawing mode schema
export const DrawingModeSchema = z.enum([
  DRAWING_MODES.SELECT,
  DRAWING_MODES.QCURVE,
  DRAWING_MODES.BCURVE,
  DRAWING_MODES.LINEPOLYGON,
]);

// Direction schema
export const DirectionSchema = z.enum([DIRECTIONS.UP, DIRECTIONS.DOWN]);

// Base shape model schema
export const BaseShapeModelSchema = z.object({
  id: z.string().min(1),
  x: z.number().finite(),
  y: z.number().finite(),
  rotation: z.number().finite(),
  scaleX: z.number().finite(),
  scaleY: z.number().finite(),
  visible: z.boolean(),
  opacity: z.number().min(0).max(1),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  name: z.string().optional(),
  created: z.number().int().positive(),
  modified: z.number().int().positive(),
});

// QCurve shape model schema
export const QCurveShapeModelSchema = BaseShapeModelSchema.extend({
  type: z.literal(DRAWING_MODES.QCURVE),
  points: z.array(PointSchema).min(1),
  controlPoints: z.array(PointSchema),
});

// BCurve shape model schema
export const BCurveShapeModelSchema = BaseShapeModelSchema.extend({
  type: z.literal(DRAWING_MODES.BCURVE),
  points: z.array(PointSchema).min(1),
  controlPoints1: z.array(PointSchema),
  controlPoints2: z.array(PointSchema),
});

// LinePolygon shape model schema
export const LinePolygonShapeModelSchema = BaseShapeModelSchema.extend({
  type: z.literal(DRAWING_MODES.LINEPOLYGON),
  points: z.array(PointSchema).min(3),
});

// Shape model schema (discriminated union)
export const ShapeModelSchema = z.discriminatedUnion("type", [
  QCurveShapeModelSchema,
  BCurveShapeModelSchema,
  LinePolygonShapeModelSchema,
]);

// Partial shape model schema for updates
export const PartialShapeModelSchema = z.union([
  QCurveShapeModelSchema.partial(),
  BCurveShapeModelSchema.partial(),
  LinePolygonShapeModelSchema.partial(),
]);

// Canvas state schema
export const CanvasStateSchema = z.object({
  shapes: z.map(z.string(), ShapeModelSchema),
  selectedShapeId: z.string().nullable(),
  activeDrawingShape: ShapeModelSchema.nullable(),
  drawingMode: DrawingModeSchema,
  currentMousePos: PointSchema.nullable(),
});

// Action payload schemas
export const StartDrawingPayloadSchema = z.object({
  shapeType: ShapeTypeSchema,
  point: PointSchema,
});

export const AddPointPayloadSchema = z.object({
  point: PointSchema,
});

export const ChangeShapePosPayloadSchema = z.object({
  shape: ShapeModelSchema,
  direction: DirectionSchema,
});

export const SelectShapePayloadSchema = z.object({
  shapeId: z.string().min(1),
});

export const UpdateShapePayloadSchema = z.object({
  shapeId: z.string().min(1),
  updates: PartialShapeModelSchema,
});

export const TransformShapePayloadSchema = z.object({
  shapeId: z.string().min(1),
  points: z.array(PointSchema).optional(),
  controlPoints: z.array(PointSchema).optional(),
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  rotation: z.number().finite().optional(),
  scaleX: z.number().finite().optional(),
  scaleY: z.number().finite().optional(),
});

export const DeleteShapePayloadSchema = z.object({
  shapeId: z.string().min(1),
});

export const DuplicateShapePayloadSchema = z.object({
  shapeId: z.string().min(1),
});

export const SetDrawingModePayloadSchema = z.object({
  mode: DrawingModeSchema,
});

export const UpdateMousePosPayloadSchema = z.object({
  pos: PointSchema.nullable(),
});

// Shape array schema (for import/export)
export const ShapeArraySchema = z.array(ShapeModelSchema);

// Export type inference helpers
export type PointType = z.infer<typeof PointSchema>;
export type ShapeModelType = z.infer<typeof ShapeModelSchema>;
export type QCurveShapeModelType = z.infer<typeof QCurveShapeModelSchema>;
export type BCurveShapeModelType = z.infer<typeof BCurveShapeModelSchema>;
export type LinePolygonShapeModelType = z.infer<typeof LinePolygonShapeModelSchema>;
export type CanvasStateType = z.infer<typeof CanvasStateSchema>;

