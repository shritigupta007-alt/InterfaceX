import { useState } from 'react';
import { PanelLeft, PanelRight, X } from 'lucide-react';
import { useEditor } from './useEditor';
import { Toolbar } from './Toolbar';
import { ComponentSidebar } from './ComponentSidebar';
import { Canvas } from './Canvas';
import { PropertiesPanel } from './PropertiesPanel';
import { CodePanel } from './CodePanel';
import { AnalyzerPanel } from './AnalyzerPanel';

interface Props {
  onExit: () => void;
}

export function Editor({ onExit }: Props) {
  const api = useEditor();
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F1F2F8] overflow-hidden">
      <Toolbar
        api={api}
        onToggleSidebar={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
        onAnalyze={() => setShowAnalyzer(true)}
      />

      <div className="flex-1 flex min-h-0 relative">
        {/* Left sidebar - desktop */}
        <aside className="w-60 border-r border-[#E5E7F0] flex-shrink-0 hidden lg:block">
          <ComponentSidebar api={api} />
        </aside>

        {/* Left sidebar - mobile drawer */}
        {leftOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => setLeftOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl">
              <div className="flex justify-end p-2"><button onClick={() => setLeftOpen(false)} className="p-1.5 text-[#6B6C85]"><X size={18} /></button></div>
              <ComponentSidebar api={api} onClose={() => setLeftOpen(false)} />
            </div>
          </div>
        )}

        {/* Center: canvas + code panel */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex items-center gap-1 px-2 py-1 bg-white border-b border-[#E5E7F0] lg:hidden flex-shrink-0">
            <button onClick={() => setLeftOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#6B6C85]"><PanelLeft size={14} /> Components</button>
            <button onClick={() => setRightOpen(true)} className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[#6B6C85]"><PanelRight size={14} /> Properties</button>
            <button onClick={() => setCodeOpen((v) => !v)} className="ml-auto px-2 py-1 rounded text-xs text-[#6B6C85]">{codeOpen ? 'Hide' : 'Show'} Code</button>
          </div>

          <div className="flex-1 min-h-0 flex flex-col">
            <Canvas api={api} />
            {codeOpen && (
              <div className="h-56 flex-shrink-0 border-t border-[#E5E7F0]">
                <CodePanel tree={api.tree} />
              </div>
            )}
          </div>
        </main>

        {/* Right sidebar - desktop */}
        <aside className="w-72 border-l border-[#E5E7F0] flex-shrink-0 hidden lg:block">
          <PropertiesPanel api={api} />
        </aside>

        {/* Right sidebar - mobile drawer */}
        {rightOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => setRightOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-xl">
              <div className="flex justify-end p-2"><button onClick={() => setRightOpen(false)} className="p-1.5 text-[#6B6C85]"><X size={18} /></button></div>
              <PropertiesPanel api={api} onClose={() => setRightOpen(false)} />
            </div>
          </div>
        )}

        {/* Analyzer overlay */}
        {showAnalyzer && (
          <div className="absolute inset-0 z-50">
            <AnalyzerPanel api={api} onClose={() => setShowAnalyzer(false)} />
          </div>
        )}
      </div>

      {/* Exit button (back to landing) */}
      <button
        onClick={onExit}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-[#E5E7F0] text-[#6B6C85] shadow-sm hover:text-[#17182B]"
      >
        Back to Home
      </button>
    </div>
  );
}
