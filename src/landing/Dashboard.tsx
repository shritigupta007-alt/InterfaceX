import { useEffect, useState } from 'react';
import { Plus, Clock, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { loadProjects, deleteProject, getActiveProjectId } from '@/engine/storage';
import { createProject } from '@/engine/storage';
import { createStarterTree } from '@/engine/starterTree';
import type { Project } from '@/engine/types';

interface Props {
  onOpen: (project: Project) => void;
  onBack: () => void;
}

export function Dashboard({ onOpen, onBack }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const activeId = getActiveProjectId();

  useEffect(() => {
    setProjects(loadProjects());
  }, []);

  const handleCreate = () => {
    const p = createProject('Untitled Project', createStarterTree());
    onOpen(p);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project? This cannot be undone.')) {
      deleteProject(id);
      setProjects(loadProjects());
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <nav className="bg-white border-b border-[#E5E7F0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-sm">iX</div>
            <span className="font-semibold text-[#17182B]">InterfaceX</span>
          </button>
          <button onClick={onBack} className="text-sm text-[#6B6C85] hover:text-[#17182B]">Back to Home</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#17182B]">Your Projects</h1>
            <p className="text-sm text-[#6B6C85] mt-1">Pick up where you left off or start something new.</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#7657FF] text-white text-sm font-semibold hover:bg-[#6344E6]">
            <Plus size={18} /> New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7F0] p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F5FF] flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={24} className="text-[#7657FF]" />
            </div>
            <h3 className="font-semibold text-[#17182B] mb-1">No projects yet</h3>
            <p className="text-sm text-[#6B6C85] mb-5">Create your first project to start building.</p>
            <button onClick={handleCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7657FF] text-white text-sm font-semibold hover:bg-[#6344E6]">
              <Plus size={18} /> Create New Project
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="group bg-white rounded-2xl border border-[#E5E7F0] p-5 hover:shadow-lg hover:shadow-[#17182B]/5 transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F6F5FF] flex items-center justify-center text-[#7657FF] font-bold text-sm">
                    {p.name.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md text-[#9B9CB5] hover:text-[#E05260] hover:bg-[#FDF2F4] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 className="font-semibold text-[#17182B] mb-1 truncate">{p.name}</h3>
                <p className="text-xs text-[#9B9CB5] flex items-center gap-1 mb-4">
                  <Clock size={12} /> {new Date(p.updatedAt).toLocaleDateString()} · {p.tree.length} components
                </p>
                <div className="flex items-center justify-between">
                  {activeId === p.id && <span className="text-xs text-[#3DA08C] font-medium">Active</span>}
                  <button onClick={() => onOpen(p)} className="ml-auto flex items-center gap-1 text-sm font-medium text-[#7657FF] hover:gap-2 transition-all">
                    Open <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
