import { useGraphStore } from '../store/graphStore';

export default function ZoomControls() {
  const zoomIn = useGraphStore((s) => s.zoomIn);
  const zoomOut = useGraphStore((s) => s.zoomOut);
  const resetZoom = useGraphStore((s) => s.resetZoom);

  return (
    <div className="absolute bottom-10 left-10 flex gap-4 z-20">
      <div className="flex flex-col gap-2 p-1 bg-white border border-border rounded-full">
        <button
          onClick={zoomIn}
          className="w-8 h-8 rounded-full hover:bg-creme text-text-muted hover:text-forest flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none"
        >
          <span className="material-symbols-outlined !text-lg">add</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 rounded-full hover:bg-creme text-text-muted hover:text-forest flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none"
        >
          <span className="material-symbols-outlined !text-lg">remove</span>
        </button>
      </div>
      <button
        onClick={resetZoom}
        className="w-10 h-10 rounded-full bg-white border border-border hover:border-forest text-text-muted hover:text-forest flex items-center justify-center transition-all shadow-xs cursor-pointer"
      >
        <span className="material-symbols-outlined">center_focus_strong</span>
      </button>
    </div>
  );
}
