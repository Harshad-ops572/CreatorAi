import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Sparkles,
  Folder,
  ArrowRight,
  Trash2,
  Video,
  Clock,
  CheckCircle2,
  Sliders,
  Layers,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../api/client';
import { Project } from '../types';

interface DashboardPageProps {
  onOpenProject: (project: Project) => void;
  onOpenWorkflow: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenProject, onOpenWorkflow }) => {
  const { setActiveProject, setActiveStep } = useProject();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // New Project Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPlatform, setNewPlatform] = useState<'reels' | 'shorts' | 'tiktok' | 'youtube' | 'linkedin'>('reels');
  const [newAspectRatio, setNewAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [isCreating, setIsCreating] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (e) {
      error('Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const created = await api.createProject({
        title: newTitle.trim(),
        description: newDescription.trim(),
        targetPlatform: newPlatform,
        aspectRatio: newAspectRatio,
      });

      setProjects((prev) => [created, ...prev]);
      setNewProjectModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      success(`Project "${created.title}" created successfully!`);

      // Automatically open the new project
      setActiveProject(created);
      setActiveStep('product');
      onOpenProject(created);
    } catch (err: any) {
      error(err.message || 'Failed to create project.');
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await api.deleteProject(projectToDelete._id);
      setProjects((prev) => prev.filter((p) => p._id !== projectToDelete._id));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      success('Project and all associated media files permanently removed.');
    } catch (err: any) {
      error(err.message || 'Failed to delete project.');
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Creator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your context-aware creator projects, scripts, footage, and video drafts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setNewProjectModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Project
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Projects
          </span>
          <div className="text-2xl font-black text-white">{projects.length}</div>
          <span className="text-[10px] text-brand-400 font-medium">Context-aware active</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Avg 3s Retention
          </span>
          <div className="text-2xl font-black text-emerald-400">84.2%</div>
          <span className="text-[10px] text-slate-400">Across short-form reels</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Export Engine
          </span>
          <div className="text-2xl font-black text-cyan-400">FFmpeg</div>
          <span className="text-[10px] text-slate-400">9:16 Vertical HD</span>
        </Card>
        <Card className="p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            AI Operations
          </span>
          <div className="text-2xl font-black text-purple-400">Active</div>
          <span className="text-[10px] text-slate-400">Gemini Flash Multimodal</span>
        </Card>
      </div>

      {/* Projects Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            leftIcon={<Search className="w-4 h-4" />}
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto font-medium">
          <span>{filteredProjects.length} project(s)</span>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton height={220} />
          <Skeleton height={220} />
          <Skeleton height={220} />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-16 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
            <Folder className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No projects found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by creating your first context-aware creator project.
          </p>
          <Button
            onClick={() => setNewProjectModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card
              key={p._id}
              hoverEffect
              className="p-5 flex flex-col justify-between group border border-dark-border hover:border-brand-500/40 cursor-pointer"
              onClick={() => {
                setActiveProject(p);
                setActiveStep('overview');
                onOpenProject(p);
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      {p.targetPlatform.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400 bg-dark-bg px-2 py-0.5 rounded border border-dark-border">
                      {p.aspectRatio}
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase">
                    Draft v{p.currentDraft || 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description || 'Context-aware video creation workflow.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-dark-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(p.updatedAt || p.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectToDelete(p);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-dark-surface transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-semibold text-brand-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform ml-1">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        title="Create New CreatorAi Project"
        description="Initialize a context-aware workspace for your next video campaign."
      >
        <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
          <Input
            label="Project Title"
            placeholder="e.g. UltraBlend Blender Viral Hook Video"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Project Goal / Description
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="e.g. 30-second TikTok & Reel emphasizing durability and quick cleaning..."
              className="w-full bg-dark-bg/80 border border-dark-border rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Primary Platform
              </label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as any)}
                className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="reels">Instagram Reels</option>
                <option value="shorts">YouTube Shorts</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube (Widescreen)</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Aspect Ratio
              </label>
              <select
                value={newAspectRatio}
                onChange={(e) => setNewAspectRatio(e.target.value as any)}
                className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="9:16">9:16 (Vertical)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="1:1">1:1 (Square)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Project?"
        description={`Are you sure you want to delete "${projectToDelete?.title}"? All uploaded product media, scripts, footage analysis, and rendered videos will be permanently purged from disk.`}
      >
        <div className="pt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteProject}>
            Permanently Purge Everything
          </Button>
        </div>
      </Modal>
    </div>
  );
};
