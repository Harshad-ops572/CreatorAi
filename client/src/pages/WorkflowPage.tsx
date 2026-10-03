import React, { useState, useEffect } from 'react';
import {
  Kanban,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle,
  ArrowRight,
  MoveRight,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { api } from '../api/client';
import { WorkflowTask } from '../types';

export const WorkflowPage: React.FC = () => {
  const { activeProject } = useProject();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<WorkflowTask[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskStage, setTaskStage] = useState<'idea' | 'scripting' | 'recording' | 'editing' | 'ready' | 'published'>('idea');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  const stages: Array<{ id: WorkflowTask['stage']; label: string; color: string }> = [
    { id: 'idea', label: '1. Idea & Hook', color: 'border-amber-500/40 text-amber-400' },
    { id: 'scripting', label: '2. Scripting', color: 'border-brand-500/40 text-brand-400' },
    { id: 'recording', label: '3. Recording', color: 'border-cyan-500/40 text-cyan-400' },
    { id: 'editing', label: '4. Editing & AI', color: 'border-purple-500/40 text-purple-400' },
    { id: 'ready', label: '5. Ready to Export', color: 'border-pink-500/40 text-pink-400' },
    { id: 'published', label: '6. Published', color: 'border-emerald-500/40 text-emerald-400' },
  ];

  const loadTasks = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const data = await api.getWorkflowTasks(activeProject._id);
      setTasks(data);
    } catch (e) {
      error('Failed to load workflow tasks.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeProject?._id]);

  // Optimistic update for stage movement with rollback on failure
  const handleMoveStage = async (taskId: string, nextStage: WorkflowTask['stage']) => {
    const originalTasks = [...tasks];

    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, stage: nextStage } : t))
    );

    try {
      await api.updateWorkflowTask(taskId, { stage: nextStage });
      success(`Task moved to ${nextStage.toUpperCase()}`);
    } catch (err) {
      // 2. Roll back on failure as mandated by user rule
      setTasks(originalTasks);
      error('Failed to update stage. Reverted to previous state.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject?._id || !taskTitle.trim()) return;

    try {
      const created = await api.createWorkflowTask(activeProject._id, {
        title: taskTitle.trim(),
        stage: taskStage,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
      });

      setTasks((prev) => [...prev, created]);
      setCreateModalOpen(false);
      setTaskTitle('');
      setTaskDueDate('');
      success('Workflow task created!');
    } catch (err: any) {
      error(err.message || 'Could not create task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
    try {
      await api.deleteWorkflowTask(taskId);
      success('Task deleted.');
    } catch (e) {
      setTasks(originalTasks);
      error('Failed to delete task.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              <Kanban className="w-3.5 h-3.5" />
              Creator Workflow
            </Badge>
            <span className="text-xs text-slate-400 font-mono">
              Project: {activeProject?.title || 'Default'}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Content Pipeline Kanban</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track video progress from initial ideation to recording, editing, and publishing with optimistic drag-and-drop.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-dark-surface p-1 rounded-xl border border-dark-border">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {stages.map((stage, sIdx) => {
            const stageTasks = tasks.filter((t) => t.stage === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-dark-card/60 rounded-2xl p-3 border border-dark-border flex flex-col min-w-[220px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-dark-border">
                  <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                  <span className="w-5 h-5 rounded-full bg-dark-surface text-slate-300 flex items-center justify-center text-[10px] font-bold">
                    {stageTasks.length}
                  </span>
                </div>

                {/* Tasks Stack */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {stageTasks.map((task) => (
                    <div
                      key={task._id}
                      className="p-3 rounded-xl bg-dark-bg/80 border border-dark-border hover:border-slate-600 transition-all space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white leading-snug">
                          {task.title}
                        </h4>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                            task.priority === 'high'
                              ? 'bg-red-500/15 text-red-400'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>

                        {sIdx < stages.length - 1 && (
                          <button
                            onClick={() => handleMoveStage(task._id, stages[sIdx + 1].id)}
                            className="flex items-center gap-0.5 text-brand-400 hover:text-brand-300 font-semibold"
                            title="Move to next stage"
                          >
                            <span>Next</span>
                            <MoveRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageTasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-dark-border/60 rounded-xl flex items-center justify-center text-[11px] text-slate-600">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Calendar View */
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-dark-border pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-400" />
              <span>Publishing Schedule & Deadlines</span>
            </h3>
            <span className="text-xs text-slate-400">Next 7 Days</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="bg-dark-bg/60 p-3 rounded-xl border border-dark-border space-y-2 min-h-[140px]">
                <div className="text-xs font-bold text-slate-400 pb-1 border-b border-dark-border/60 flex items-center justify-between">
                  <span>{day}</span>
                  <span className="text-[10px] text-brand-400">Day {idx + 1}</span>
                </div>
                {idx === 1 && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-medium">
                    Record Hook Video
                  </div>
                )}
                {idx === 3 && (
                  <div className="p-2 rounded bg-brand-500/10 border border-brand-500/30 text-[10px] text-brand-300 font-medium">
                    AI Auto Draft Edit
                  </div>
                )}
                {idx === 4 && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-medium">
                    Publish Reel 7:00 PM
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Workflow Task"
        description="Create a production milestone for your video workflow."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          <Input
            label="Task Title"
            placeholder="e.g. Record vacuum cleaner acoustic stress test"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pipeline Stage
              </label>
              <select
                value={taskStage}
                onChange={(e) => setTaskStage(e.target.value as any)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Add Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
