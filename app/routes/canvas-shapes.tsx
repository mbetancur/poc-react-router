import type Konva from "konva";
import { useRef, useState } from "react";
import { Layer, Stage, Transformer } from "react-konva";
import ShapeDrawer, { MIN_POINTS_FOR_SNAP, SNAP_DISTANCE, type Point } from "~/components/ShapeDrawer";

export default function CanvasDrawing() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const transRef = useRef<Konva.Transformer>(null);
  const shapeRef = useRef<Konva.Group>(null);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();

    if (pos && !isShapeClosed) {
      if (points.length >= MIN_POINTS_FOR_SNAP) {
        const initialPoint = points[0];
        const distance = Math.sqrt(
          Math.pow(pos.x - initialPoint.x, 2) +
          Math.pow(pos.y - initialPoint.y, 2)
        );

        if (distance <= SNAP_DISTANCE) {
          setPoints(prev => [...prev, initialPoint]);
          setIsShapeClosed(true);
          setCurrentMousePos(null);
          return;
        }
      }

      setPoints(prev => [...prev, pos]);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();

    if (pos && !isShapeClosed) {
      setCurrentMousePos(pos);
    }
  };

  const clearCurrent = () => {
    setPoints([]);
    setCurrentMousePos(null);
    setIsShapeClosed(false);
    setIsSelected(false);
  };

  return (
    <div>
      <h1>Drawing Shapes</h1>
      <div>
        <button onClick={clearCurrent}>Clear</button>
      </div>
      <Stage
        width={1200}
        height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        <Layer>
          <ShapeDrawer
            // tension={0.5}
            ref={shapeRef}
            points={points.flatMap(point => [point.x, point.y])}
            currentMousePos={currentMousePos}
            snapDistance={SNAP_DISTANCE}
            isShapeClosed={isShapeClosed}
            draggable={true}
            onClick={() => { 
              setIsSelected(true)
              if (transRef && transRef.current)
                transRef.current?.nodes([shapeRef.current as Konva.Node])
            }}
          />
          {isSelected && (
            <Transformer
              flipEnabled={false}
              ref={transRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 50 || Math.abs(newBox.height) < 50) {
                  return oldBox;
                }
                return newBox;
              }}
              onDblClick={() => setIsSelected(false)}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}