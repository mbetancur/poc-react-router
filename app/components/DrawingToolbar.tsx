import type { DrawingMode } from "~/types/canvas";

interface DrawingToolbarProps {
  currentMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  onClearCanvas?: () => void;
}

const DrawingToolbar = ({
  currentMode,
  onModeChange,
  onClearCanvas,
}: DrawingToolbarProps) => {
  const tools = [
    { mode: 'select' as const, label: 'Select', icon: '🖱️' },
    { mode: 'qcurve' as const, label: 'Q-Curve', icon: '🌙' },
    { mode: 'bcurve' as const, label: 'B-Curve', icon: '〰️' },
    { mode: 'rectangle' as const, label: 'Rectangle', icon: '⬜' },
  ];

  return (
    <div className="flex gap-2 p-4 bg-gray-100 border-b">
      <div className="flex gap-2">
        {tools.map((tool) => (
          <button
            key={tool.mode}
            onClick={() => onModeChange(tool.mode)}
            className={`
              px-4 py-2 rounded-md border transition-colors
              ${currentMode === tool.mode 
                ? 'bg-blue-500 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
            title={tool.label}
          >
            <span className="mr-2">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
      
      <div className="border-l border-gray-300 mx-2"></div>
      
      <button
        onClick={onClearCanvas}
        className="px-4 py-2 rounded-md bg-red-500 text-white border border-red-600 hover:bg-red-600 transition-colors"
        title="Clear Canvas"
      >
        🗑️ Clear
      </button>
      
      <div className="flex-1"></div>
      
      <div className="text-sm text-gray-600 flex items-center">
        <span className="font-medium">Mode:</span>
        <span className="ml-2 capitalize">{currentMode}</span>
      </div>
    </div>
  );
};

export default DrawingToolbar; 