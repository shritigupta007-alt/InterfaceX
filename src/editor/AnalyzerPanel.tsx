import { useMemo } from 'react';
import { X, AlertTriangle, AlertCircle, Lightbulb, Wrench, Gauge } from 'lucide-react';
import type { EditorApi } from './useEditor';
import { analyze } from '@/engine/analyzer';
import type { AnalyzerFinding } from '@/engine/types';

interface Props {
  api: EditorApi;
  onClose: () => void;
}

const severityConfig = {
  error: { icon: AlertCircle, color: '#E05260', bg: '#FDF2F4', label: 'Error' },
  warning: { icon: AlertTriangle, color: '#E8A33D', bg: '#FEF6E7', label: 'Warning' },
  suggestion: { icon: Lightbulb, color: '#7657FF', bg: '#F6F5FF', label: 'Suggestion' },
};

function scoreColor(score: number): string {
  if (score >= 80) return '#3DA08C';
  if (score >= 50) return '#E8A33D';
  return '#E05260';
}

export function AnalyzerPanel({ api, onClose }: Props) {
  const result = useMemo(() => analyze(api.tree), [api.tree]);

  const applyFix = (f: AnalyzerFinding) => {
    if (!f.fixAction) return;
    const { nodeId, attr, value } = f.fixAction;
    if (attr === 'content') api.updateContent(nodeId, value);
    else if (attr.startsWith('props.')) api.updateProps(nodeId, attr.slice(6), value);
    else api.updateStyles(nodeId, { [attr]: value } as any);
  };

  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col">
      <div className="h-12 border-b border-[#E5E7F0] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-[#7657FF]" />
          <h2 className="text-sm font-semibold text-[#17182B]">Basic Interface Check</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#F1F2F8] text-[#6B6C85]"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Score card */}
        <div className="p-4 border-b border-[#E5E7F0]">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#F1F2F8" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke={scoreColor(result.score)} strokeWidth="6"
                  strokeDasharray={`${(result.score / 100) * 213.6} 213.6`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold" style={{ color: scoreColor(result.score) }}>{result.score}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#17182B]">Interface Score</p>
              <p className="text-xs text-[#6B6C85] mt-0.5">
                {result.findings.length} {result.findings.length === 1 ? 'finding' : 'findings'} ·
                This is a basic check, not a full WCAG audit.
              </p>
            </div>
          </div>
        </div>

        {/* Findings */}
        <div className="divide-y divide-[#F1F2F8]">
          {result.findings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-[#3DA08C] mb-1">No issues found</p>
              <p className="text-xs text-[#6B6C85]">Your interface passes all basic checks.</p>
            </div>
          ) : (
            result.findings.map((f, i) => {
              const cfg = severityConfig[f.severity];
              const Icon = cfg.icon;
              return (
                <div key={i} className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                      <Icon size={15} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-xs text-[#9B9CB5] truncate">{f.element}</span>
                      </div>
                      <p className="text-sm text-[#17182B] font-medium mb-1">{f.message}</p>
                      <p className="text-xs text-[#6B6C85] leading-relaxed">{f.why}</p>
                      {f.fix && <p className="text-xs text-[#7657FF] mt-1.5">Fix: {f.fix}</p>}
                      {f.fixAction && (
                        <button
                          onClick={() => applyFix(f)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white bg-[#7657FF] hover:bg-[#6344E6]"
                        >
                          <Wrench size={12} /> Apply fix
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
