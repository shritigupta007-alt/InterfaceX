import { useEffect, useState } from 'react';
import { Landing } from './landing/Landing';
import { Dashboard } from './landing/Dashboard';
import { Editor } from './editor/Editor';
import { setActiveProjectId, upsertProject } from '@/engine/storage';
import type { Project } from '@/engine/types';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { api } from '@/services/api';

type View =
  | { name: 'landing' }
  | { name: 'dashboard' }
  | { name: 'editor'; project?: Project; role?: 'OWNER' | 'EDITOR' | 'VIEWER' };

function AppContent() {
  const [view, setView] = useState<View>({ name: 'landing' });
  const { user, loading, openAuthModal } = useAuth();

  // Handle invitation link if opened via ?invite=<token>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');

    if (inviteToken) {
      if (!user && !loading) {
        openAuthModal('login');
      } else if (user) {
        api.invitations
          .accept(inviteToken)
          .then(async (res) => {
            if (res.success && res.data?.projectId) {
              const projRes = await api.projects.get(res.data.projectId);
              if (projRes.success && projRes.data?.project) {
                const p = projRes.data.project;
                setView({
                  name: 'editor',
                  project: {
                    id: p.id,
                    name: p.name,
                    tree: p.tree,
                    createdAt: new Date(p.createdAt).getTime(),
                    updatedAt: new Date(p.updatedAt).getTime(),
                  },
                  role: p.role,
                });
                window.history.replaceState({}, '', window.location.pathname);
              }
            }
          })
          .catch((err) => {
            alert(`Invitation error: ${err.message}`);
          });
      }
    }
  }, [user, loading, openAuthModal]);

  // When opening a project, persist it locally as active
  useEffect(() => {
    if (view.name === 'editor' && view.project) {
      upsertProject(view.project);
      setActiveProjectId(view.project.id);
    }
  }, [view]);

  return (
    <>
      <AuthModal />
      {view.name === 'landing' && (
        <Landing onOpenPlayground={() => setView({ name: 'dashboard' })} />
      )}
      {view.name === 'dashboard' && (
        <Dashboard
          onOpen={(p, role = 'OWNER') => setView({ name: 'editor', project: p, role })}
          onBack={() => setView({ name: 'landing' })}
        />
      )}
      {view.name === 'editor' && (
        <Editor
          project={view.project}
          initialRole={view.role}
          onExit={() => setView({ name: 'dashboard' })}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
