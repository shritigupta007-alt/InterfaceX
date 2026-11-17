import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupWebSocketServer } from './collaboration/wsServer.js';

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security and middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin === CLIENT_URL || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'interfacex-cookie-secret'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'InterfaceX Backend',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invitations', collaborationRoutes);

// Centralized error handling
app.use(errorHandler);

// Setup WebSocket server for real-time collaboration
setupWebSocketServer(server);

// Boot function
async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` InterfaceX Server running on port ${PORT}`);
      console.log(` Client URL: ${CLIENT_URL}`);
      console.log(` WebSocket Collaboration: ws://localhost:${PORT}/collab/:projectId`);
      console.log(`===============================================`);
    });
  } catch (err: any) {
    console.error(`Failed to start server: ${err.message}`);
    // Start HTTP server anyway with a warning so APIs can return proper error status
    server.listen(PORT, () => {
      console.warn(`[InterfaceX Server] Started on port ${PORT} WITHOUT database connection. Ensure MongoDB is running.`);
    });
  }
}

startServer();

export { app, server };
