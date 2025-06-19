import type Konva from "konva";
import { useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";

type Line = number[];

export default function CanvasDrawing() {
  const isDrawing = useRef(false);
  const [lines, setLines] = useState<Line[]>([]);
  console.log("lines", lines);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    console.log("mouse down", e.target);
    isDrawing.current = true;
    const pos = e?.target?.getStage()?.getPointerPosition();
    if (pos) {
      setLines(prev => [...prev, [pos.x, pos.y]]);
    }
  }

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing.current) return;
    const pos = e?.target?.getStage()?.getPointerPosition();
    console.log("pos", pos);
    if (pos) {
      setLines(prev => {
        const lastLine = prev[prev.length - 1] || [];
        const newLines = prev.slice(0, -1);
        return [...newLines, [...lastLine, pos.x, pos.y]];
      });
    }
  }

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    console.log("mouse up", e.target);
    isDrawing.current = false;
  }

  return (
    <div>
      <h1>Drawing</h1>
      <Stage width={1200} height={700}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {lines.length > 0 && lines.map((line, index) => (
            <Line key={index} points={line} stroke="blue" strokeWidth={2} closed fill="blue" />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}