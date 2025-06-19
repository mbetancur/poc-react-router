import type Konva from "konva";
import { useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import ShapeDrawer, { MIN_POINTS_FOR_SNAP, SNAP_DISTANCE, type Point } from "~/components/ShapeDrawer";

export default function CanvasDrawing() {
  const [points, setPoints] = useState<Point[]>([]);
  const [currentMousePos, setCurrentMousePos] = useState<Point | null>(null);
  const [isShapeClosed, setIsShapeClosed] = useState(false);
  const numShapes = useRef(0);

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (numShapes.current > 1) return;
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = e?.target?.getStage()?.getPointerPosition();
    if (numShapes.current === 0) numShapes.current++;

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

  const handleDoubleClick = () => {
    console.log("double click");
  };

  const clearCurrent = () => {
    setPoints([]);
    setCurrentMousePos(null);
    setIsShapeClosed(false);
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
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onDblClick={handleDoubleClick}
      >
        <Layer>
          <ShapeDrawer
            // tension={0.5}
            points={points.flatMap(point => [point.x, point.y])}
            currentMousePos={currentMousePos}
            snapDistance={SNAP_DISTANCE}
            isShapeClosed={isShapeClosed}
          />
        </Layer>
      </Stage>
    </div>
  );
}