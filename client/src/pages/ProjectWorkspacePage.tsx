import React from 'react';
import { useProject } from '../context/ProjectContext';
import { Sidebar } from '../components/layout/Sidebar';
import { OverviewTab } from '../components/project/OverviewTab';
import { ProductTab } from '../components/project/ProductTab';
import { IdeasTab } from '../components/project/IdeasTab';
import { ScriptTab } from '../components/project/ScriptTab';
import { FootageTab } from '../components/project/FootageTab';
import { EditorTab } from '../components/project/EditorTab';
import { ExportTab } from '../components/project/ExportTab';
import { ChevronLeft } from 'lucide-react';

interface ProjectWorkspacePageProps {
  onBackToDashboard: () => void;
}

export const ProjectWorkspacePage: React.FC<ProjectWorkspacePageProps> = ({ onBackToDashboard }) => {
  const { activeProject, activeStep, setActiveStep } = useProject();

  const stepsList = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'product' as const, label: '1. Product' },
    { id: 'ideas' as const, label: '2. Ideas' },
    { id: 'script' as const, label: '3. Script' },
    { id: 'footage' as const, label: '4. Footage' },
    { id: 'editor' as const, label: '5. Editor' },
    { id: 'export' as const, label: '6. Export' },
  ];

  return (
    <div className="flex w-full min-h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar mode="project" onBackToDashboard={onBackToDashboard} />
      </div>

      {/* Main Stage Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
        {/* Mobile Stage Selector Bar */}
        <div className="md:hidden flex items-center justify-between gap-2 mb-4 pb-3 border-b border-dark-border">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Projects</span>
          </button>

          <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
            {stepsList.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap ${
                  activeStep === s.id
                    ? 'bg-brand-500 text-white'
                    : 'bg-dark-surface text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Pipeline Component */}
        {activeStep === 'overview' && <OverviewTab />}
        {activeStep === 'product' && <ProductTab />}
        {activeStep === 'ideas' && <IdeasTab />}
        {activeStep === 'script' && <ScriptTab />}
        {activeStep === 'footage' && <FootageTab />}
        {activeStep === 'editor' && <EditorTab />}
        {activeStep === 'export' && <ExportTab />}
      </main>
    </div>
  );
};
