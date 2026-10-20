import type { ComponentNode, Styles } from '@/engine/types';
import { stylesToCss, getHeadingTag } from '@/engine/styles';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface RenderProps {
  node: ComponentNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  depth: number;
}

function cssStyle(style: Styles): React.CSSProperties {
  const css = stylesToCss(style);
  return css as React.CSSProperties;
}

// Render a single node. Layout components render their children; leaf components
// render their content. This is used both on the canvas (interactive) and is
// the single source of truth for what the user sees.
function RenderNode({ node, selectedId, onSelect, onDelete, onMove, depth }: RenderProps) {
  const selected = selectedId === node.id;
  const tag = node.type === 'heading' ? getHeadingTag(node.props) : undefined;

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    cursor: 'pointer',
    ...cssStyle(node.styles),
    boxSizing: 'border-box',
  };

  const select = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const selectionOutline = selected
    ? { outline: '2px solid #7657FF', outlineOffset: '-2px' }
    : { outline: '1px dashed transparent' };

  const hoverActions = selected && (
    <div
      className="absolute -top-9 left-0 flex items-center gap-0.5 bg-[#17182B] text-white rounded-md px-1 py-0.5 z-10 shadow-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="text-[11px] px-1.5 max-w-[120px] truncate">{node.name}</span>
      <button onClick={() => onMove(node.id, 'up')} className="p-1 hover:bg-white/15 rounded"><ChevronUp size={13} /></button>
      <button onClick={() => onMove(node.id, 'down')} className="p-1 hover:bg-white/15 rounded"><ChevronDown size={13} /></button>
      <button onClick={() => onDelete(node.id)} className="p-1 hover:bg-red-500/80 rounded"><Trash2 size={13} /></button>
    </div>
  );

  const children = node.children.map((child) => (
    <RenderNode
      key={child.id}
      node={child}
      selectedId={selectedId}
      onSelect={onSelect}
      onDelete={onDelete}
      onMove={onMove}
      depth={depth + 1}
    />
  ));

  const wrap = (content: React.ReactNode, style: React.CSSProperties) => {
    const Tag = (tag || 'div') as keyof React.JSX.IntrinsicElements;
    return (
      <Tag style={{ ...baseStyle, ...style, ...selectionOutline }} onClick={select}>
        {hoverActions}
        {content}
      </Tag>
    );
  };

  switch (node.type) {
    case 'heading': {
      const Tag = tag as keyof React.JSX.IntrinsicElements;
      return (
        <Tag style={{ ...baseStyle, ...selectionOutline, margin: 0 }} onClick={select}>
          {hoverActions}
          {node.content || ' '}
        </Tag>
      );
    }
    case 'paragraph':
      return wrap(<>{node.content || ' '}</>, { margin: 0, lineHeight: 1.5 });
    case 'button':
      return wrap(<>{node.content || 'Button'}</>, { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `${node.styles.borderWidth || '0px'} solid ${node.styles.borderColor || 'transparent'}` });
    case 'badge':
      return wrap(<>{node.content || 'Badge'}</>, { display: 'inline-flex', alignItems: 'center', border: `${node.styles.borderWidth || '0px'} solid ${node.styles.borderColor || 'transparent'}` });
    case 'divider':
      return <div style={{ ...baseStyle, ...selectionOutline, height: node.styles.height || '1px', backgroundColor: node.styles.backgroundColor || '#E5E7F0', width: '100%' }} onClick={select}>{hoverActions}</div>;
    case 'image':
      return (
        <div style={{ position: 'relative', ...baseStyle, ...selectionOutline }} onClick={select}>
          {hoverActions}
          <img
            src={node.content}
            alt={node.props.alt || ''}
            style={{ width: '100%', height: node.styles.height || 'auto', borderRadius: node.styles.borderRadius, objectFit: 'cover', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
          />
        </div>
      );
    case 'navbar': {
      const links = (node.props.links || '').split(',').map((l) => l.trim()).filter(Boolean);
      return wrap(
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '16px' }}>
          <span style={{ fontWeight: 600, fontSize: '18px' }}>{node.content}</span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {links.map((l, i) => <span key={i} style={{ fontSize: '14px', opacity: 0.8 }}>{l}</span>)}
          </div>
        </div>,
        {}
      );
    }
    case 'card':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{node.content}</h3>
          <p style={{ margin: 0, fontSize: '15px', color: '#4A4B66', lineHeight: 1.5 }}>{node.props.body || ''}</p>
        </div>,
        { border: `${node.styles.borderWidth || '1px'} solid ${node.styles.borderColor || '#E5E7F0'}` }
      );
    case 'modal':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{node.content}</h3>
          <p style={{ margin: 0, fontSize: '15px', color: '#4A4B66' }}>{node.props.body || ''}</p>
          <button style={{ padding: '10px 24px', backgroundColor: '#7657FF', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>OK</button>
        </div>,
        { border: `${node.styles.borderWidth || '1px'} solid ${node.styles.borderColor || '#E5E7F0'}` }
      );
    case 'alert':
      return wrap(<>{node.content || 'Alert'}</>, { border: `${node.styles.borderWidth || '0px'} solid ${node.styles.borderColor || 'transparent'}` });
    case 'input':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          <label style={{ fontSize: '14px', fontWeight: 500 }}>{node.props.label || 'Label'}</label>
          <input type={node.props.inputType || 'text'} placeholder={node.props.placeholder || ''} disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5E8', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
        </div>,
        {}
      );
    case 'form':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>{node.props.title || 'Form'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '14px', fontWeight: 500 }}>Name</label><input disabled style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5E8', borderRadius: '8px', fontSize: '14px' }} /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}><label style={{ fontSize: '14px', fontWeight: 500 }}>Email</label><input disabled type="email" style={{ width: '100%', padding: '10px 12px', border: '1px solid #D1D5E8', borderRadius: '8px', fontSize: '14px' }} /></div>
          <button style={{ padding: '12px 24px', backgroundColor: '#7657FF', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>{node.props.buttonLabel || 'Submit'}</button>
        </div>,
        { border: `${node.styles.borderWidth || '1px'} solid ${node.styles.borderColor || '#E5E7F0'}` }
      );
    case 'footer':
      return wrap(
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', textAlign: 'center', width: '100%' }}>
          <span style={{ fontWeight: 700, fontSize: '18px' }}>{node.content}</span>
          <span style={{ fontSize: '13px', opacity: 0.7 }}>{node.props.subtitle || ''}</span>
        </div>,
        {}
      );
    case 'section':
    case 'container':
    case 'two-column':
    default:
      return wrap(<>{children}</>, {});
  }
}

interface CanvasProps {
  tree: ComponentNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  viewport: { width: number; label: string };
}

export function CanvasRenderer({ tree, selectedId, onSelect, onDelete, onMove, viewport }: CanvasProps) {
  return (
    <div
      onClick={() => onSelect('')}
      style={{ width: viewport.width }}
      className="bg-white min-h-full shadow-sm mx-auto transition-all duration-300"
    >
      {tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F2F8] flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-[#9B9CB5]">iX</span>
          </div>
          <h3 className="text-lg font-semibold text-[#17182B] mb-1">Your canvas is empty</h3>
          <p className="text-sm text-[#6B6C85] max-w-xs">Add components from the left sidebar to start building your interface.</p>
        </div>
      ) : (
        tree.map((node) => (
          <RenderNode
            key={node.id}
            node={node}
            selectedId={selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            onMove={onMove}
            depth={0}
          />
        ))
      )}
    </div>
  );
}
