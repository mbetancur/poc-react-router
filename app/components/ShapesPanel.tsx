import type { ShapeModel } from "~/types/canvas";
import type { Direction } from "~/constants/canvas";
import { DIRECTIONS } from "~/constants/canvas";

interface ShapePanelProps {
  shapes: ShapeModel[];
  onChangeShapePosition: (shape: ShapeModel, direction: Direction) => void;
  onDuplicateShape: (shapeId: string) => void;
  onDeleteShape: (shapeId: string) => void;
  onDetectionModeClick?: () => void;
}

const ShapesPanel = ({ shapes, onChangeShapePosition, onDuplicateShape, onDeleteShape, onDetectionModeClick }: ShapePanelProps) => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Shapes in Panel: {shapes.length}</th>
          </tr>
        </thead>
        <tbody>
          {
            shapes.map(shape => {
              return (
                <tr key={shape.id} className="flex gap-2 items-center">
                  <td>
                    {shape.id}
                  </td>
                  <td>
                    <button onClick={() => onChangeShapePosition(shape, DIRECTIONS.UP)}>⬆️</button>
                    <button onClick={() => onChangeShapePosition(shape, DIRECTIONS.DOWN)}>⬇️</button>
                    <button onClick={() => onDuplicateShape(shape.id)}>🔀</button>
                    <button onClick={() => onDeleteShape(shape.id)} className="text-red-500">🗑️</button>
                  </td>
                </tr>
              )
            })
          }
        </tbody>
      </table >
    </>
  )
}

export default ShapesPanel;