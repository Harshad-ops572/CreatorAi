import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Send,
  Scissors,
  FastForward,
  Trash2,
  RefreshCw,
  Layers,
  Volume2,
  Type,
  Music,
  Check,
  ArrowRight,
  Clock,
  Wand2,
  Sliders,
  History,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';
import { Timeline, TimelineClip, Asset } from '../../types';

export const EditorTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const { success, error, info } = useToast();

  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [versions, setVersions] = useState<Timeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);

  // Chat-to-Edit state
  const [chatCommand, setChatCommand] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; operations?: any[] }>>([
    {
      role: 'assistant',
      text: 'Hi! I am your AI Video Editor. Tell me how you want to adjust the video — e.g. "make the intro faster", "make it 15 seconds", "remove scene 2", or "make it feel more premium".',
    },
  ]);

  // Replace Clip Modal state
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [replaceCandidates, setReplaceCandidates] = useState<any[]>([]);
  const [isFindingCandidates, setIsFindingCandidates] = useState(false);

  // Left tools tab
  const [activeTool, setActiveTool] = useState<'clips' | 'ai' | 'text' | 'audio' | 'transitions'>('clips');

  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadTimeline = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const [current, allVersions] = await Promise.all([
        api.getCurrentTimeline(activeProject._id).catch(() => null),
        api.getTimelineVersions(activeProject._id).catch(() => []),
      ]);
      setTimeline(current);
      setVersions(allVersions || []);
      if (current?.clips?.length > 0) {
        setSelectedClip(current.clips[0]);
      }
    } catch (e) {
      error('Failed to load timeline.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [activeProject?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Video playback time update loop
  useEffect(() => {
    let interval: any;
    if (isPlaying && timeline && timeline.totalDuration > 0) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= timeline.totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return Math.round((prev + 0.1) * 10) / 10;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeline]);

  // Auto Draft Trigger
  const handleAutoDraft = async () => {
    if (!activeProject?._id) return;
    setIsAiProcessing(true);
    try {
      const newDraft = await api.createAutoDraft(activeProject._id);
      setTimeline(newDraft);
      if (newDraft.clips.length > 0) setSelectedClip(newDraft.clips[0]);
      success('Auto Draft assembled! Script sections matched and ordered with kinetic captions.');
    } catch (err: any) {
      error(err.message || 'Auto draft failed. Please ensure you have uploaded footage.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Chat-to-Edit Command Submit
  const handleChatEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatCommand.trim() || !activeProject?._id) return;

    const userMsg = chatCommand.trim();
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatCommand('');
    setIsAiProcessing(true);

    try {
      const result = await api.chatToEdit(activeProject._id, userMsg);
      setTimeline(result.timeline);
      if (result.timeline.clips.length > 0) {
        setSelectedClip(result.timeline.clips[0]);
      }
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.explanation,
          operations: result.operations,
        },
      ]);
      success('AI Edit applied to timeline!');
    } catch (err: any) {
      error(err.message || 'AI Edit command failed. Please try rephrasing.');
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I could not execute that operation. Try a specific instruction like "make the intro faster" or "make it 15 seconds".',
        },
      ]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Manual clip adjustments
  const handleSpeedChange = async (speed: number) => {
    if (!selectedClip || !timeline) return;
    const updatedClips = timeline.clips.map((c) => (c.id === selectedClip.id ? { ...c, speed } : c));
    updateTimelineClips(updatedClips);
    success(`Speed updated to ${speed}x`);
  };

  const handleRemoveClip = (clipId: string) => {
    if (!timeline) return;
    const updatedClips = timeline.clips.filter((c) => c.id !== clipId);
    let cursor = 0;
    const reindexed = updatedClips.map((c) => {
      const item = { ...c, timelineStart: cursor };
      cursor += c.duration;
      return item;
    });
    updateTimelineClips(reindexed);
    setSelectedClip(reindexed[0] || null);
    success('Clip removed from timeline.');
  };

  const updateTimelineClips = async (newClips: TimelineClip[]) => {
    if (!timeline?._id) return;
    try {
      const updated = await api.updateTimeline(timeline._id, { clips: newClips });
      setTimeline(updated);
    } catch (e) {
      error('Failed to update timeline.');
    }
  };

  // Replace clip workflow
  const openReplaceModal = async () => {
    if (!selectedClip || !activeProject?._id) return;
    setReplaceModalOpen(true);
    setIsFindingCandidates(true);
    try {
      const candidates = await api.getReplaceCandidates(
        activeProject._id,
        selectedClip.id,
        selectedClip.assetId,
        selectedClip.sectionType || selectedClip.title
      );
      setReplaceCandidates(candidates);
    } catch (e) {
      error('Failed to load replacement candidates.');
    } finally {
      setIsFindingCandidates(false);
    }
  };

  const handleApplyReplacement = async (candidate: any) => {
    if (!selectedClip || !timeline) return;
    const updatedClips = timeline.clips.map((c) => {
      if (c.id === selectedClip.id) {
        return {
          ...c,
          assetId: candidate.assetId,
          assetUrl: candidate.assetUrl,
          title: candidate.originalName,
          matchScore: candidate.matchScore,
        };
      }
      return c;
    });

    await updateTimelineClips(updatedClips);
    const newSelected = updatedClips.find((c) => c.id === selectedClip.id);
    setSelectedClip(newSelected || null);
    setReplaceModalOpen(false);
    success(`Clip replaced with "${candidate.originalName}"!`);
  };

  // Revert version
  const handleRevertVersion = async (v: number) => {
    if (!activeProject?._id) return;
    try {
      const reverted = await api.revertTimelineVersion(activeProject._id, v);
      setTimeline(reverted);
      if (reverted.clips.length > 0) setSelectedClip(reverted.clips[0]);
      success(`Reverted to Version ${v}!`);
    } catch (e) {
      error(`Could not revert to version ${v}.`);
    }
  };

  // Active clip based on currentTime
  const currentActiveClip =
    timeline?.clips.find(
      (c) => currentTime >= c.timelineStart && currentTime < c.timelineStart + c.duration
    ) || (timeline?.clips[0] ?? null);

  return (
    <div className="space-y-4 max-w-7xl mx-auto select-none">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border/60 pb-3">
        <div className="flex items-center gap-3">
          <Badge variant="brand" size="md">
            Stage 5: AI Timeline Editor
          </Badge>
          <span className="text-sm font-bold text-white">
            {timeline?.title || 'Draft v1'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {timeline?.aspectRatio || '9:16'} ({timeline?.totalDuration || 0}s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <div className="flex items-center gap-1 bg-dark-surface px-2 py-1 rounded-lg border border-dark-border text-xs text-slate-300">
              <History className="w-3.5 h-3.5 text-brand-400" />
              <span>v{timeline?.version}</span>
            </div>
          )}
          <Button
            onClick={handleAutoDraft}
            variant="secondary"
            size="sm"
            isLoading={isAiProcessing}
            leftIcon={<Wand2 className="w-3.5 h-3.5 text-brand-400" />}
          >
            Re-Assemble Auto Draft
          </Button>
          <Button
            onClick={() => setActiveStep('export')}
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Export Video
          </Button>
        </div>
      </div>

      {/* Main 3-Column Layout: Tools, Center Player, Right AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[520px]">
        {/* Left Tools Column */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-3 border border-dark-border flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-1 border-b border-dark-border pb-2 mb-3">
            <button
              onClick={() => setActiveTool('clips')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTool === 'clips' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Clips
            </button>
            <button
              onClick={() => setActiveTool('ai')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTool === 'ai' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setActiveTool('text')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTool === 'text' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Captions
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {activeTool === 'clips' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Timeline Clips ({timeline?.clips?.length || 0})
                </div>
                {timeline?.clips?.map((clip, idx) => {
                  const isCur = selectedClip?.id === clip.id;
                  return (
                    <div
                      key={clip.id}
                      onClick={() => {
                        setSelectedClip(clip);
                        setCurrentTime(clip.timelineStart);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isCur
                          ? 'border-brand-500 bg-brand-950/40 text-white shadow-glow-sm'
                          : 'border-dark-border bg-dark-surface/40 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate text-[11px] flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-dark-bg flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="truncate">{clip.title}</span>
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">{clip.duration}s</span>
                      </div>
                      <div className="text-[10px] text-amber-300/90 truncate italic">
                        {clip.captionText || 'No caption text'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTool === 'ai' && (
              <div className="space-y-4 p-1">
                <div className="text-xs font-bold text-white">Clip Quick Tweaks</div>
                {selectedClip ? (
                  <div className="space-y-3">
                    <div className="text-xs text-brand-300 font-semibold truncate">
                      Selected: {selectedClip.title}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Playback Speed
                      </span>
                      <div className="flex gap-1.5">
                        {[1.0, 1.25, 1.5, 2.0].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`flex-1 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                              selectedClip.speed === s
                                ? 'bg-brand-500 text-white'
                                : 'bg-dark-surface text-slate-400 hover:text-white'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-dark-border space-y-2">
                      <Button
                        onClick={openReplaceModal}
                        variant="secondary"
                        size="sm"
                        className="w-full text-xs"
                        leftIcon={<RefreshCw className="w-3.5 h-3.5 text-brand-400" />}
                      >
                        Replace This Clip
                      </Button>
                      <Button
                        onClick={() => handleRemoveClip(selectedClip.id)}
                        variant="danger"
                        size="sm"
                        className="w-full text-xs"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Remove From Timeline
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Select a clip to tweak speed or replace.</p>
                )}
              </div>
            )}

            {activeTool === 'text' && (
              <div className="space-y-3 p-1">
                <div className="text-xs font-bold text-white">Kinetic Caption Styling</div>
                <div className="p-3 bg-dark-bg/60 rounded-xl border border-dark-border space-y-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Current Overlay Text:</div>
                  <input
                    value={selectedClip?.captionText || ''}
                    onChange={(e) => {
                      if (!selectedClip || !timeline) return;
                      const text = e.target.value;
                      const updatedClips = timeline.clips.map((c) =>
                        c.id === selectedClip.id ? { ...c, captionText: text } : c
                      );
                      updateTimelineClips(updatedClips);
                      setSelectedClip({ ...selectedClip, captionText: text });
                    }}
                    placeholder="Enter bold caption..."
                    className="w-full bg-dark-surface border border-dark-border rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/20 text-brand-300">
                      Font: Inter Bold
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-dark-surface text-slate-300">
                      Position: Center Bottom
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Preview Player Column */}
        <div className="lg:col-span-5 flex flex-col glass-panel rounded-2xl p-3 border border-dark-border h-full overflow-hidden">
          <div className="flex-1 bg-black rounded-xl overflow-hidden relative flex items-center justify-center border border-dark-border/80">
            {currentActiveClip?.assetUrl ? (
              <video
                ref={videoRef}
                src={currentActiveClip.assetUrl}
                className="max-h-full max-w-full object-contain"
                playsInline
                muted
              />
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs">
                No active clip in timeline. Click &quot;Assemble Auto Draft&quot; to build preview.
              </div>
            )}

            {/* Kinetic Caption Overlay on Video */}
            {currentActiveClip?.captionText && (
              <div className="absolute bottom-6 left-4 right-4 text-center pointer-events-none z-10">
                <span className="inline-block px-3 py-1.5 bg-black/80 backdrop-blur-sm border border-white/20 rounded-xl text-amber-300 font-extrabold text-xs sm:text-sm tracking-wide shadow-2xl">
                  {currentActiveClip.captionText}
                </span>
              </div>
            )}

            {/* Aspect Ratio Guide Watermark */}
            <div className="absolute top-3 left-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 text-slate-300 border border-white/10 pointer-events-none">
              9:16 VERTICAL
            </div>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between pt-3 px-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (videoRef.current) {
                    if (isPlaying) videoRef.current.pause();
                    else videoRef.current.play();
                  }
                }}
                className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-colors shadow-glow-sm"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => {
                  setCurrentTime(0);
                  setIsPlaying(false);
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="w-8 h-8 rounded-lg bg-dark-surface text-slate-300 flex items-center justify-center hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs font-mono font-bold text-slate-300">
              {currentTime.toFixed(1)}s / {(timeline?.totalDuration || 0).toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Right AI Assistant Chat Panel ("Chat-to-Edit") */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-3 border border-dark-border flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-dark-border pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold text-white">Chat-to-Edit Assistant</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-semibold">
              Gemini Compiler
            </span>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600/30 border border-brand-500/40 text-slate-100 ml-4'
                    : 'bg-dark-surface/60 border border-dark-border text-slate-200 mr-2'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                  {msg.role === 'user' ? 'You' : 'CreatorAi Editor'}
                </div>
                <p>{msg.text}</p>
                {msg.operations && msg.operations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dark-border/60 text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Applied: {msg.operations.map((o) => o.description).join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="py-2 flex gap-1 overflow-x-auto no-scrollbar">
            {['make the intro faster', 'make it 15 seconds', 'remove scene 2', 'make it feel more premium'].map(
              (prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => setChatCommand(prompt)}
                  className="text-[10px] px-2 py-1 rounded-md bg-dark-surface hover:bg-dark-border text-slate-300 whitespace-nowrap shrink-0 border border-dark-border"
                >
                  &quot;{prompt}&quot;
                </button>
              )
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleChatEdit} className="flex gap-1.5 pt-1 border-t border-dark-border">
            <input
              value={chatCommand}
              onChange={(e) => setChatCommand(e.target.value)}
              placeholder="e.g. 'make the intro faster'..."
              disabled={isAiProcessing}
              className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isAiProcessing}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Multi-Track Timeline */}
      <Card className="p-4 space-y-3 border border-dark-border">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-dark-border/60 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Multi-Track Timeline</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Duration: {timeline?.totalDuration || 0}s | Aspect: 9:16
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">
              Cursor: {currentTime.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Tracks Container */}
        <div className="space-y-2 overflow-x-auto py-2">
          {/* Main Video Track */}
          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Video Track
            </div>
            <div className="flex-1 min-w-[600px] h-14 bg-dark-bg/80 rounded-xl border border-dark-border/80 p-1 flex items-center gap-1.5 relative">
              {timeline?.clips?.map((clip, idx) => {
                const isCur = selectedClip?.id === clip.id;
                // Calculate relative width based on totalDuration
                const total = Math.max(1, timeline.totalDuration || 1);
                const widthPercent = Math.max(12, (clip.duration / total) * 100);

                return (
                  <div
                    key={clip.id}
                    onClick={() => {
                      setSelectedClip(clip);
                      setCurrentTime(clip.timelineStart);
                    }}
                    style={{ width: `${widthPercent}%` }}
                    className={`h-full rounded-lg px-2 py-1 flex flex-col justify-between cursor-pointer transition-all border select-none ${
                      isCur
                        ? 'bg-brand-600/40 border-brand-400 text-white shadow-glow-sm'
                        : 'bg-dark-surface/60 border-dark-border text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold truncate">{clip.title}</span>
                      <span className="font-mono text-[9px]">{clip.duration}s</span>
                    </div>
                    <div className="text-[9px] text-slate-400 truncate font-mono">
                      {clip.speed}x • {clip.sectionType || 'clip'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Captions Track */}
          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Type className="w-3 h-3 text-amber-400" />
              <span>Captions</span>
            </div>
            <div className="flex-1 min-w-[600px] h-8 bg-dark-bg/40 rounded-xl border border-dark-border/60 p-1 flex items-center gap-1.5">
              {timeline?.clips?.map((clip) => {
                const total = Math.max(1, timeline.totalDuration || 1);
                const widthPercent = Math.max(12, (clip.duration / total) * 100);
                return (
                  <div
                    key={clip.id}
                    style={{ width: `${widthPercent}%` }}
                    className="h-full bg-amber-500/10 border border-amber-500/30 rounded px-2 flex items-center text-[9px] text-amber-300 font-semibold truncate"
                  >
                    {clip.captionText || 'Kinetic text'}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background Music Track */}
          <div className="flex items-center gap-3">
            <div className="w-24 shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Music className="w-3 h-3 text-cyan-400" />
              <span>Audio</span>
            </div>
            <div className="flex-1 min-w-[600px] h-8 bg-dark-bg/40 rounded-xl border border-dark-border/60 p-1 flex items-center">
              <div className="w-full h-full bg-cyan-500/15 border border-cyan-500/30 rounded px-2 flex items-center justify-between text-[9px] text-cyan-300 font-mono">
                <span>Ambient Lo-Fi Synth Track (Normalized -14 LUFS)</span>
                <span>Vol: 0.3</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Replace Clip Modal */}
      <Modal
        isOpen={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        title="Replace Clip in One Click"
        description="Vector search scans your uploaded footage and ranks best visual replacements."
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2">
          {isFindingCandidates ? (
            <div className="space-y-3">
              <Skeleton height={80} />
              <Skeleton height={80} />
            </div>
          ) : replaceCandidates.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              No alternate footage clips found in this project. Upload more footage in the Footage tab.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {replaceCandidates.map((cand, idx) => (
                <div
                  key={cand.assetId}
                  className="p-3 rounded-xl bg-dark-surface/60 border border-dark-border hover:border-brand-500 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{cand.originalName}</span>
                      <Badge variant="success" size="sm">
                        {cand.matchScore}% Match
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {cand.matchReason}
                    </p>
                    <div className="flex gap-1">
                      {cand.tags?.map((t: string, i: number) => (
                        <span key={i} className="text-[9px] text-slate-500 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleApplyReplacement(cand)}
                    variant="primary"
                    size="sm"
                  >
                    Select & Swap
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
