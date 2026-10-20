import { useState } from 'react';
import { PanelsTopLeft, Eye, EyeOff } from 'lucide-react';
import type { EditorApi } from './useEditor';
import { VIEWPORTS } from './useEditor';
import { CanvasRenderer } from './CanvasRenderer';

interface Props {
  api: EditorApi;
}

export function Canvas({ api }: Props) {
  const vp = VIEWPORTS.find((v) => v.id === api.viewport)!;
  const [showGrid, setShowGrid] = useState(true);

  return (
    <div className="flex-1 flex flex-col bg-[#F1F2F8] min-w-0 min-h-0">
      {/* Responsive preview toolbar */}
      <div className="h-10 bg-white border-b border-[#E5E7F0] flex items-center justify-between px-3 flex-shrink-0">
        <div className="flex items-center gap-1 sm:hidden">
          {VIEWPORTS.map((v) => (
            <button
              key={v.id}
              onClick={() => api.setViewport(v.id)}
              className={`px-2 py-1 rounded text-xs font-medium ${api.viewport === v.id ? 'bg-[#7657FF] text-white' : 'text-[#6B6C85]'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-medium text-[#6B6C85] hidden sm:block">
          {vp.label} · {vp.width}px
        </span>
        <button onClick={() => setShowGrid((v) => !v)} className="flex items-center gap-1.5 text-xs text-[#6B6C85] hover:text-[#17182B]">
          {showGrid ? <Eye size={14} /> : <EyeOff size={14} />}
          <span className="hidden sm:inline">Grid</span>
        </button>
      </div>

      <div
        className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center"
        style={showGrid ? { backgroundImage: 'radial-gradient(#D1D5E8 1px, transparent 1px)', backgroundSize: '20px 20px' } : undefined}
        onClick={() => api.selectNode(null)}
      >
        <div className="w-full flex justify-center">
          <div style={{ width: vp.width, maxWidth: '100%' }} className="flex-shrink-0">
            <CanvasRenderer
              tree={api.tree}
              selectedId={api.selectedId}
              onSelect={(id) => api.selectNode(id || null)}
              onDelete={api.deleteNode}
              onMove={api.moveNodeDir}
              viewport={vp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
