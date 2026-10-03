import React from 'react';
import {
  Home,
  FolderKanban,
  Lightbulb,
  Video,
  FileVideo,
  BarChart3,
  Settings,
  Package,
  FileText,
  Share2,
  ChevronLeft,
} from 'lucide-react';
import { useProject, PipelineStep } from '../../context/ProjectContext';

interface SidebarProps {
  mode?: 'dashboard' | 'project';
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  onBackToDashboard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mode = 'dashboard',
  activeNav = 'projects',
  onNavigate,
  onBackToDashboard,
}) => {
  const { activeProject, activeStep, setActiveStep } = useProject();

  const dashboardItems = [
    { id: 'dashboard', label: 'Home & Projects', icon: <Home className="w-4 h-4" /> },
    { id: 'workflow', label: 'Kanban Workflow', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'analytics', label: 'Creator Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings & API Keys', icon: <Settings className="w-4 h-4" /> },
  ];

  const projectPipelineSteps: Array<{ id: PipelineStep; label: string; icon: React.ReactNode; stepNum: string }> = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" />, stepNum: '0' },
    { id: 'product', label: '1. Product Intelligence', icon: <Package className="w-4 h-4" />, stepNum: '1' },
    { id: 'ideas', label: '2. Content Ideation', icon: <Lightbulb className="w-4 h-4" />, stepNum: '2' },
    { id: 'script', label: '3. Script & Shot Plan', icon: <FileText className="w-4 h-4" />, stepNum: '3' },
    { id: 'footage', label: '4. Footage & Matching', icon: <FileVideo className="w-4 h-4" />, stepNum: '4' },
    { id: 'editor', label: '5. AI Video Editor', icon: <Video className="w-4 h-4" />, stepNum: '5' },
    { id: 'export', label: '6. Export & Adapt', icon: <Share2 className="w-4 h-4" />, stepNum: '6' },
  ];

  if (mode === 'project') {
    return (
      <aside className="w-64 shrink-0 glass-panel border-r border-dark-border/80 bg-dark-bg/95 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
        {/* Back to Projects */}
        <div className="p-3 border-b border-dark-border/60">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-dark-surface transition-colors w-full"
          >
            <ChevronLeft className="w-4 h-4 text-brand-400" />
            <span>All Projects</span>
          </button>
        </div>

        {/* Project Header Info */}
        <div className="p-4 border-b border-dark-border/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
            Active Project
          </div>
          <h2 className="text-sm font-bold text-white truncate mt-0.5" title={activeProject?.title}>
            {activeProject?.title || 'Untitled Project'}
          </h2>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-surface text-slate-300 font-mono">
              {activeProject?.aspectRatio || '9:16'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 font-semibold uppercase">
              Draft v{activeProject?.currentDraft || 1}
            </span>
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Pipeline Workflow
          </div>
          {projectPipelineSteps.map((step) => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500 text-white font-semibold shadow-glow-sm border border-brand-400/30'
                    : 'text-slate-400 hover:text-white hover:bg-dark-surface/60'
                }`}
              >
                <span className={`w-4 h-4 shrink-0 flex items-center justify-center ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {step.icon}
                </span>
                <span className="truncate text-left">{step.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-56 shrink-0 glass-panel border-r border-dark-border/80 bg-dark-bg/95 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="flex-1 overflow-y-auto p-3 space-y-1 mt-2">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {dashboardItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate && onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white font-semibold shadow-glow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-dark-surface/60'
              }`}
            >
              <span className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
