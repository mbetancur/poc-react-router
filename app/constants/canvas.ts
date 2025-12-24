export const DRAWING_MODES = {
  SELECT: 'select',
  QCURVE: 'qcurve',
  BCURVE: 'bcurve',
  LINEPOLYGON: 'linepolygon',
} as const;

export const DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
} as const;

export type Direction = typeof DIRECTIONS[keyof typeof DIRECTIONS];

export const SNAP_DISTANCE = 20;
export const MIN_POINTS_FOR_SNAP = 3;

export const CANVAS_WIDTH = 5230;
export const CANVAS_HEIGHT = 5299;

export const MIN_TRANSFORM_SIZE = 50;
export const TRANSFORMER_PADDING = 20;

export const DUPLICATE_OFFSET = 12;

export const DEFAULT_SHAPE_NAME = "Opportunity name";
