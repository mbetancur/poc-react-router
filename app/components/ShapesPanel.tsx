import type { ShapeModel } from "~/types/canvas";

interface ShapePanelProps {
  shapes: ShapeModel[];
  onChangeShapePosition: (shape: ShapeModel, direction: string) => void;
  onDuplicateShape: (shapeId: string) => void;
  onDeleteShape: (shapeId: string) => void;
}

const ShapesPanel = ({ shapes, onChangeShapePosition, onDuplicateShape, onDeleteShape }: ShapePanelProps) => {
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
                    <button onClick={() => onChangeShapePosition(shape, 'up')}>⬆️</button>
                    <button onClick={() => onChangeShapePosition(shape, 'down')}>⬇️</button>
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