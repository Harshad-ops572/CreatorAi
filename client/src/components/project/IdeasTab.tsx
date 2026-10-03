import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, Check, RefreshCw, Trash2, ArrowRight, Zap, Target, Clock } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';
import { Idea } from '../../types';

export const IdeasTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const { success, error } = useToast();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string>('Reel');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const formats = [
    'Reel',
    'Short',
    'YouTube video',
    'Ad',
    'Review',
    'Tutorial',
    'Unboxing',
    'Educational',
    'UGC',
  ];

  const loadIdeas = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const data = await api.getIdeas(activeProject._id);
      setIdeas(data);
    } catch (e) {
      error('Failed to load ideas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, [activeProject?._id]);

  const handleGenerate = async () => {
    if (!activeProject?._id) return;
    setIsGenerating(true);
    try {
      const newIdeas = await api.generateIdeas(activeProject._id, selectedFormat);
      setIdeas((prev) => [...newIdeas, ...prev]);
      success(`Generated ${newIdeas.length} viral ${selectedFormat} ideas!`);
    } catch (err: any) {
      error(err.message || 'Could not generate ideas. Check if product profile is uploaded.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = async (ideaId: string) => {
    try {
      await api.selectIdea(ideaId);
      setIdeas((prev) =>
        prev.map((i) => ({
          ...i,
          selected: i._id === ideaId,
        }))
      );
      success('Idea selected! You can now generate the timed script.');
    } catch (e) {
      error('Failed to select idea.');
    }
  };

  const handleDelete = async (ideaId: string) => {
    try {
      await api.deleteIdea(ideaId);
      setIdeas((prev) => prev.filter((i) => i._id !== ideaId));
      success('Idea removed.');
    } catch (e) {
      error('Failed to delete idea.');
    }
  };

  const selectedIdea = ideas.find((i) => i.selected);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Pipeline Stage 2
            </span>
            <Badge variant="brand" size="sm">
              <Sparkles className="w-3 h-3" />
              Gemini Ideation & Viral Hooks
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Content Ideation & Hooks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose a format and generate high-converting, product-tailored hooks designed to capture attention in the first 3 seconds.
          </p>
        </div>

        {selectedIdea && (
          <Button
            onClick={() => setActiveStep('script')}
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next: Timed Script & Shot Plan
          </Button>
        )}
      </div>

      {/* Format Selector Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Video Format Target:
          </label>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGenerate}
              variant="primary"
              size="md"
              isLoading={isGenerating}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate 3+ Ideas with Gemini
            </Button>
          </div>
        </div>

        {/* Formats Grid */}
        <div className="flex flex-wrap gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedFormat === fmt
                  ? 'bg-brand-500 text-white shadow-glow-sm border border-brand-400/40'
                  : 'bg-dark-surface border border-dark-border text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </Card>

      {/* Ideas List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton height={140} />
          <Skeleton height={140} />
        </div>
      ) : ideas.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
            <Lightbulb className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No ideas generated yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Generate 3+ Ideas with Gemini&quot; above to create viral hooks based on your product profile.
          </p>
          <Button
            onClick={handleGenerate}
            variant="primary"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>Generated Concepts ({ideas.length})</span>
            <span>Select one to generate timed script</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {ideas.map((idea) => {
              const isSelected = idea.selected;
              return (
                <Card
                  key={idea._id}
                  className={`transition-all ${
                    isSelected ? 'border-brand-500 bg-brand-950/20 shadow-glow-sm' : 'hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isSelected ? 'brand' : 'neutral'} size="sm">
                          {idea.format}
                        </Badge>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>~{idea.targetDurationSeconds}s</span>
                        </span>
                        {isSelected && (
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3" />
                            <span>Selected for Script</span>
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">
                        {idea.title}
                      </h3>

                      {/* The 3-second hook */}
                      <div className="p-3 rounded-xl bg-dark-bg/80 border border-brand-500/20 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>3-Second Verbal & Visual Hook:</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-100 italic">
                          &ldquo;{idea.hook}&rdquo;
                        </p>
                      </div>

                      {/* Angle & Why it Works */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold uppercase text-slate-500">Angle</span>
                          <p className="text-slate-300 font-medium">{idea.angle}</p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-semibold uppercase text-slate-500">CTA</span>
                          <p className="text-slate-300 font-medium">{idea.callToAction}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400">
                        <span className="font-semibold text-slate-300">Why it works: </span>
                        {idea.whyItWorks}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0">
                      <Button
                        onClick={() => handleSelect(idea._id)}
                        variant={isSelected ? 'secondary' : 'primary'}
                        size="sm"
                        leftIcon={isSelected ? <Check className="w-3.5 h-3.5" /> : undefined}
                      >
                        {isSelected ? 'Selected' : 'Use This Idea'}
                      </Button>
                      <button
                        onClick={() => handleDelete(idea._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-dark-surface transition-colors"
                        title="Delete idea"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
