import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { COMPONENT_LIBRARY, CATEGORIES } from '@/engine/componentLibrary';
import type { ComponentCategory, ComponentType } from '@/engine/types';
import type { EditorApi } from './useEditor';

interface Props {
  api: EditorApi;
  onClose?: () => void;
}

export function ComponentSidebar({ api, onClose }: Props) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return COMPONENT_LIBRARY;
    const q = query.toLowerCase();
    return COMPONENT_LIBRARY.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [query]);

  const byCategory = (cat: ComponentCategory) => filtered.filter((c) => c.category === cat);

  const handleAdd = (type: ComponentType) => {
    api.addComponent(type);
    if (onClose) onClose();
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="p-3 border-b border-[#E5E7F0]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#17182B]">Components</h2>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-[#6B6C85] text-sm">Close</button>
          )}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9B9CB5]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-[#F1F2F8] rounded-md outline-none focus:bg-white focus:ring-1 focus:ring-[#7657FF] text-[#17182B]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {CATEGORIES.map((cat) => {
          const items = byCategory(cat.id);
          if (items.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#9B9CB5] mb-2">{cat.label}</h3>
              <div className="grid grid-cols-2 gap-2">
                {items.map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.type}
                      onClick={() => handleAdd(c.type)}
                      className="group flex flex-col items-start gap-1.5 p-3 rounded-lg border border-[#E5E7F0] hover:border-[#7657FF] hover:bg-[#F6F5FF] transition-colors text-left"
                    >
                      <Icon size={18} className="text-[#7657FF]" />
                      <span className="text-xs font-medium text-[#17182B] leading-tight">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
