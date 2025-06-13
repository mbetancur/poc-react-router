import { useRef, useState } from "react";
import { Image, Label, Layer, Line, Rect, Text, Transformer } from "react-konva";
import useImage from "use-image";

const ImageWithHover = ({ src = './PDGLogo.png', x = 100, y = 100, width = 100, height = 100 }) => {
  const [image] = useImage(src);
  const [isHovered, setIsHovered] = useState(false);

  const scale = isHovered ? 5 : 1;

  return (
    <Layer>
      <Image
        image={image}
        x={x}
        y={y}
        width={width}
        height={height}
        // offsetX={offsetX}
        // offsetY={offsetY}
        scaleX={scale}
        scaleY={scale}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </Layer>
  );
};

const EnterShape = () => {
  return (
    <Layer draggable>
      <Rect
        x={0}
        y={0}
        width={100}
        height={100}
        fill="red"
        shadowBlur={10}
        opacity={0.5}
      />
      <Text text="Enter=>" x={20} y={40} fontSize={20} fill="white" />
    </Layer>
  )
}

export const InteractiveBuilding = () => {
  const [mammImage] = useImage('./Maam.jpg');
  const [isVisible, setIsVisible] = useState(false)

  const handleMouserOver = (e) => {
    setIsVisible(!isVisible)
  }

  return (
    <>
      <Layer>
        <Image x={1} y={0} image={mammImage}
          onClick={e => console.log(e.target.getStage()?.pointerPos)}
        />
      </Layer>
      <Layer >
        <Line
          closed={true}
          fill="blue"
          key={1}
          opacity={isVisible ? 0.35 : 0}
          points={[602, 434, 837, 433, 839, 542, 602, 542]}
          stroke="black"
          onMouseOver={(e) => handleMouserOver(e)}
          onMouseEnter={() => { console.log("enter") }}
        />
      </Layer>
      <Layer>
        <Label
          opacity={isVisible ? 1 : 0}
          x={640}
          y={403}
        >
          <Text text="Movie's screen" fill="black" fontSize={28} />
        </Label>
      </Layer>
      <EnterShape />
      <ImageWithHover />
    </>
  )
}