import { UINode } from '../types';

export const cloneTree = (node: UINode): UINode => {
  return JSON.parse(JSON.stringify(node));
};

export const findNode = (root: UINode, id: string): UINode | null => {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
};

export const findParent = (root: UINode, childId: string): UINode | null => {
  if (root.children) {
    for (const child of root.children) {
      if (child.id === childId) return root;
      const found = findParent(child, childId);
      if (found) return found;
    }
  }
  return null;
};

export const updateNodeInTree = (root: UINode, id: string, updates: Partial<UINode>): UINode => {
  const newRoot = cloneTree(root);
  const target = findNode(newRoot, id);
  if (target) {
    Object.assign(target, updates);
  }
  return newRoot;
};

export const moveNodeInTree = (
  root: UINode, 
  draggedId: string, 
  targetId: string, 
  position: 'inside' | 'before' | 'after'
): UINode => {
  // Prevent moving root or moving into self
  if (draggedId === root.id || draggedId === targetId) return root;

  const newRoot = cloneTree(root);
  
  // 1. Find dragged node and its parent to remove it
  let draggedNode: UINode | null = null;
  let oldParent: UINode | null = null;

  const findAndRemove = (node: UINode, parent: UINode | null) => {
    if (node.id === draggedId) {
      draggedNode = node;
      oldParent = parent;
      return true;
    }
    if (node.children) {
      for (const child of node.children) {
        if (findAndRemove(child, node)) return true;
      }
    }
    return false;
  };

  findAndRemove(newRoot, null);

  if (!draggedNode || !oldParent) return root; 

  // Check if we are trying to move a node into one of its own descendants (illegal)
  const isDescendant = !!findNode(draggedNode, targetId);
  if (isDescendant) return root;

  // Remove from old parent
  oldParent.children = oldParent.children?.filter(c => c.id !== draggedId);

  // 2. Find target and insert
  const target = findNode(newRoot, targetId);
  
  if (!target) return root; 

  if (position === 'inside') {
    if (!target.children) target.children = [];
    target.children.push(draggedNode);
  } else {
    const targetParent = findParent(newRoot, targetId);
    if (targetParent && targetParent.children) {
       const targetIndex = targetParent.children.findIndex(c => c.id === targetId);
       const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
       targetParent.children.splice(insertIndex, 0, draggedNode);
    }
  }

  return newRoot;
};