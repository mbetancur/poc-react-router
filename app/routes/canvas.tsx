import { Stage, Layer } from "react-konva"
import { InteractiveBuilding } from "~/components/InteractiveBuilding"
import PDGText from "~/components/PDGText"

export default function Canvas() {
  return (
    <>
      <Stage width={1200} height={1200}>
        <InteractiveBuilding />
      </Stage>
    </>
  )
}