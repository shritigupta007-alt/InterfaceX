import {
  Type, Square, Palette, AlignLeft, Layout, MoreHorizontal,
} from 'lucide-react';
import type { ComponentNode, Styles } from '@/engine/types';
import type { EditorApi } from './useEditor';

interface Props {
  api: EditorApi;
  onClose?: () => void;
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#E5E7F0] px-4 py-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={14} className="text-[#7657FF]" />
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6C85]">{title}</h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-xs text-[#6B6C85] flex-shrink-0 w-20">{label}</label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

const textInputCls = 'w-full px-2 py-1 text-sm border border-[#E5E7F0] rounded-md outline-none focus:border-[#7657FF] text-[#17182B] bg-white';

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={textInputCls} />;
}

function NumberInput({ value, onChange, suffix = 'px' }: { value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-2 pr-7 py-1 text-sm border border-[#E5E7F0] rounded-md outline-none focus:border-[#7657FF] text-[#17182B]"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#9B9CB5]">{suffix}</span>
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const v = value || '#000000';
  return (
    <div className="flex items-center gap-1.5">
      <input type="color" value={v} onChange={(e) => onChange(e.target.value)} className="w-7 h-7 rounded border border-[#E5E7F0] cursor-pointer p-0 bg-white" />
      <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-2 py-1 text-sm border border-[#E5E7F0] rounded-md outline-none focus:border-[#7657FF] text-[#17182B]" />
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={textInputCls}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const FONT_WEIGHTS = [
  { label: 'Normal', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
];

const ALIGN_OPTIONS = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

export function PropertiesPanel({ api, onClose }: Props) {
  const node: ComponentNode | null = api.selectedNode;

  if (!node) {
    return (
      <div className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-[#E5E7F0] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#17182B]">Properties</h2>
          {onClose && <button onClick={onClose} className="lg:hidden text-[#6B6C85] text-sm">Close</button>}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-12 h-12 rounded-xl bg-[#F1F2F8] flex items-center justify-center mb-3">
            <MoreHorizontal size={20} className="text-[#9B9CB5]" />
          </div>
          <p className="text-sm text-[#6B6C85]">Select a component on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const s = node.styles;
  const setS = (patch: Partial<Styles>) => api.updateStyles(node.id, patch);
  const setContent = (v: string) => api.updateContent(node.id, v);
  const setProp = (k: string, v: string) => api.updateProps(node.id, k, v);

  const hasText = ['heading', 'paragraph', 'button', 'badge', 'navbar', 'alert', 'footer', 'card', 'modal'].includes(node.type);
  const hasTextColor = ['heading', 'paragraph', 'button', 'badge', 'alert', 'navbar', 'footer'].includes(node.type);
  const hasBg = !['divider'].includes(node.type);
  const hasFontSize = ['heading', 'paragraph', 'button', 'badge', 'alert', 'navbar', 'footer'].includes(node.type);
  const hasFontWeight = ['heading', 'paragraph', 'button', 'badge', 'navbar', 'footer'].includes(node.type);
  const isLayout = ['section', 'container', 'two-column'].includes(node.type);
  const hasBorder = !['divider'].includes(node.type);
  const hasAlign = ['heading', 'paragraph', 'button', 'badge', 'alert', 'section', 'container'].includes(node.type);

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 border-b border-[#E5E7F0] flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[#17182B]">{node.name}</h2>
          <p className="text-xs text-[#9B9CB5] capitalize">{node.type}</p>
        </div>
        {onClose && <button onClick={onClose} className="lg:hidden text-[#6B6C85] text-sm">Close</button>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Content */}
        {hasText && (
          <Section icon={Type} title="Content">
            <Field label="Text"><TextInput value={node.content} onChange={setContent} placeholder="Enter text" /></Field>
            {node.type === 'navbar' && (
              <Field label="Links"><TextInput value={node.props.links || ''} onChange={(v) => setProp('links', v)} placeholder="Comma separated" /></Field>
            )}
            {node.type === 'card' && (
              <Field label="Body"><TextInput value={node.props.body || ''} onChange={(v) => setProp('body', v)} placeholder="Card body text" /></Field>
            )}
            {node.type === 'modal' && (
              <Field label="Body"><TextInput value={node.props.body || ''} onChange={(v) => setProp('body', v)} /></Field>
            )}
            {node.type === 'footer' && (
              <Field label="Subtitle"><TextInput value={node.props.subtitle || ''} onChange={(v) => setProp('subtitle', v)} /></Field>
            )}
            {node.type === 'heading' && (
              <Field label="Level">
                <SelectInput value={node.props.level || '1'} onChange={(v) => setProp('level', v)} options={[1,2,3,4,5,6].map((n) => ({ label: `H${n}`, value: String(n) }))} />
              </Field>
            )}
            {node.type === 'image' && (
              <>
                <Field label="URL"><TextInput value={node.content} onChange={setContent} placeholder="Image URL" /></Field>
                <Field label="Alt text"><TextInput value={node.props.alt || ''} onChange={(v) => setProp('alt', v)} placeholder="Describe the image" /></Field>
              </>
            )}
            {node.type === 'input' && (
              <>
                <Field label="Label"><TextInput value={node.props.label || ''} onChange={(v) => setProp('label', v)} /></Field>
                <Field label="Placeholder"><TextInput value={node.props.placeholder || ''} onChange={(v) => setProp('placeholder', v)} /></Field>
                <Field label="Type">
                  <SelectInput value={node.props.inputType || 'text'} onChange={(v) => setProp('inputType', v)} options={[
                    { label: 'Text', value: 'text' }, { label: 'Email', value: 'email' }, { label: 'Password', value: 'password' }, { label: 'Number', value: 'number' },
                  ]} />
                </Field>
              </>
            )}
            {node.type === 'form' && (
              <>
                <Field label="Title"><TextInput value={node.props.title || ''} onChange={(v) => setProp('title', v)} /></Field>
                <Field label="Button"><TextInput value={node.props.buttonLabel || ''} onChange={(v) => setProp('buttonLabel', v)} /></Field>
              </>
            )}
            {node.type === 'alert' && (
              <Field label="Variant">
                <SelectInput value={node.props.variant || 'info'} onChange={(v) => setProp('variant', v)} options={[
                  { label: 'Info', value: 'info' }, { label: 'Success', value: 'success' }, { label: 'Warning', value: 'warning' }, { label: 'Error', value: 'error' },
                ]} />
              </Field>
            )}
          </Section>
        )}

        {/* Layout */}
        <Section icon={Layout} title="Layout">
          <Field label="Width"><NumberInput value={s.width || ''} onChange={(v) => setS({ width: v })} /></Field>
          {!isLayout && <Field label="Height"><NumberInput value={s.height || ''} onChange={(v) => setS({ height: v })} /></Field>}
          {isLayout && (
            <>
              <Field label="Direction">
                <SelectInput value={s.flexDirection || 'column'} onChange={(v) => setS({ flexDirection: v as 'row' | 'column', display: 'flex' })} options={[
                  { label: 'Row', value: 'row' }, { label: 'Column', value: 'column' },
                ]} />
              </Field>
              <Field label="Gap"><NumberInput value={s.gap || ''} onChange={(v) => setS({ gap: v })} /></Field>
              <Field label="Align">
                <SelectInput value={s.alignItems || 'stretch'} onChange={(v) => setS({ alignItems: v })} options={[
                  { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Stretch', value: 'stretch' },
                ]} />
              </Field>
              <Field label="Justify">
                <SelectInput value={s.justifyContent || 'flex-start'} onChange={(v) => setS({ justifyContent: v })} options={[
                  { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Between', value: 'space-between' }, { label: 'Around', value: 'space-around' },
                ]} />
              </Field>
            </>
          )}
        </Section>

        {/* Spacing */}
        <Section icon={Square} title="Spacing">
          <Field label="Padding"><NumberInput value={s.padding || ''} onChange={(v) => setS({ padding: v })} /></Field>
          <Field label="Margin"><NumberInput value={s.margin || ''} onChange={(v) => setS({ margin: v })} /></Field>
        </Section>

        {/* Typography */}
        {(hasFontSize || hasFontWeight || hasAlign) && (
          <Section icon={AlignLeft} title="Typography">
            {hasFontSize && <Field label="Font size"><NumberInput value={s.fontSize || ''} onChange={(v) => setS({ fontSize: v })} /></Field>}
            {hasFontWeight && (
              <Field label="Weight">
                <SelectInput value={s.fontWeight || '400'} onChange={(v) => setS({ fontWeight: v })} options={FONT_WEIGHTS} />
              </Field>
            )}
            {hasAlign && (
              <Field label="Align">
                <SelectInput value={s.textAlign || 'left'} onChange={(v) => setS({ textAlign: v as 'left' | 'center' | 'right' })} options={ALIGN_OPTIONS} />
              </Field>
            )}
          </Section>
        )}

        {/* Appearance */}
        <Section icon={Palette} title="Appearance">
          {hasBg && <Field label="Background"><ColorInput value={s.backgroundColor || ''} onChange={(v) => setS({ backgroundColor: v })} /></Field>}
          {hasTextColor && <Field label="Text color"><ColorInput value={s.color || ''} onChange={(v) => setS({ color: v })} /></Field>}
          {hasBorder && (
            <>
              <Field label="Radius"><NumberInput value={s.borderRadius || ''} onChange={(v) => setS({ borderRadius: v })} /></Field>
              <Field label="Border W."><NumberInput value={s.borderWidth || ''} onChange={(v) => setS({ borderWidth: v })} /></Field>
              <Field label="Border col."><ColorInput value={s.borderColor || ''} onChange={(v) => setS({ borderColor: v })} /></Field>
            </>
          )}
        </Section>
      </div>
    </div>
  );
}
