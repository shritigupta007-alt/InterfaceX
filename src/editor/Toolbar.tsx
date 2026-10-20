import { useState } from 'react';
import {
  Undo2, Redo2, Save, Download, ScanSearch, RotateCcw, FilePlus2,
  ChevronDown, Check, CloudOff,
} from 'lucide-react';
import type { EditorApi } from './useEditor';
import { generateStandaloneHtml, generateHtml, generateCss } from '@/engine/codegen';
import type { Viewport } from './useEditor';
import { VIEWPORTS } from './useEditor';

interface Props {
  api: EditorApi;
  onAnalyze: () => void;
}

function download(name: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function Toolbar({ api, onAnalyze }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleExport = (kind: 'html' | 'css' | 'standalone') => {
    if (kind === 'html') download('index.html', generateHtml(api.tree), 'text/html');
    if (kind === 'css') download('styles.css', generateCss(api.tree), 'text/css');
    if (kind === 'standalone') download('interfacex-export.html', generateStandaloneHtml(api.tree), 'text/html');
    setExportOpen(false);
  };

  const handleReset = () => {
    if (confirm('Reset the canvas? This will remove all components. You can undo afterwards.')) {
      api.resetCanvas();
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#E5E7F0] flex items-center justify-between px-3 sm:px-4 gap-2 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-sm">iX</div>
          <span className="font-semibold text-[#17182B] hidden sm:block">InterfaceX</span>
        </div>
        <div className="w-px h-6 bg-[#E5E7F0] hidden sm:block" />
        {editingName ? (
          <input
            autoFocus
            value={api.project.name}
            onChange={(e) => api.renameProject(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
            className="text-sm font-medium text-[#17182B] border border-[#D1D5E8] rounded-md px-2 py-1 outline-none focus:border-[#7657FF] max-w-[180px]"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8] rounded-md px-2 py-1 truncate max-w-[180px]"
            title="Click to rename project"
          >
            {api.project.name}
          </button>
        )}
        {api.dirty ? (
          <span className="flex items-center gap-1 text-xs text-[#8B8CA0]"><CloudOff size={13} /> Unsaved</span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-[#3DA08C]"><Check size={13} /> Saved</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button onClick={api.undo} disabled={!api.canUndo} className="p-2 rounded-md hover:bg-[#F1F2F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#17182B]" title="Undo"><Undo2 size={18} /></button>
        <button onClick={api.redo} disabled={!api.canRedo} className="p-2 rounded-md hover:bg-[#F1F2F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#17182B]" title="Redo"><Redo2 size={18} /></button>
        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />
        <button onClick={api.save} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8]"><Save size={16} /> <span className="hidden sm:inline">Save</span></button>
        <button onClick={handleReset} className="p-2 rounded-md hover:bg-[#F1F2F8] text-[#17182B]" title="Reset canvas"><RotateCcw size={17} /></button>
        <button onClick={() => api.newProject('Untitled Project')} className="p-2 rounded-md hover:bg-[#F1F2F8] text-[#17182B]" title="New project"><FilePlus2 size={17} /></button>
        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />
        <button onClick={onAnalyze} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8]"><ScanSearch size={16} /> <span className="hidden md:inline">Analyze</span></button>

        {/* Responsive viewport switcher */}
        <div className="hidden sm:flex items-center bg-[#F1F2F8] rounded-md p-0.5">
          {VIEWPORTS.map((vp) => (
            <button
              key={vp.id}
              onClick={() => api.setViewport(vp.id as Viewport)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                api.viewport === vp.id ? 'bg-white text-[#7657FF] shadow-sm' : 'text-[#6B6C85]'
              }`}
            >
              {vp.label}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />
        <div className="relative">
          <button onClick={() => setExportOpen((v) => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-[#7657FF] hover:bg-[#6344E6]">
            <Download size={16} /> <span className="hidden sm:inline">Export</span> <ChevronDown size={14} />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#E5E7F0] rounded-lg shadow-lg z-30 py-1">
                <button onClick={() => handleExport('standalone')} className="w-full text-left px-3 py-2 text-sm hover:bg-[#F1F2F8] text-[#17182B]">Download standalone HTML</button>
                <button onClick={() => handleExport('html')} className="w-full text-left px-3 py-2 text-sm hover:bg-[#F1F2F8] text-[#17182B]">Download index.html</button>
                <button onClick={() => handleExport('css')} className="w-full text-left px-3 py-2 text-sm hover:bg-[#F1F2F8] text-[#17182B]">Download styles.css</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
