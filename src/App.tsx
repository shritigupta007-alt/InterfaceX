import { useEffect, useState } from 'react';
import { Landing } from './landing/Landing';
import { Dashboard } from './landing/Dashboard';
import { Editor } from './editor/Editor';
import { setActiveProjectId, upsertProject } from '@/engine/storage';
import type { Project } from '@/engine/types';

type View = { name: 'landing' } | { name: 'dashboard' } | { name: 'editor'; project?: Project };

function App() {
  const [view, setView] = useState<View>({ name: 'landing' });

  // When opening a project from the dashboard, persist it as active.
  useEffect(() => {
    if (view.name === 'editor' && view.project) {
      upsertProject(view.project);
      setActiveProjectId(view.project.id);
    }
  }, [view]);

  if (view.name === 'landing') {
    return <Landing onOpenPlayground={() => setView({ name: 'dashboard' })} />;
  }
  if (view.name === 'dashboard') {
    return (
      <Dashboard
        onOpen={(p) => setView({ name: 'editor', project: p })}
        onBack={() => setView({ name: 'landing' })}
      />
    );
  }
  return <Editor onExit={() => setView({ name: 'dashboard' })} />;
}

export default App;
