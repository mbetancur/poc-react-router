import { useState } from "react"
import { Stage, Layer } from "react-konva"
import { InteractiveBuilding } from "~/components/InteractiveBuilding"

export default function Canvas() {
  const [numberShape, setNumberShape] = useState(0)
  return (
    <>
      <Stage width={1200} height={700}>
        <InteractiveBuilding numberShape={numberShape} />
      </Stage>
      <button style={{ padding: '12px', backgroundColor: 'blue' }} onClick={() => {
        setNumberShape(numberShape + 1)
      }}>
        Create shape
      </button>
    </>
  )
}