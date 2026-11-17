import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as encoding from 'lib0/encoding.js';
import * as decoding from 'lib0/decoding.js';
import type { ComponentNode } from '@/engine/types';
import { useAuth } from '@/context/AuthContext';

const messageSync = 0;
const messageAwareness = 1;

export interface CollaboratorPresence {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  selectedId?: string | null;
}

interface UseCollaborationOptions {
  projectId: string;
  initialTree: ComponentNode[];
  onRemoteTreeChange: (tree: ComponentNode[]) => void;
  selectedId: string | null;
}

export function useCollaboration({
  projectId,
  initialTree,
  onRemoteTreeChange,
  selectedId,
}: UseCollaborationOptions) {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [role, setRole] = useState<'OWNER' | 'EDITOR' | 'VIEWER'>('OWNER');
  const [isConnected, setIsConnected] = useState(false);

  const docRef = useRef<Y.Doc>(new Y.Doc());
  const awarenessRef = useRef<awarenessProtocol.Awareness>(
    new awarenessProtocol.Awareness(docRef.current)
  );
  const wsRef = useRef<WebSocket | null>(null);
  const isApplyingRemoteRef = useRef(false);

  // Broadcast local component tree update via Yjs
  const broadcastTree = useCallback(
    (tree: ComponentNode[]) => {
      if (role === 'VIEWER' || isApplyingRemoteRef.current) return;

      const doc = docRef.current;
      const yTree = doc.getArray('tree');

      doc.transact(() => {
        yTree.delete(0, yTree.length);
        yTree.insert(0, tree);
      }, 'local-change');
    },
    [role]
  );

  useEffect(() => {
    if (!projectId) return;

    const doc = new Y.Doc();
    docRef.current = doc;
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenessRef.current = awareness;

    // Build WS URL based on current host
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/collab/${projectId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setIsConnected(true);

      // Send Sync Step 1 to server
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      ws.send(encoding.toUint8Array(encoder));

      // Set initial awareness state
      if (user) {
        awareness.setLocalStateField('user', {
          userId: user.id,
          name: user.name,
          email: user.email,
          avatarColor: user.avatarColor,
          selectedId,
        });
      }
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const meta = JSON.parse(event.data);
          if (meta.type === 'meta' && meta.role) {
            setRole(meta.role);
          }
        } catch {
          // ignore
        }
        return;
      }

      const data = new Uint8Array(event.data);
      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, messageSync);

          isApplyingRemoteRef.current = true;
          syncProtocol.readSyncMessage(decoder, replyEncoder, doc, ws);
          isApplyingRemoteRef.current = false;

          if (encoding.length(replyEncoder) > 1) {
            ws.send(encoding.toUint8Array(replyEncoder));
          }
          break;
        }

        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            ws
          );
          break;
        }
      }
    };

    // Listen to local doc updates and send to server
    const handleDocUpdate = (update: Uint8Array, origin: any) => {
      if (origin !== ws && ws.readyState === WebSocket.OPEN) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        ws.send(encoding.toUint8Array(encoder));
      }

      // Check if remote change modified tree
      if (origin === ws) {
        const yTree = doc.getArray('tree');
        const newTree = yTree.toJSON() as ComponentNode[];
        if (Array.isArray(newTree) && newTree.length > 0) {
          onRemoteTreeChange(newTree);
        }
      }
    };
    doc.on('update', handleDocUpdate);

    // Listen to awareness changes and update state
    const handleAwarenessChange = () => {
      const states = awareness.getStates();
      const list: CollaboratorPresence[] = [];
      states.forEach((state: any) => {
        if (state.user) {
          list.push({
            userId: state.user.userId,
            name: state.user.name,
            email: state.user.email,
            avatarColor: state.user.avatarColor,
            role: state.user.role || 'EDITOR',
            selectedId: state.user.selectedId,
          });
        }
      });
      setCollaborators(list);
    };
    awareness.on('change', handleAwarenessChange);

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      doc.off('update', handleDocUpdate);
      awareness.off('change', handleAwarenessChange);
      ws.close();
      doc.destroy();
    };
  }, [projectId]);

  // Update awareness when selectedId or user changes
  useEffect(() => {
    if (awarenessRef.current && user) {
      awarenessRef.current.setLocalStateField('user', {
        userId: user.id,
        name: user.name,
        email: user.email,
        avatarColor: user.avatarColor,
        role,
        selectedId,
      });
    }
  }, [selectedId, user, role]);

  return {
    isConnected,
    role,
    isReadOnly: role === 'VIEWER',
    collaborators,
    broadcastTree,
  };
}
