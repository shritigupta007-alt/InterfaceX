import { useMemo, useState } from 'react';
import { Copy, Check, Download, Code2 } from 'lucide-react';
import { generateHtml, generateCss } from '@/engine/codegen';
import type { ComponentNode } from '@/engine/types';

interface Props {
  tree: ComponentNode[];
}

function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Lightweight syntax highlighting: wraps tag names, attributes, and strings in
// colored spans so the code panel reads like a real editor without a dependency.
function highlightHtml(html: string): string {
  const esc = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#7657FF">$2</span>')
    .replace(/([\w-]+)=(&quot;[^&]*&quot;)/g, '<span style="color:#3DA08C">$1</span>=<span style="color:#E8A33D">$2</span>')
    .replace(/(&lt;!--[^&]*--&gt;)/g, '<span style="color:#6B6C85">$1</span>');
}

function highlightCss(css: string): string {
  const esc = css.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc
    .replace(/(\/\*[^*]*\*\/)/g, '<span style="color:#6B6C85">$1</span>')
    .replace(/^([\s\S]*?)(\{)/gm, '<span style="color:#7657FF">$1</span>$2')
    .replace(/([\w-]+):/g, '<span style="color:#3DA08C">$1</span>:')
    .replace(/:(.*?)(;)/g, ':<span style="color:#E8A33D">$1</span>$2');
}

export function CodePanel({ tree }: Props) {
  const [tab, setTab] = useState<'html' | 'css'>('html');
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => generateHtml(tree), [tree]);
  const css = useMemo(() => generateCss(tree), [tree]);
  const code = tab === 'html' ? html : css;
  const highlighted = tab === 'html' ? highlightHtml(code) : highlightCss(code);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked; ignore silently
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#17182B]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/80">
            <Code2 size={15} />
            <span className="text-xs font-medium">Code Explorer</span>
          </div>
          <div className="flex bg-white/5 rounded-md p-0.5">
            <button
              onClick={() => setTab('html')}
              className={`px-3 py-1 rounded text-xs font-medium ${tab === 'html' ? 'bg-white/15 text-white' : 'text-white/60'}`}
            >HTML</button>
            <button
              onClick={() => setTab('css')}
              className={`px-3 py-1 rounded text-xs font-medium ${tab === 'css' ? 'bg-white/15 text-white' : 'text-white/60'}`}
            >CSS</button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={copy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/80 hover:bg-white/10">
            {copied ? <Check size={14} className="text-[#3DA08C]" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={() => download(tab === 'html' ? 'index.html' : 'styles.css', code, tab === 'html' ? 'text/html' : 'text/css')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/80 hover:bg-white/10">
            <Download size={14} /> Download
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <pre className="text-xs leading-relaxed font-mono text-white/90 whitespace-pre">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      </div>
    </div>
  );
}
