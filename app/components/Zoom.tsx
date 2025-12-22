import type { FC } from "react";

interface ZoomProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  className?: string;
}

/**
 * Fixed zoom control displayed in the bottom-right corner.
 */
const Zoom: FC<ZoomProps> = ({ onZoomIn, onZoomOut, className }) => {
  return (
    <div
      className={`fixed bottom-38 right-38 flex flex-col gap-2 drop-shadow-lg ${className ?? ""}`}
    >
      <button
        type="button"
        aria-label="Zoom in"
        onClick={onZoomIn}
        className="h-10 w-10 rounded-full bg-blue-600 text-white text-xl leading-none hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        +
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        onClick={onZoomOut}
        className="h-10 w-10 rounded-full bg-blue-600 text-white text-xl leading-none hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        −
      </button>
    </div>
  );
};

export default Zoom;

