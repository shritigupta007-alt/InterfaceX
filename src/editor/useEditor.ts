import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentNode, Project, Styles } from '@/engine/types';
import { createNode } from '@/engine/componentLibrary';
import {
  findNode, updateNode, removeNode, insertNode, moveNode, deepClone,
} from '@/engine/treeUtils';
import { createProject, getActiveProjectId, loadProjects, setActiveProjectId, upsertProject } from '@/engine/storage';
import { createStarterTree } from '@/engine/starterTree';
import { api } from '@/services/api';

const MAX_HISTORY = 60;

export type Viewport = 'desktop' | 'tablet' | 'mobile';
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';
export type ProjectRole = 'OWNER' | 'EDITOR' | 'VIEWER';

export const VIEWPORTS: { id: Viewport; label: string; width: number }[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

export function useEditor(initialProject?: Project, initialRole: ProjectRole = 'OWNER') {
  const [project, setProject] = useState<Project>(() => {
    if (initialProject) return initialProject;
    const activeId = getActiveProjectId();
    if (activeId) {
      const found = loadProjects().find((p) => p.id === activeId);
      if (found) return found;
    }
    return createProject('My First Interface', createStarterTree());
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [role, setRole] = useState<ProjectRole>(initialRole);

  const historyRef = useRef<ComponentNode[][]>([]);
  const futureRef = useRef<ComponentNode[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Sync when initialProject changes
  useEffect(() => {
    if (initialProject && initialProject.id !== project.id) {
      setProject(initialProject);
      setSelectedId(null);
      setDirty(false);
      setSaveStatus('saved');
      historyRef.current = [];
      futureRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [initialProject?.id]);

  // Persist active project id
  useEffect(() => {
    setActiveProjectId(project.id);
  }, [project.id]);

  const pushHistory = useCallback((tree: ComponentNode[]) => {
    historyRef.current.push(deepClone(tree));
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    futureRef.current = [];
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(false);
  }, []);

  const commit = useCallback(
    (updater: (tree: ComponentNode[]) => ComponentNode[], opts?: { silent?: boolean }) => {
      if (role === 'VIEWER') return; // Read-only mode
      setProject((prev) => {
        if (!opts?.silent) pushHistory(prev.tree);
        const tree = updater(prev.tree);
        return { ...prev, tree, updatedAt: Date.now() };
      });
      setDirty(true);
      setSaveStatus('unsaved');
    },
    [pushHistory, role]
  );

  const addComponent = useCallback(
    (type: import('@/engine/types').ComponentType, parentId: string | null = null) => {
      const node = createNode(type);
      commit((tree) => insertNode(tree, node, parentId));
      setSelectedId(node.id);
    },
    [commit]
  );

  const selectNode = useCallback((id: string | null) => setSelectedId(id), []);

  const updateContent = useCallback(
    (id: string, content: string) => {
      commit((tree) => updateNode(tree, id, (n) => ({ ...n, content })));
    },
    [commit]
  );

  const updateProps = useCallback(
    (id: string, key: string, value: string) => {
      commit((tree) => updateNode(tree, id, (n) => ({ ...n, props: { ...n.props, [key]: value } })));
    },
    [commit]
  );

  const updateStyles = useCallback(
    (id: string, patch: Partial<Styles>) => {
      commit((tree) => updateNode(tree, id, (n) => ({ ...n, styles: { ...n.styles, ...patch } })));
    },
    [commit]
  );

  const deleteNode = useCallback(
    (id: string) => {
      commit((tree) => removeNode(tree, id));
      setSelectedId((cur) => (cur === id ? null : cur));
    },
    [commit]
  );

  const moveNodeDir = useCallback(
    (id: string, dir: 'up' | 'down') => {
      commit((tree) => moveNode(tree, id, dir));
    },
    [commit]
  );

  const undo = useCallback(() => {
    if (role === 'VIEWER' || historyRef.current.length === 0) return;
    setProject((prev) => {
      const past = historyRef.current.pop()!;
      futureRef.current.push(deepClone(prev.tree));
      return { ...prev, tree: past };
    });
    setDirty(true);
    setSaveStatus('unsaved');
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
  }, [role]);

  const redo = useCallback(() => {
    if (role === 'VIEWER' || futureRef.current.length === 0) return;
    setProject((prev) => {
      const next = futureRef.current.pop()!;
      historyRef.current.push(deepClone(prev.tree));
      return { ...prev, tree: next };
    });
    setDirty(true);
    setSaveStatus('unsaved');
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, [role]);

  const renameProject = useCallback(
    (name: string) => {
      if (role === 'VIEWER') return;
      setProject((prev) => ({ ...prev, name }));
      setDirty(true);
      setSaveStatus('unsaved');
    },
    [role]
  );

  const resetCanvas = useCallback(() => {
    if (role === 'VIEWER') return;
    pushHistory(project.tree);
    setProject((prev) => ({ ...prev, tree: [], updatedAt: Date.now() }));
    setSelectedId(null);
    setDirty(true);
    setSaveStatus('unsaved');
  }, [project.tree, pushHistory, role]);

  const newProject = useCallback((name: string) => {
    const p = createProject(name || 'Untitled Project', createStarterTree());
    setProject(p);
    setSelectedId(null);
    setDirty(true);
    setSaveStatus('unsaved');
    setRole('OWNER');
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const openProject = useCallback((p: Project, pRole: ProjectRole = 'OWNER') => {
    setProject(p);
    setRole(pRole);
    setSelectedId(null);
    setDirty(false);
    setSaveStatus('saved');
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const save = useCallback(async () => {
    if (role === 'VIEWER') return;
    setSaveStatus('saving');
    try {
      upsertProject(project);
      if (/^[0-9a-fA-F]{24}$/.test(project.id)) {
        await api.projects.update(project.id, {
          name: project.name,
          tree: project.tree,
        });
      }
      setDirty(false);
      setSaveStatus('saved');
      setSavedAt(Date.now());
    } catch (err) {
      console.warn('[Editor] Cloud save failed, saved locally:', err);
      setSaveStatus('saved'); // Local save succeeded
    }
  }, [project, role]);

  // Apply remote tree update from Yjs CRDT
  const applyRemoteTree = useCallback((newTree: ComponentNode[]) => {
    setProject((prev) => ({ ...prev, tree: newTree, updatedAt: Date.now() }));
  }, []);

  // Debounced cloud autosave (1.5s)
  useEffect(() => {
    if (!dirty || role === 'VIEWER') return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        upsertProject(project);
        if (/^[0-9a-fA-F]{24}$/.test(project.id)) {
          await api.projects.update(project.id, {
            name: project.name,
            tree: project.tree,
          });
        }
        setDirty(false);
        setSaveStatus('saved');
        setSavedAt(Date.now());
      } catch (err) {
        console.warn('[Editor] Autosave to cloud deferred, saved locally:', err);
        setSaveStatus('saved');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [project, dirty, role]);

  // Autosave on window beforeunload
  useEffect(() => {
    const handler = () => {
      if (dirty && role !== 'VIEWER') {
        upsertProject({ ...project, updatedAt: Date.now() });
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, project, role]);

  const selectedNode = useMemo(
    () => (selectedId ? findNode(project.tree, selectedId) : null),
    [selectedId, project.tree]
  );

  return {
    project,
    tree: project.tree,
    selectedId,
    selectedNode,
    viewport,
    dirty,
    saveStatus,
    savedAt,
    canUndo,
    canRedo,
    role,
    isReadOnly: role === 'VIEWER',
    setRole,
    setViewport,
    addComponent,
    selectNode,
    updateContent,
    updateProps,
    updateStyles,
    deleteNode,
    moveNodeDir,
    undo,
    redo,
    renameProject,
    resetCanvas,
    newProject,
    openProject,
    save,
    applyRemoteTree,
  };
}

export type EditorApi = ReturnType<typeof useEditor>;
