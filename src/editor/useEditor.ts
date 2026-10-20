import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentNode, Project, Styles } from '@/engine/types';
import { createNode } from '@/engine/componentLibrary';
import {
  findNode, updateNode, removeNode, insertNode, moveNode, deepClone,
} from '@/engine/treeUtils';
import { createProject, getActiveProjectId, loadProjects, setActiveProjectId, upsertProject } from '@/engine/storage';
import { createStarterTree } from '@/engine/starterTree';

const MAX_HISTORY = 60;

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export const VIEWPORTS: { id: Viewport; label: string; width: number }[] = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 375 },
];

export function useEditor() {
  const [project, setProject] = useState<Project>(() => {
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
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const historyRef = useRef<ComponentNode[][]>([]);
  const futureRef = useRef<ComponentNode[][]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

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

  const commit = useCallback((updater: (tree: ComponentNode[]) => ComponentNode[], opts?: { silent?: boolean }) => {
    setProject((prev) => {
      if (!opts?.silent) pushHistory(prev.tree);
      const tree = updater(prev.tree);
      return { ...prev, tree, updatedAt: Date.now() };
    });
    setDirty(true);
  }, [pushHistory]);

  const addComponent = useCallback((type: import('@/engine/types').ComponentType, parentId: string | null = null) => {
    const node = createNode(type);
    commit((tree) => insertNode(tree, node, parentId));
    setSelectedId(node.id);
  }, [commit]);

  const selectNode = useCallback((id: string | null) => setSelectedId(id), []);

  const updateContent = useCallback((id: string, content: string) => {
    commit((tree) => updateNode(tree, id, (n) => ({ ...n, content })));
  }, [commit]);

  const updateProps = useCallback((id: string, key: string, value: string) => {
    commit((tree) => updateNode(tree, id, (n) => ({ ...n, props: { ...n.props, [key]: value } })));
  }, [commit]);

  const updateStyles = useCallback((id: string, patch: Partial<Styles>) => {
    commit((tree) => updateNode(tree, id, (n) => ({ ...n, styles: { ...n.styles, ...patch } })));
  }, [commit]);

  const deleteNode = useCallback((id: string) => {
    commit((tree) => removeNode(tree, id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, [commit]);

  const moveNodeDir = useCallback((id: string, dir: 'up' | 'down') => {
    commit((tree) => moveNode(tree, id, dir));
  }, [commit]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    setProject((prev) => {
      const past = historyRef.current.pop()!;
      futureRef.current.push(deepClone(prev.tree));
      return { ...prev, tree: past };
    });
    setDirty(true);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    setProject((prev) => {
      const next = futureRef.current.pop()!;
      historyRef.current.push(deepClone(prev.tree));
      return { ...prev, tree: next };
    });
    setDirty(true);
    setCanUndo(true);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const renameProject = useCallback((name: string) => {
    setProject((prev) => ({ ...prev, name }));
    setDirty(true);
  }, []);

  const resetCanvas = useCallback(() => {
    pushHistory(project.tree);
    setProject((prev) => ({ ...prev, tree: [], updatedAt: Date.now() }));
    setSelectedId(null);
    setDirty(true);
  }, [project.tree, pushHistory]);

  const newProject = useCallback((name: string) => {
    const p = createProject(name || 'Untitled Project', createStarterTree());
    setProject(p);
    setSelectedId(null);
    setDirty(true);
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const openProject = useCallback((p: Project) => {
    setProject(p);
    setSelectedId(null);
    setDirty(false);
    historyRef.current = [];
    futureRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, []);

  const save = useCallback(() => {
    upsertProject(project);
    setDirty(false);
    setSavedAt(Date.now());
  }, [project]);

  // Autosave on unmount / refresh via beforeunload
  useEffect(() => {
    const handler = () => {
      if (dirty) upsertProject({ ...project, updatedAt: Date.now() });
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, project]);

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
    savedAt,
    canUndo,
    canRedo,
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
  };
}

export type EditorApi = ReturnType<typeof useEditor>;
