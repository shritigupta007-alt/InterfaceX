import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus, Clock, Trash2, ArrowRight, FolderOpen, Search, Copy, MoreVertical,
  Edit2, Share2, LogOut, User, Shield, Users, Loader2, Sparkles, AlertCircle
} from 'lucide-react';
import { api, ProjectMetadata, FullProject } from '@/services/api';
import { loadProjects, createProject as createLocalProject, upsertProject, deleteProject as deleteLocalProject } from '@/engine/storage';
import { createStarterTree } from '@/engine/starterTree';
import type { Project } from '@/engine/types';
import { useAuth } from '@/context/AuthContext';
import { InviteModal } from '@/components/collaboration/InviteModal';

interface Props {
  onOpen: (project: Project, role?: 'OWNER' | 'EDITOR' | 'VIEWER') => void;
  onBack: () => void;
}

type TabFilter = 'all' | 'recent' | 'shared';

export function Dashboard({ onOpen, onBack }: Props) {
  const { user, logout, openAuthModal } = useAuth();
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>('all');
  const [search, setSearch] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Modals state
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [shareTarget, setShareTarget] = useState<{ id: string; name: string } | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      if (user) {
        // Fetch from MongoDB backend
        const res = await api.projects.list({
          filter: filter === 'recent' ? 'recent' : filter === 'shared' ? 'shared' : 'all',
          search: search.trim() || undefined,
        });
        if (res.success && res.data) {
          setProjects(res.data.projects);
        }
      } else {
        // Fallback to local storage for guests
        const local = loadProjects();
        const mapped: ProjectMetadata[] = local.map((p) => ({
          id: p.id,
          name: p.name,
          owner: { id: 'local', name: 'You (Guest)', email: '', avatarColor: '#7657FF' },
          role: 'OWNER',
          collaboratorCount: 1,
          componentCount: Array.isArray(p.tree) ? p.tree.length : 0,
          createdAt: new Date(p.createdAt).toISOString(),
          updatedAt: new Date(p.updatedAt).toISOString(),
        }));
        setProjects(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch from backend, loading local projects:', err);
      const local = loadProjects();
      setProjects(
        local.map((p) => ({
          id: p.id,
          name: p.name,
          owner: { id: 'local', name: 'Local', email: '', avatarColor: '#7657FF' },
          role: 'OWNER',
          collaboratorCount: 1,
          componentCount: p.tree.length,
          createdAt: new Date(p.createdAt).toISOString(),
          updatedAt: new Date(p.updatedAt).toISOString(),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user, filter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async () => {
    setActionLoading(true);
    try {
      if (user) {
        const starter = createStarterTree();
        const res = await api.projects.create({
          name: 'Untitled Project',
          tree: starter,
        });
        if (res.success && res.data?.project) {
          const p = res.data.project;
          const proj: Project = {
            id: p.id,
            name: p.name,
            tree: p.tree,
            createdAt: new Date(p.createdAt).getTime(),
            updatedAt: new Date(p.updatedAt).getTime(),
          };
          onOpen(proj, 'OWNER');
          return;
        }
      }

      // Guest / offline fallback
      const localP = createLocalProject('Untitled Project', createStarterTree());
      upsertProject(localP);
      onOpen(localP, 'OWNER');
    } catch (err: any) {
      alert(`Error creating project: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenProject = async (meta: ProjectMetadata) => {
    try {
      if (user && /^[0-9a-fA-F]{24}$/.test(meta.id)) {
        const res = await api.projects.get(meta.id);
        if (res.success && res.data?.project) {
          const p = res.data.project;
          const proj: Project = {
            id: p.id,
            name: p.name,
            tree: p.tree,
            createdAt: new Date(p.createdAt).getTime(),
            updatedAt: new Date(p.updatedAt).getTime(),
          };
          onOpen(proj, p.role);
          return;
        }
      }

      // Check local storage
      const local = loadProjects().find((p) => p.id === meta.id);
      if (local) {
        onOpen(local, 'OWNER');
      } else {
        alert('Could not find project data.');
      }
    } catch (err: any) {
      alert(`Failed to load project: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) {
      return;
    }
    try {
      if (user && /^[0-9a-fA-F]{24}$/.test(id)) {
        await api.projects.delete(id);
      }
      deleteLocalProject(id);
      await fetchProjects();
    } catch (err: any) {
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      if (user && /^[0-9a-fA-F]{24}$/.test(id)) {
        await api.projects.duplicate(id);
      } else {
        const local = loadProjects().find((p) => p.id === id);
        if (local) {
          const copy = createLocalProject(`${local.name} (Copy)`, local.tree);
          upsertProject(copy);
        }
      }
      await fetchProjects();
    } catch (err: any) {
      alert(`Failed to duplicate project: ${err.message}`);
    }
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !renameValue.trim()) return;

    try {
      if (user && /^[0-9a-fA-F]{24}$/.test(renameTarget.id)) {
        await api.projects.update(renameTarget.id, { name: renameValue.trim() });
      } else {
        const local = loadProjects().find((p) => p.id === renameTarget.id);
        if (local) {
          local.name = renameValue.trim();
          local.updatedAt = Date.now();
          upsertProject(local);
        }
      }
      setRenameTarget(null);
      await fetchProjects();
    } catch (err: any) {
      alert(`Failed to rename: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-[#E5E7F0] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={onBack} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#7657FF] flex items-center justify-center text-white font-bold text-sm">
                iX
              </div>
              <span className="font-bold text-[#17182B] text-base">InterfaceX</span>
            </button>
            <div className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#6B6C85]">
              <span className="px-2.5 py-1 rounded-md bg-[#F1F2F8] text-[#17182B]">Studio</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-[#E5E7F0] hover:border-[#D1D5E8] bg-white transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: user.avatarColor || '#7657FF' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-[#17182B] hidden sm:block truncate max-w-[120px]">
                    {user.name}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E7F0] rounded-xl shadow-xl z-30 py-2">
                      <div className="px-4 py-2 border-b border-[#F1F2F8]">
                        <p className="text-xs font-semibold text-[#17182B]">{user.name}</p>
                        <p className="text-[11px] text-[#9B9CB5] truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#E05260] hover:bg-[#FDF2F4] flex items-center gap-2 font-medium"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-[#17182B] hover:text-[#7657FF]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#7657FF] text-white text-xs font-semibold hover:bg-[#6344E6]"
                >
                  Sign Up
                </button>
              </div>
            )}
            <button onClick={onBack} className="text-xs text-[#6B6C85] hover:text-[#17182B]">
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-gradient-to-r from-white to-[#F6F5FF] border border-[#E5E7F0] rounded-2xl p-6 sm:p-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F6F5FF] border border-[#ECE9FE] text-[11px] font-semibold text-[#7657FF] mb-2">
              <Sparkles size={12} /> Visual Development Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17182B]">
              {user ? `Welcome back, ${user.name}!` : 'Welcome to InterfaceX!'}
            </h1>
            <p className="text-sm text-[#6B6C85] mt-1 max-w-lg">
              {user
                ? 'Design interfaces with live components, collaborate with your team, and export runnable code.'
                : 'Sign in to sync your projects to the cloud and collaborate with others in real-time.'}
            </p>
          </div>

          <button
            onClick={handleCreate}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#7657FF] text-white text-sm font-semibold hover:bg-[#6344E6] shadow-lg shadow-[#7657FF]/25 transition-all flex-shrink-0"
          >
            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            <span>Create New Project</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center bg-white border border-[#E5E7F0] rounded-xl p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all' ? 'bg-[#7657FF] text-white shadow-sm' : 'text-[#6B6C85] hover:text-[#17182B]'
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'recent' ? 'bg-[#7657FF] text-white shadow-sm' : 'text-[#6B6C85] hover:text-[#17182B]'
              }`}
            >
              Recent
            </button>
            {user && (
              <button
                onClick={() => setFilter('shared')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filter === 'shared' ? 'bg-[#7657FF] text-white shadow-sm' : 'text-[#6B6C85] hover:text-[#17182B]'
                }`}
              >
                Shared With Me
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9CB5]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#E5E7F0] rounded-xl outline-none focus:border-[#7657FF] text-[#17182B]"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={28} className="animate-spin mx-auto text-[#7657FF] mb-3" />
            <p className="text-sm text-[#6B6C85]">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7F0] p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F6F5FF] flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={24} className="text-[#7657FF]" />
            </div>
            <h3 className="font-bold text-[#17182B] mb-1">No projects found</h3>
            <p className="text-sm text-[#6B6C85] mb-5">
              {search ? 'Try clearing your search query' : 'Create your first project to start building visually.'}
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7657FF] text-white text-sm font-semibold hover:bg-[#6344E6]"
            >
              <Plus size={18} /> Create New Project
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => {
              const isOwner = p.role === 'OWNER';
              const initial = p.name.charAt(0).toUpperCase() || 'P';

              return (
                <div
                  key={p.id}
                  className="group relative bg-white rounded-2xl border border-[#E5E7F0] hover:border-[#D1D5E8] p-5 hover:shadow-xl hover:shadow-[#17182B]/5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Icon, Role Badge, Menu */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F6F5FF] to-[#EBE9FE] border border-[#ECE9FE] flex items-center justify-center text-[#7657FF] font-black text-base shadow-sm">
                        {initial}
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOwner
                              ? 'bg-[#F6F5FF] text-[#7657FF]'
                              : p.role === 'EDITOR'
                              ? 'bg-[#EBFBF8] text-[#3DA08C]'
                              : 'bg-[#F1F2F8] text-[#6B6C85]'
                          }`}
                        >
                          {p.role}
                        </span>

                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(activeMenuId === p.id ? null : p.id);
                            }}
                            className="p-1 rounded-md text-[#9B9CB5] hover:text-[#17182B] hover:bg-[#F1F2F8] transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuId === p.id && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#E5E7F0] rounded-xl shadow-xl z-30 py-1 text-xs">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleOpenProject(p);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-[#F8F9FC] text-[#17182B] flex items-center gap-2"
                                >
                                  <ArrowRight size={14} /> Open Editor
                                </button>
                                {isOwner && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setRenameTarget({ id: p.id, name: p.name });
                                      setRenameValue(p.name);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-[#F8F9FC] text-[#17182B] flex items-center gap-2"
                                  >
                                    <Edit2 size={14} /> Rename
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleDuplicate(p.id);
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-[#F8F9FC] text-[#17182B] flex items-center gap-2"
                                >
                                  <Copy size={14} /> Duplicate
                                </button>
                                {isOwner && /^[0-9a-fA-F]{24}$/.test(p.id) && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setShareTarget({ id: p.id, name: p.name });
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-[#F8F9FC] text-[#7657FF] flex items-center gap-2 font-semibold"
                                  >
                                    <Share2 size={14} /> Share & Invite
                                  </button>
                                )}
                                {isOwner && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      handleDelete(p.id, p.name);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-[#FDF2F4] text-[#E05260] flex items-center gap-2"
                                  >
                                    <Trash2 size={14} /> Delete
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Project Title */}
                    <h3
                      onClick={() => handleOpenProject(p)}
                      className="font-bold text-base text-[#17182B] mb-1.5 truncate cursor-pointer hover:text-[#7657FF] transition-colors"
                    >
                      {p.name}
                    </h3>

                    {/* Metadata stats */}
                    <div className="flex items-center gap-3 text-xs text-[#9B9CB5] mb-5">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {new Date(p.updatedAt).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <span>{p.componentCount} elements</span>
                      {p.collaboratorCount > 1 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-[#7657FF] font-medium">
                            <Users size={12} /> {p.collaboratorCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Open button */}
                  <div className="pt-3 border-t border-[#F1F2F8] flex items-center justify-between">
                    <span className="text-[11px] text-[#9B9CB5]">
                      {p.owner ? `By ${p.owner.name}` : 'Local Project'}
                    </span>
                    <button
                      onClick={() => handleOpenProject(p)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#7657FF] hover:gap-1.5 transition-all"
                    >
                      Open Project <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Rename Modal */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#E5E7F0]">
            <h3 className="font-bold text-base text-[#17182B] mb-3">Rename Project</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D1D5E8] rounded-xl outline-none focus:border-[#7657FF]"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#6B6C85] hover:text-[#17182B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#7657FF] hover:bg-[#6344E6] rounded-xl"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share / Invite Modal */}
      {shareTarget && (
        <InviteModal
          projectId={shareTarget.id}
          projectName={shareTarget.name}
          isOwner={true}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}
