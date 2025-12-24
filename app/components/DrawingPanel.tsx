import type { DrawingMode } from "~/types/canvas";
import { DRAWING_MODES } from "~/constants/canvas";

interface DrawingPanelProps {
  currentMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onClearCanvas?: () => void;
}

const DrawingPanel = ({
  currentMode,
  onModeChange,
  onClearCanvas,
}: DrawingPanelProps) => {
  const tools = [
    { mode: DRAWING_MODES.SELECT as DrawingMode, label: 'Select' },
    { mode: DRAWING_MODES.QCURVE as DrawingMode, label: 'Q-Curve' },
    // // TODO: This is not implemented yet, but it's in the code so it's here for reference
    // { mode: DRAWING_MODES.BCURVE as DrawingMode, label: 'B-Curve' }, 
    { mode: DRAWING_MODES.LINEPOLYGON as DrawingMode, label: 'Polygon' },
  ];

  return (
    <div>
      <div className="text-sm">
        <span className="font-medium">Mode:</span>
        <span>{currentMode}</span>
      </div>
      <div >
        {tools.map((tool) => (
          <button
            key={tool.mode}
            onClick={() => onModeChange(tool.mode)}
            className={`
              m-2
              ${currentMode === tool.mode
                ? 'bg-blue-500'
                : 'bg-white text-gray-700'
              }
            `}
            title={tool.label}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <button
        onClick={onClearCanvas}
        className="bg-red-500"
        title="Clear Canvas"
      >
        Clear
      </button>
    </div>
  );
};

export default DrawingPanel; 