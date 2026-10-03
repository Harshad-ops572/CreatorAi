import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectWorkspacePage } from './pages/ProjectWorkspacePage';
import { WorkflowPage } from './pages/WorkflowPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Project } from './types';

function MainApp() {
  const { user, isLoading } = useAuth();
  const { activeProject, setActiveProject, setActiveStep } = useProject();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If user is logged in and still on landing/login, switch to dashboard
  React.useEffect(() => {
    if (user && (currentPage === 'landing' || currentPage === 'login')) {
      setCurrentPage('dashboard');
    }
  }, [user]);

  const handleOpenProject = (project: Project) => {
    setActiveProject(project);
    setCurrentPage('project');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading CreatorAi...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated and is on landing page
  if (!user && currentPage === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentPage('dashboard')}
        onOpenLogin={() => setCurrentPage('login')}
      />
    );
  }

  // If user is not authenticated and wants to login/register
  if (!user && currentPage === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentPage('dashboard')}
        onBackToLanding={() => setCurrentPage('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onNewProject={() => {
          setCurrentPage('dashboard');
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col">
        {currentPage === 'dashboard' && (
          <DashboardPage
            onOpenProject={handleOpenProject}
            onOpenWorkflow={() => setCurrentPage('workflow')}
          />
        )}

        {currentPage === 'project' && (
          <ProjectWorkspacePage onBackToDashboard={handleBackToDashboard} />
        )}

        {currentPage === 'workflow' && <WorkflowPage />}

        {currentPage === 'analytics' && <AnalyticsPage />}

        {currentPage === 'settings' && <SettingsPage />}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProjectProvider>
          <MainApp />
        </ProjectProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
