import type { ComponentNode } from './types';
import { createNode } from './componentLibrary';

export function findNode(tree: ComponentNode[], id: string): ComponentNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function updateNode(
  tree: ComponentNode[],
  id: string,
  updater: (n: ComponentNode) => ComponentNode
): ComponentNode[] {
  return tree.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children.length) return { ...node, children: updateNode(node.children, id, updater) };
    return node;
  });
}

export function removeNode(tree: ComponentNode[], id: string): ComponentNode[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: removeNode(node.children, id) }));
}

export function insertNode(tree: ComponentNode[], node: ComponentNode, parentId: string | null, index?: number): ComponentNode[] {
  if (parentId === null) {
    const arr = [...tree];
    const at = index ?? arr.length;
    arr.splice(at, 0, node);
    return arr;
  }
  return tree.map((n) => {
    if (n.id === parentId) {
      const arr = [...n.children];
      const at = index ?? arr.length;
      arr.splice(at, 0, node);
      return { ...n, children: arr };
    }
    return { ...n, children: insertNode(n.children, node, parentId, index) };
  });
}

export function moveNode(tree: ComponentNode[], id: string, direction: 'up' | 'down'): ComponentNode[] {
  function walk(arr: ComponentNode[]): ComponentNode[] {
    const idx = arr.findIndex((n) => n.id === id);
    if (idx >= 0) {
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= arr.length) return arr;
      const newArr = [...arr];
      [newArr[idx], newArr[target]] = [newArr[target], newArr[idx]];
      return newArr;
    }
    return arr.map((n) => ({ ...n, children: walk(n.children) }));
  }
  return walk(tree);
}

export function appendChild(tree: ComponentNode[], parentId: string, type: import('./types').ComponentType): ComponentNode[] {
  const node = createNode(type);
  return insertNode(tree, node, parentId);
}

export function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
