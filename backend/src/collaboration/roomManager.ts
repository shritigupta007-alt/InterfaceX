import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as encoding from 'lib0/encoding.js';
import * as decoding from 'lib0/decoding.js';
import { WebSocket } from 'ws';
import { Project } from '../models/Project.js';

const messageSync = 0;
const messageAwareness = 1;

export interface ClientConnection {
  ws: WebSocket;
  userId: string;
  userName: string;
  userEmail: string;
  avatarColor: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
}

export class ProjectRoom {
  public projectId: string;
  public doc: Y.Doc;
  public awareness: awarenessProtocol.Awareness;
  public clients: Set<ClientConnection> = new Set();
  private saveTimeout: NodeJS.Timeout | null = null;
  private isLoaded: boolean = false;

  constructor(projectId: string) {
    this.projectId = projectId;
    this.doc = new Y.Doc();
    this.awareness = new awarenessProtocol.Awareness(this.doc);

    // Document update listener: broadcast to other clients and debounce save to MongoDB
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      // Broadcast update to all clients except origin
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      for (const client of this.clients) {
        if (client.ws !== origin && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      }

      this.scheduleSave();
    });

    // Awareness update listener: broadcast presence to all clients
    this.awareness.on('update', ({ added, updated, removed }: any, origin: any) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      for (const client of this.clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      }
    });
  }

  public async initFromDB(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const proj = await Project.findById(this.projectId).lean();
      if (proj && Array.isArray(proj.tree) && proj.tree.length > 0) {
        const yTree = this.doc.getArray('tree');
        if (yTree.length === 0) {
          this.doc.transact(() => {
            yTree.insert(0, proj.tree);
          }, 'db-init');
        }
      }
      this.isLoaded = true;
    } catch (err) {
      console.error(`[ProjectRoom] Error loading project ${this.projectId} from DB:`, err);
    }
  }

  public scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(async () => {
      await this.saveToDB();
    }, 1500); // Debounce 1.5 seconds
  }

  public async saveToDB(): Promise<void> {
    try {
      const yTree = this.doc.getArray('tree');
      const treeJson = yTree.toJSON();
      await Project.findByIdAndUpdate(this.projectId, {
        tree: treeJson,
        updatedAt: new Date(),
      });
      console.log(`[ProjectRoom] Auto-saved project ${this.projectId} to MongoDB (${treeJson.length} root nodes)`);
    } catch (err) {
      console.error(`[ProjectRoom] Error saving project ${this.projectId} to DB:`, err);
    }
  }

  public addClient(client: ClientConnection): void {
    this.clients.add(client);

    // 1. Send Sync Step 1 (Server state -> Client)
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, this.doc);
    client.ws.send(encoding.toUint8Array(encoder));

    // 2. Send current awareness states to new client
    const awarenessStates = this.awareness.getStates();
    if (awarenessStates.size > 0) {
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, messageAwareness);
      encoding.writeVarUint8Array(
        awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(
          this.awareness,
          Array.from(awarenessStates.keys())
        )
      );
      client.ws.send(encoding.toUint8Array(awarenessEncoder));
    }
  }

  public removeClient(client: ClientConnection): void {
    this.clients.delete(client);
    awarenessProtocol.removeAwarenessStates(this.awareness, [this.doc.clientID], null);

    // If no more clients, flush final save to DB
    if (this.clients.size === 0) {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      this.saveToDB().catch(console.error);
    }
  }

  public handleMessage(client: ClientConnection, data: Uint8Array): void {
    try {
      const decoder = decoding.createDecoder(data);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          // If viewer, block mutations
          const syncType = decoding.readVarUint(decoder);
          // syncStep1 = 0, syncStep2 = 1, syncUpdate = 2
          if (syncType === 2 && client.role === 'VIEWER') {
            console.warn(`[ProjectRoom] Read-only user ${client.userEmail} attempted an edit on ${this.projectId}. Ignored.`);
            return;
          }

          // Re-create decoder from original buffer to process sync message properly
          const syncDecoder = decoding.createDecoder(data);
          decoding.readVarUint(syncDecoder); // skip messageSync
          const replyEncoder = encoding.createEncoder();
          encoding.writeVarUint(replyEncoder, messageSync);

          syncProtocol.readSyncMessage(syncDecoder, replyEncoder, this.doc, client.ws);

          if (encoding.length(replyEncoder) > 1) {
            client.ws.send(encoding.toUint8Array(replyEncoder));
          }
          break;
        }

        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            decoding.readVarUint8Array(decoder),
            client.ws
          );
          break;
        }

        default:
          console.warn(`[ProjectRoom] Unknown message type: ${messageType}`);
      }
    } catch (err) {
      console.error(`[ProjectRoom] Error handling WS message:`, err);
    }
  }
}

export class RoomManager {
  private rooms: Map<string, ProjectRoom> = new Map();

  public async getOrCreateRoom(projectId: string): Promise<ProjectRoom> {
    let room = this.rooms.get(projectId);
    if (!room) {
      room = new ProjectRoom(projectId);
      await room.initFromDB();
      this.rooms.set(projectId, room);
    }
    return room;
  }

  public removeRoomIfEmpty(projectId: string): void {
    const room = this.rooms.get(projectId);
    if (room && room.clients.size === 0) {
      this.rooms.delete(projectId);
      console.log(`[RoomManager] Room ${projectId} cleaned up.`);
    }
  }

  public getRoom(projectId: string): ProjectRoom | undefined {
    return this.rooms.get(projectId);
  }
}

export const roomManager = new RoomManager();
