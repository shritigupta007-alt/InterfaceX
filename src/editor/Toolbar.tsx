import { useState } from 'react';
import {
  Undo2, Redo2, Save, Download, ScanSearch, RotateCcw, FilePlus2,
  ChevronDown, Check, CloudOff, Loader2, Users, AlertCircle, FileArchive,
  Share2, Shield, Eye
} from 'lucide-react';
import type { EditorApi } from './useEditor';
import { generateStandaloneHtml, generateHtml, generateCss } from '@/engine/codegen';
import { exportProjectZip } from '@/services/zipExport';
import type { Viewport } from './useEditor';
import { VIEWPORTS } from './useEditor';
import type { CollaboratorPresence } from './useCollaboration';
import { InviteModal } from '@/components/collaboration/InviteModal';

interface Props {
  api: EditorApi;
  onAnalyze: () => void;
  onToggleSidebar?: () => void;
  onToggleRight?: () => void;
  collaborators?: CollaboratorPresence[];
  isConnected?: boolean;
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

export function Toolbar({ api, onAnalyze, collaborators = [], isConnected = false }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [zipping, setZipping] = useState(false);

  const handleExport = async (kind: 'html' | 'css' | 'standalone' | 'zip') => {
    if (kind === 'html') download('index.html', generateHtml(api.tree), 'text/html');
    if (kind === 'css') download('styles.css', generateCss(api.tree), 'text/css');
    if (kind === 'standalone') download('interfacex-export.html', generateStandaloneHtml(api.tree), 'text/html');
    if (kind === 'zip') {
      try {
        setZipping(true);
        await exportProjectZip(api.project.name, api.tree);
      } catch (err) {
        console.error('ZIP export failed:', err);
        alert('Failed to generate ZIP project. Please check the browser console.');
      } finally {
        setZipping(false);
      }
    }
    setExportOpen(false);
  };

  const handleReset = () => {
    if (api.isReadOnly) return;
    if (confirm('Reset the canvas? This will remove all components. You can undo afterwards.')) {
      api.resetCanvas();
    }
  };

  // Determine save status display
  const renderSaveStatus = () => {
    if (api.saveStatus === 'saving') {
      return (
        <span className="flex items-center gap-1.5 text-xs text-[#7657FF]">
          <Loader2 size={13} className="animate-spin" /> Saving...
        </span>
      );
    }
    if (api.saveStatus === 'unsaved' || api.dirty) {
      return (
        <span className="flex items-center gap-1 text-xs text-[#8B8CA0]">
          <CloudOff size={13} /> Unsaved
        </span>
      );
    }
    if (api.saveStatus === 'error') {
      return (
        <span className="flex items-center gap-1 text-xs text-[#E8A33D]" title="Changes saved locally only">
          <AlertCircle size={13} /> Local Only
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-xs text-[#3DA08C]">
        <Check size={13} /> Saved
      </span>
    );
  };

  return (
    <header className="h-14 bg-white border-b border-[#E5E7F0] flex items-center justify-between px-3 sm:px-4 gap-2 flex-shrink-0 z-30">
      {/* Left section: Brand, Title, Status & Role */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-sm">
            iX
          </div>
          <span className="font-semibold text-[#17182B] hidden sm:block">InterfaceX</span>
        </div>

        <div className="w-px h-6 bg-[#E5E7F0] hidden sm:block" />

        {editingName && !api.isReadOnly ? (
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
            onClick={() => !api.isReadOnly && setEditingName(true)}
            disabled={api.isReadOnly}
            className="text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8] rounded-md px-2 py-1 truncate max-w-[180px]"
            title={api.isReadOnly ? 'Read only mode' : 'Click to rename project'}
          >
            {api.project.name}
          </button>
        )}

        {/* Role badge */}
        {api.role === 'VIEWER' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F2F8] text-[#6B6C85]">
            <Eye size={12} /> Viewer
          </span>
        ) : api.role === 'OWNER' ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F6F5FF] text-[#7657FF]">
            <Shield size={12} /> Owner
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EBFBF8] text-[#3DA08C]">
            Editor
          </span>
        )}

        {/* Save Status */}
        {renderSaveStatus()}
      </div>

      {/* Right section: Presence, Actions, Viewport & Export */}
      <div className="flex items-center gap-1">
        {/* Active Collaborators */}
        {collaborators.length > 0 && (
          <div className="flex items-center -space-x-1.5 mr-2">
            {collaborators.slice(0, 4).map((c, i) => (
              <div
                key={c.userId || i}
                title={`${c.name} (${c.role})`}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[11px] font-bold shadow-sm"
                style={{ backgroundColor: c.avatarColor || '#7657FF' }}
              >
                {c.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            ))}
            {collaborators.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-[#6B6C85] text-white flex items-center justify-center text-[10px] font-bold">
                +{collaborators.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Share Button (Owner or MongoDB project) */}
        {/^[0-9a-fA-F]{24}$/.test(api.project.id) && (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-[#7657FF] bg-[#F6F5FF] hover:bg-[#ECE9FE] transition-colors"
          >
            <Share2 size={14} />
            <span className="hidden md:inline">Share</span>
          </button>
        )}

        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <button
          onClick={api.undo}
          disabled={!api.canUndo || api.isReadOnly}
          className="p-2 rounded-md hover:bg-[#F1F2F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#17182B]"
          title="Undo"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={api.redo}
          disabled={!api.canRedo || api.isReadOnly}
          className="p-2 rounded-md hover:bg-[#F1F2F8] disabled:opacity-40 disabled:cursor-not-allowed text-[#17182B]"
          title="Redo"
        >
          <Redo2 size={18} />
        </button>

        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />

        {/* Save button */}
        {!api.isReadOnly && (
          <button
            onClick={api.save}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8]"
          >
            <Save size={16} /> <span className="hidden sm:inline">Save</span>
          </button>
        )}

        {/* Reset */}
        {!api.isReadOnly && (
          <button
            onClick={handleReset}
            className="p-2 rounded-md hover:bg-[#F1F2F8] text-[#17182B]"
            title="Reset canvas"
          >
            <RotateCcw size={17} />
          </button>
        )}

        {/* New Project */}
        <button
          onClick={() => api.newProject('Untitled Project')}
          className="p-2 rounded-md hover:bg-[#F1F2F8] text-[#17182B]"
          title="New project"
        >
          <FilePlus2 size={17} />
        </button>

        <div className="w-px h-6 bg-[#E5E7F0] mx-1 hidden sm:block" />

        {/* Interface Check Analyzer */}
        <button
          onClick={onAnalyze}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#17182B] hover:bg-[#F1F2F8]"
        >
          <ScanSearch size={16} /> <span className="hidden md:inline">Analyze</span>
        </button>

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

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportOpen((v) => !v)}
            disabled={zipping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-[#7657FF] hover:bg-[#6344E6] disabled:opacity-50"
          >
            {zipping ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden sm:inline">Export</span> <ChevronDown size={14} />
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 mt-1 w-64 bg-white border border-[#E5E7F0] rounded-xl shadow-xl z-30 py-1.5">
                <button
                  onClick={() => handleExport('zip')}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#F6F5FF] text-[#17182B] flex items-center gap-2.5 border-b border-[#F1F2F8]"
                >
                  <FileArchive size={16} className="text-[#7657FF]" />
                  <div>
                    <div className="font-semibold">Download Project ZIP</div>
                    <div className="text-[10px] text-[#6B6C85]">Runnable Vite + React + Tailwind</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('standalone')}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F1F2F8] text-[#17182B]"
                >
                  Download standalone HTML
                </button>
                <button
                  onClick={() => handleExport('html')}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F1F2F8] text-[#17182B]"
                >
                  Download index.html
                </button>
                <button
                  onClick={() => handleExport('css')}
                  className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#F1F2F8] text-[#17182B]"
                >
                  Download styles.css
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Invite Collaborators Modal */}
      {inviteOpen && (
        <InviteModal
          projectId={api.project.id}
          projectName={api.project.name}
          isOwner={api.role === 'OWNER'}
          onClose={() => setInviteOpen(false)}
        />
      )}
    </header>
  );
}
