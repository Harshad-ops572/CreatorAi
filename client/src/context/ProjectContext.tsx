import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { api } from '../api/client';
import { useToast } from './ToastContext';

export type PipelineStep = 'overview' | 'product' | 'ideas' | 'script' | 'footage' | 'editor' | 'export';

interface ProjectContextType {
  activeProject: Project | null;
  setActiveProject: (p: Project | null) => void;
  activeStep: PipelineStep;
  setActiveStep: (step: PipelineStep) => void;
  refreshProject: () => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeStep, setActiveStep] = useState<PipelineStep>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { error } = useToast();

  const refreshProject = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const data = await api.getProject(activeProject._id);
      setActiveProject(data);
    } catch (e: any) {
      error('Could not refresh project details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        activeStep,
        setActiveStep,
        refreshProject,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
