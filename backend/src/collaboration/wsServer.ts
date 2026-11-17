import { Server as HttpServer, IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseUrl } from 'url';
import { parseCookie } from 'cookie';
import mongoose from 'mongoose';
import { verifyToken, COOKIE_NAME } from '../utils/jwt.js';
import { Project, ProjectRole } from '../models/Project.js';
import { User } from '../models/User.js';
import { roomManager, ClientConnection } from './roomManager.js';

export function setupWebSocketServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (req: IncomingMessage, socket, head) => {
    try {
      const url = req.url || '';
      const parsed = parseUrl(url, true);
      const pathname = parsed.pathname || '';

      // Expected route: /collab/:projectId
      const match = pathname.match(/^\/collab\/([a-zA-Z0-9_-]+)$/);
      if (!match) {
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
        return;
      }

      const projectId = match[1];

      // Extract token from cookie or query param
      const cookies = parseCookie(req.headers.cookie || '');
      let token = cookies[COOKIE_NAME];
      if (!token && parsed.query.token && typeof parsed.query.token === 'string') {
        token = parsed.query.token;
      }

      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized: No authentication token\r\n\r\n');
        socket.destroy();
        return;
      }

      let payload: any;
      try {
        payload = verifyToken(token);
      } catch (err) {
        socket.write('HTTP/1.1 401 Unauthorized: Invalid token\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check DB permissions for this project
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        socket.write('HTTP/1.1 400 Bad Request: Invalid project ID\r\n\r\n');
        socket.destroy();
        return;
      }

      const project = await Project.findById(projectId);
      if (!project) {
        socket.write('HTTP/1.1 404 Not Found: Project does not exist\r\n\r\n');
        socket.destroy();
        return;
      }

      let role: ProjectRole | null = null;
      if (project.owner.toString() === payload.userId) {
        role = 'OWNER';
      } else {
        const collab = project.collaborators.find((c) => c.user.toString() === payload.userId);
        if (collab) {
          role = collab.role;
        }
      }

      if (!role) {
        socket.write('HTTP/1.1 403 Forbidden: No project access\r\n\r\n');
        socket.destroy();
        return;
      }

      // Fetch user details for presence avatar
      const userDoc = await User.findById(payload.userId);
      const avatarColor = userDoc?.avatarColor || '#7657FF';

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req, {
          projectId,
          userId: payload.userId,
          userName: payload.name,
          userEmail: payload.email,
          avatarColor,
          role,
        });
      });
    } catch (err) {
      console.error('[WebSocket Upgrade Error]', err);
      socket.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage, clientMeta: any) => {
    const { projectId, userId, userName, userEmail, avatarColor, role } = clientMeta;
    console.log(`[WebSocket] Client connected to project ${projectId}: ${userEmail} (${role})`);

    const client: ClientConnection = {
      ws,
      userId,
      userName,
      userEmail,
      avatarColor,
      role,
    };

    const room = await roomManager.getOrCreateRoom(projectId);
    room.addClient(client);

    // Heartbeat setup
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    ws.on('message', (data: Buffer) => {
      const uint8 = new Uint8Array(data);
      room.handleMessage(client, uint8);
    });

    ws.on('close', () => {
      console.log(`[WebSocket] Client disconnected from project ${projectId}: ${userEmail}`);
      room.removeClient(client);
      roomManager.removeRoomIfEmpty(projectId);
    });

    ws.on('error', (err) => {
      console.error(`[WebSocket] Error for client ${userEmail} on ${projectId}:`, err);
    });

    // Send initial role confirmation
    const metaPayload = JSON.stringify({
      type: 'meta',
      role,
      userId,
      projectId,
    });
    ws.send(metaPayload);
  });

  return wss;
}
