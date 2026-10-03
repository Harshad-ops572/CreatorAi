import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Camera,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  History,
  Tag,
  Volume2,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';
import { Script, ScriptSection } from '../../types';

export const ScriptTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const { success, error } = useToast();

  const [script, setScript] = useState<Script | null>(null);
  const [versions, setVersions] = useState<Script[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadScriptData = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const [current, allVersions] = await Promise.all([
        api.getCurrentScript(activeProject._id).catch(() => null),
        api.getScriptVersions(activeProject._id).catch(() => []),
      ]);
      setScript(current);
      setVersions(allVersions || []);
    } catch (e) {
      error('Failed to load script data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadScriptData();
  }, [activeProject?._id]);

  const handleGenerateScript = async () => {
    if (!activeProject?._id) return;
    setIsGenerating(true);
    try {
      const newScript = await api.generateScript(activeProject._id, {
        format: activeProject.targetPlatform === 'youtube' ? 'YouTube' : 'Reel',
      });
      setScript(newScript);
      setVersions((prev) => [newScript, ...prev]);
      success(`Script Version ${newScript.version} generated with timed shot plan!`);
    } catch (err: any) {
      error(err.message || 'Could not generate script.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScript = async () => {
    if (!script?._id) return;
    setIsSaving(true);
    try {
      const updated = await api.updateScript(script._id, {
        title: script.title,
        sections: script.sections,
        tone: script.tone,
      });
      setScript(updated);
      success('Script changes saved.');
    } catch (e) {
      error('Failed to save script.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSection = (index: number, key: keyof ScriptSection, value: any) => {
    if (!script) return;
    const updated = [...script.sections];
    updated[index] = { ...updated[index], [key]: value };
    setScript({ ...script, sections: updated });
  };

  const updateShotPlan = (index: number, key: string, value: any) => {
    if (!script) return;
    const updated = [...script.sections];
    updated[index] = {
      ...updated[index],
      shotPlan: { ...updated[index].shotPlan, [key]: value },
    };
    setScript({ ...script, sections: updated });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Pipeline Stage 3
            </span>
            <Badge variant="brand" size="sm">
              <Sparkles className="w-3 h-3" />
              AI Timed Script & Shot Plan
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Timed Script & Visual Shot Plan</h1>
          <p className="text-xs text-slate-400 mt-1">
            Every section pairs spoken voiceover and on-screen text with an exact visual shot requirement for automated footage matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {script && (
            <>
              <Button
                onClick={handleSaveScript}
                variant="secondary"
                size="sm"
                isLoading={isSaving}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Save Script
              </Button>
              <Button
                onClick={() => setActiveStep('footage')}
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Footage & Matching
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Script Overview Bar */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-400/30 flex items-center justify-center text-brand-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                {script?.title || 'No Script Generated Yet'}
              </h2>
              {script && (
                <Badge variant="brand" size="sm">
                  v{script.version}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                <span>
                  Total Duration: {script?.totalDurationSeconds || 0} seconds
                </span>
              </span>
              <span>•</span>
              <span>Tone: {script?.tone || 'High-energy'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
              <History className="w-3.5 h-3.5" />
              <span>{versions.length} versions</span>
            </div>
          )}
          <Button
            onClick={handleGenerateScript}
            variant="primary"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {script ? 'Regenerate New Version' : 'Generate Timed Script'}
          </Button>
        </div>
      </Card>

      {/* Sections List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton height={180} />
          <Skeleton height={180} />
          <Skeleton height={180} />
        </div>
      ) : !script ? (
        <Card className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No script generated</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Generate Timed Script&quot; to build a structured 5-section timed production script with camera shot plans.
          </p>
          <Button
            onClick={handleGenerateScript}
            variant="primary"
            size="md"
            isLoading={isGenerating}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Script Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
            <span>Timed Storyboard Sections ({script.sections.length})</span>
            <span>All edits sync to the video editor</span>
          </div>

          <div className="space-y-4">
            {script.sections.map((section, idx) => {
              const typeColors: Record<string, string> = {
                hook: 'border-red-500/40 bg-red-500/5',
                problem: 'border-amber-500/40 bg-amber-500/5',
                product: 'border-brand-500/40 bg-brand-500/5',
                demo: 'border-cyan-500/40 bg-cyan-500/5',
                cta: 'border-emerald-500/40 bg-emerald-500/5',
              };

              return (
                <Card
                  key={section.id || idx}
                  className={`border ${typeColors[section.type] || 'border-dark-border'} space-y-4`}
                >
                  {/* Top Bar of Section */}
                  <div className="flex items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-dark-surface border border-dark-border flex items-center justify-center text-xs font-bold text-slate-300">
                        {section.order}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        {section.title}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {section.type.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-dark-bg/60 px-2.5 py-1 rounded-lg border border-dark-border">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <input
                          type="number"
                          value={section.durationSeconds}
                          onChange={(e) =>
                            updateSection(idx, 'durationSeconds', parseInt(e.target.value, 10) || 1)
                          }
                          className="w-10 bg-transparent text-center font-bold text-white focus:outline-none"
                        />
                        <span>sec</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left: Narration & On-Screen Text */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-brand-400" />
                          <span>Spoken Voiceover (Narration)</span>
                        </label>
                        <textarea
                          rows={3}
                          value={section.narration}
                          onChange={(e) => updateSection(idx, 'narration', e.target.value)}
                          className="w-full bg-dark-bg/80 border border-dark-border rounded-xl p-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Kinetic On-Screen Caption Text
                        </label>
                        <input
                          value={section.onScreenText || ''}
                          onChange={(e) => updateSection(idx, 'onScreenText', e.target.value)}
                          placeholder="e.g. STOP RUINING YOUR VIDEOS 🛑"
                          className="w-full bg-dark-bg/80 border border-dark-border rounded-xl px-3 py-1.5 text-xs font-semibold text-amber-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    {/* Right: Integrated Shot Plan for Matching */}
                    <div className="lg:col-span-6 space-y-3 bg-dark-bg/40 p-3.5 rounded-xl border border-dark-border/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5" />
                          <span>Visual Shot Plan (What Camera Sees)</span>
                        </label>
                        <Badge variant="brand" size="sm">
                          {section.shotPlan?.shotType || 'medium'}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <textarea
                          rows={2}
                          value={section.shotPlan?.visualDescription || ''}
                          onChange={(e) => updateShotPlan(idx, 'visualDescription', e.target.value)}
                          placeholder="Visual description for footage matching..."
                          className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>Required Matching Asset Tags:</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {(section.shotPlan?.suggestedTags || []).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-dark-surface border border-dark-border text-slate-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
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
