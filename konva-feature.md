Components involved:

## Main Components
- Stage (from react-konva): The main canvas container.

- Layer (from react-konva): Holds all shapes and UI elements.

 - ShapeRenderer (~/components/shapes/ShapeRenderer): Renders each shape based on its type.

- DrawingPanel (~/components/DrawingPanel): UI panel for drawing controls.

- Transformer (from react-konva): For resizing/rotating selected shapes.

- Shape Components (used by ShapeRenderer)

- QCurveShape (~/components/shapes/QCurveShape)
- LinePolygonShape (~/components/shapes/LinePolygonShape)
(Potential for BCurveShape in the future, as noted in TODOs)
- Hooks and Utilities
- useCanvasReducer (~/hooks/useCanvasReducer): State management for shapes and drawing.
- (~/utils/shapeFactory): Utility for snapping logic.
- Types
Point (~/types/canvas): Used for coordinates and shape data.