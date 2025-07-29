import type { DrawingMode } from "~/types/canvas";

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
    // TODO create const for these modes
    { mode: 'select' as const, label: 'Select' },
    { mode: 'qcurve' as const, label: 'Q-Curve' },
    // This is not implemented yet, but it's in the code so it's here for reference
    // { mode: 'bcurve' as const, label: 'B-Curve' }, // TODO: Implement BCurveShape component
    { mode: 'linepolygon' as const, label: 'Regular Polygon' },
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