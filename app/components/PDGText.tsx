import { Html } from 'react-konva-utils';
import { Text } from "react-konva"
import { Transformer } from "react-konva"
import { useRef, useEffect, useState, useCallback } from "react"
import type Konva from "konva"

interface TextEditorProps {
  textNode: Konva.Text
  onClose: () => void
  onChange: (text: string) => void
}

interface PDGTextProps {
  initialText?: string
  initialPosition?: { x: number; y: number }
  initialWidth?: number
  fontSize?: number
  fill?: string
}

interface TextStyle {
  fontSize: number
  fontFamily: string
  lineHeight: number
  align: string
  fill: string
  padding: number
}
// WTF What is this doing????
// if (typeof window !== 'undefined') {
//   (Konva as any)._fixTextRendering = true;
// }

const getTextStyles = (textNode: Konva.Text): TextStyle => ({
  fontSize: textNode.fontSize(),
  fontFamily: textNode.fontFamily(),
  lineHeight: textNode.lineHeight(),
  align: textNode.align(),
  fill: textNode.fill() as string,
  padding: textNode.padding(),
})

const getTextareaStyles = (textNode: Konva.Text, position: { x: number; y: number }, stage: Konva.Stage): React.CSSProperties => {
  console.log("TS", textNode)
  console.log("TSw", textNode.width())
  console.log("TSh", textNode.height())

  const styles = getTextStyles(textNode)
  const width = textNode.width() - styles.padding * 2
  const height = textNode.height() - styles.padding * 2 + 5

  const stageBox = stage.container().getBoundingClientRect()

  const scale = stage.scaleX()
  const stagePos = stage.position()

  const absoluteX = stageBox.left + (position.x * scale) + stagePos.x
  const absoluteY = stageBox.top + (position.y * scale) + stagePos.y

  return {
    position: 'absolute',
    top: `${absoluteY}px`,
    left: `${absoluteX}px`,
    width: `${width * scale}px`,
    height: `${height * scale}px`,
    fontSize: `${styles.fontSize * scale}px`,
    border: 'none',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'none',
    outline: 'none',
    resize: 'none',
    lineHeight: `${styles.lineHeight * scale}px`,
    fontFamily: styles.fontFamily,
    transformOrigin: 'left top',
    textAlign: styles.align as any,
    color: styles.fill,
    zIndex: 1000,
  }
}

const TextEditor = ({ textNode, onClose, onChange }: TextEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  console.log("TN", textNode)

  useEffect(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const stage = textNode.getStage()
    if (!stage) return

    const textPosition = textNode.position()
    Object.assign(textarea.style, getTextareaStyles(textNode, textPosition, stage))

    const rotation = textNode.rotation()
    if (rotation) {
      textarea.style.transform = `rotateZ(${rotation}deg)`
    }

    textarea.value = textNode.text()
    // textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight + 3}px`
    textarea.focus()

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        onChange(textarea.value)
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onChange(textarea.value)
        onClose()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleInput = () => {
      const scale = textNode.getAbsoluteScale().x
      textarea.style.width = `${textNode.width() * scale}px`
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`
    }

    textarea.addEventListener('keydown', handleKeyDown)
    textarea.addEventListener('input', handleInput)
    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick)
    })

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown)
      textarea.removeEventListener('input', handleInput)
      window.removeEventListener('click', handleOutsideClick)
    }
  }, [textNode, onChange, onClose])

  return (
    <Html>
      <textarea
        ref={textareaRef}
        style={{
          minHeight: '1em',
          position: 'absolute',
        }}
      />
    </Html>
  )
}

export default function PDGText({
  initialText = "Click me to edit me",
  initialPosition = { x: 50, y: 80 },
  initialWidth = 200,
  fontSize = 20,
  fill = "green"
}: PDGTextProps) {
  const [text, setText] = useState(initialText)
  const [isEditing, setIsEditing] = useState(false)
  const [textWidth, setTextWidth] = useState(initialWidth)
  const textRef = useRef<Konva.Text>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current])
    }
  }, [isEditing])

  const handleTextDblClick = useCallback(() => {
    setIsEditing(true)
  }, [])

  const handleTextChange = useCallback((newText: string) => {
    if (newText.trim()) {
      setText(newText)
    }
  }, [])

  const handleTransform = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const node = textRef.current
    if (!node) return
    const scaleX = node.scaleX()
    const newWidth = node.width() * scaleX
    setTextWidth(newWidth)
    node.setAttrs({
      width: newWidth,
      scaleX: 1,
    })
  }, [])

  return (
    <>
      <Text
        ref={textRef}
        text={text}
        x={initialPosition.x}
        y={initialPosition.y}
        fontSize={fontSize}
        width={textWidth}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        visible={!isEditing}
        fill={fill}
      />
      {isEditing && textRef.current && (
        <TextEditor
          textNode={textRef.current}
          onChange={handleTextChange}
          onClose={() => setIsEditing(false)}
        />
      )}
      {!isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => ({
            ...newBox,
            width: Math.max(30, newBox.width),
          })}
        />
      )}
    </>
  )
}