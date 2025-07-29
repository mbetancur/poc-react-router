import type { ShapeModel } from "~/types/canvas";

interface ShapePanelProps {
  shapes: ShapeModel[];
  onChangeShapePosition: (shape: ShapeModel, direction: string) => void
}

const ShapesPanel = ({ shapes, onChangeShapePosition }: ShapePanelProps) => {
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
                <tr key={shape.id} className="flex">
                  <td>
                    {shape.id}
                  </td>
                  <td>
                    <button onClick={() => onChangeShapePosition(shape, 'up')}>⬆️</button>
                    <button onClick={() => onChangeShapePosition(shape, 'down')}>⬇️</button>
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