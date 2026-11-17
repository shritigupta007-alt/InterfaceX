# InterfaceX — Full-Stack Visual Frontend Platform

InterfaceX is a full-stack visual development playground and component studio. It empowers engineers and designers to build responsive interfaces visually, inspect clean generated code, collaborate in real-time using CRDTs (Conflict-free Replicated Data Types), and export production-ready Vite + React + Tailwind applications.

---

## Architecture Overview

```
InterfaceX-refined/
├── backend/                       # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/                # MongoDB & Mongoose connection
│   │   ├── models/                # User, Project, Invitation schemas
│   │   ├── controllers/           # Auth, Project, Collaboration logic
│   │   ├── routes/                # REST endpoints (/api/auth, /api/projects, /api/invitations)
│   │   ├── middleware/            # JWT authentication & project RBAC authorization
│   │   ├── validators/            # Zod input schemas
│   │   ├── collaboration/         # Yjs CRDT room manager & WebSocket server
│   │   ├── utils/                 # JWT sign/verify & cookie utilities
│   │   ├── test/                  # Automated integration test suite
│   │   └── server.ts              # HTTP + WebSocket server bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── InterfaceX-main/               # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── context/               # AuthContext & session state
│   │   ├── services/              # REST API client & JSZip code exporter
│   │   ├── components/            # Auth modal, Invite/Collaborate dialogs
│   │   ├── editor/                # Canvas, Toolbar, Properties, Analyzer, useCollaboration
│   │   ├── engine/                # AST tree utils, codegen, storage, styles
│   │   ├── landing/               # Homepage & Project Management Dashboard
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts             # Vite proxy (/api -> 5000, /collab -> ws:5000)
├── package.json                   # Monorepo root scripts
└── README.md
```

---

## Key Features

1. **User Authentication & Session Security:**
   - Registration and login with bcrypt password hashing (10 salt rounds).
   - HTTP-only, SameSite secure JWT cookies (`ix_token`).
   - Protected API endpoints with Zod input validation.
   - Current user profile endpoint (`GET /api/auth/me`).

2. **Permanent Project Storage:**
   - Persistent MongoDB storage preserving exact component trees, styles, and properties.
   - Debounced automatic saving (1.5s) with live status indicators (`Saved`, `Saving...`, `Unsaved`, `Local Only`).
   - Resilient local storage fallback so offline work is never lost.

3. **Personalized Project Dashboard:**
   - Real-time MongoDB project management (Recent, All Projects, Shared With Me).
   - Search and filtering.
   - Project actions: Create, Open, Rename, Duplicate, Delete, and Share.
   - Collaborator counts and element counters.

4. **Real-Time Collaboration (CRDTs + WebSockets):**
   - Built on **Yjs** CRDTs over WebSockets (`ws://localhost:5000/collab/:projectId`).
   - Concurrent conflict-free editing of the component tree.
   - Live user presence and collaborator avatars in the editor toolbar.
   - Role-Based Access Control:
     - `OWNER`: Full control, manage collaborators, save, duplicate, delete.
     - `EDITOR`: Real-time editing and saving.
     - `VIEWER`: Read-only canvas preview with mutations blocked on server and client.

5. **Code Export & Runnable ZIP Generation:**
   - Client-side ZIP generation via JSZip.
   - Generates complete, runnable projects:
     - `package.json` with React 18, Vite, and Tailwind CSS.
     - `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`.
     - `src/App.tsx`, `src/main.tsx`, and `src/index.css`.
     - Ready-to-run via `npm install && npm run dev`.
   - Standalone single-file HTML export.
   - Component CSS & HTML downloads.

---

## Quick Start & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher (v20+ recommended)
* **MongoDB**: A running MongoDB instance locally (`mongodb://127.0.0.1:27017/interfacex`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

### 1. Configure Backend Environment
In `backend/.env` (or copy from `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/interfacex
JWT_SECRET=your-secure-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your-session-cookie-secret
```

> **Tip for MongoDB:**
> * If running locally via Docker: `docker run -d -p 27017:27017 --name mongo mongo:latest`
> * Or use your MongoDB Atlas connection string: `MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/interfacex`

### 2. Run the Development Servers

From the root directory:

```bash
# Terminal 1: Start Backend API & WebSocket Collaboration Server
npm run dev:backend

# Terminal 2: Start Frontend Vite Dev Server
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Body: `{ name, email, password }`
* `POST /api/auth/login` — Body: `{ email, password }`
* `POST /api/auth/logout` — Clears HTTP-only session cookie
* `GET /api/auth/me` — Returns current authenticated user

### Projects (`/api/projects`)
* `GET /api/projects?filter=all|recent|shared&search=` — Lists user's accessible projects
* `POST /api/projects` — Creates a project; caller assigned `OWNER` role
* `GET /api/projects/:id` — Fetches project by ID with populated owner & collaborators
* `PUT /api/projects/:id` — Updates project name/tree (requires `OWNER` or `EDITOR`)
* `DELETE /api/projects/:id` — Deletes project (requires `OWNER`)
* `POST /api/projects/:id/duplicate` — Duplicates project under caller's ownership

### Collaboration & Invitations
* `GET /api/projects/:id/collaborators` — Lists collaborators and pending invites
* `POST /api/projects/:id/invitations` — Invites user by email with `EDITOR` or `VIEWER` role
* `DELETE /api/projects/:id/collaborators/:userId` — Removes collaborator
* `GET /api/invitations/pending` — Lists pending invitations for logged-in user
* `POST /api/invitations/:token/accept` — Accepts invite token and grants access

### Real-Time WebSocket Endpoint
* `ws://localhost:5000/collab/:projectId` — Authenticated Yjs CRDT room stream

---

## Verification & Testing

Run the automated integration test suite:

```bash
npm test
```

Run TypeScript typecheck across frontend and backend:

```bash
npm run typecheck
```

Build both production bundles:

```bash
npm run build
```
