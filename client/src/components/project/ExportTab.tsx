import React, { useState, useEffect } from 'react';
import {
  Download,
  Share2,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Layers,
  Image,
  ExternalLink,
  Clock,
  Video,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';

export const ExportTab: React.FC = () => {
  const { activeProject } = useProject();
  const { success, error } = useToast();

  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderStep, setRenderStep] = useState('');
  const [renderedResult, setRenderedResult] = useState<any>(null);

  // Platform adaptations & thumbnails
  const [adaptations, setAdaptations] = useState<any>(null);
  const [thumbnails, setThumbnails] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('reels');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProject?._id) return;
    const pid = activeProject._id;

    api.getPlatformAdaptation(pid).then((data) => setAdaptations(data)).catch(() => {});
    api.getThumbnailConcepts(pid).then((data) => setThumbnails(data)).catch(() => {});
  }, [activeProject?._id]);

  const handleStartRender = async () => {
    if (!activeProject?._id) return;
    setIsRendering(true);
    setRenderProgress(10);
    setRenderStep('Initializing render queue...');
    setRenderedResult(null);

    try {
      const response = await api.renderVideoExport(activeProject._id, { aspectRatio });
      const jobId = response.jobId;

      // Poll background job
      const pollInterval = setInterval(async () => {
        try {
          const job = await api.getJobStatus(jobId);
          setRenderProgress(job.progress);
          setRenderStep(job.currentStepMessage);

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            setIsRendering(false);
            setRenderedResult(job.resultPayload);
            success('Video rendered successfully! Ready for download.');
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            setIsRendering(false);
            error(job.errorMessage || 'Rendering failed.');
          }
        } catch (e) {
          clearInterval(pollInterval);
          setIsRendering(false);
        }
      }, 1000);
    } catch (err: any) {
      setIsRendering(false);
      error(err.message || 'Failed to start export render.');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const activePlatformData = adaptations ? adaptations[selectedPlatform] : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-dark-border/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Pipeline Stage 6
          </span>
          <Badge variant="brand" size="sm">
            <Sparkles className="w-3 h-3" />
            Final Video Rendering & Multi-Platform Adaptation
          </Badge>
        </div>
        <h1 className="text-2xl font-extrabold text-white mt-1">Export, Adaptation & Publishing</h1>
        <p className="text-xs text-slate-400 mt-1">
          Burn captions, normalize audio, export vertical reels, and adapt for Instagram, TikTok, YouTube Shorts, and LinkedIn.
        </p>
      </div>

      {/* Video Render Section */}
      <Card className="space-y-5" glow>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-brand-400" />
              <span>1. Final Video Render Engine (FFmpeg)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Stitches timeline clips, burns in kinetic captions, and renders high-definition MP4.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
              {(['9:16', '16:9', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    aspectRatio === ratio
                      ? 'bg-brand-500 text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>

            <Button
              onClick={handleStartRender}
              variant="primary"
              size="md"
              isLoading={isRendering}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Render {aspectRatio} Video
            </Button>
          </div>
        </div>

        {/* Render Progress Bar */}
        {isRendering && (
          <div className="space-y-2 p-4 bg-dark-bg/60 rounded-xl border border-brand-500/30 animate-pulse-slow">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-brand-300">{renderStep}</span>
              <span className="font-mono text-white font-bold">{renderProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-dark-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Rendered Output Ready */}
        {renderedResult && (
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Render Completed! ({renderedResult.resolution})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {renderedResult.filename} • {renderedResult.duration}s
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={renderedResult.downloadUrl}
                download={renderedResult.filename}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all shadow-glow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Video (.MP4)</span>
              </a>
            </div>
          </div>
        )}
      </Card>

      {/* Multi-Platform Adaptations */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-brand-400" />
              <span>2. Multi-Platform Adaptation & Post Generator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically adapted from your product intelligence profile for maximum algorithmic reach.
            </p>
          </div>

          {/* Platform Switcher */}
          <div className="flex gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border">
            {['reels', 'shorts', 'tiktok', 'youtube', 'linkedin'].map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  selectedPlatform === plat
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>

        {activePlatformData ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Metadata Specs */}
            <div className="md:col-span-4 space-y-3 bg-dark-bg/60 p-3.5 rounded-xl border border-dark-border">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Platform</span>
                <p className="text-sm font-bold text-white capitalize">{selectedPlatform}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Optimal Aspect & Duration</span>
                <p className="text-xs font-mono text-brand-300">
                  {activePlatformData.aspectRatio} • {activePlatformData.targetDuration}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Best Time to Post</span>
                <p className="text-xs text-slate-300 font-medium">{activePlatformData.bestTimeToPost}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Call to Action (CTA)</span>
                <p className="text-xs text-emerald-400 font-medium">{activePlatformData.callToAction}</p>
              </div>
            </div>

            {/* Right: Caption, Title & Hashtags */}
            <div className="md:col-span-8 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Post Title</label>
                  <button
                    onClick={() => copyToClipboard(activePlatformData.title, 'title')}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    {copiedKey === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'title' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  readOnly
                  value={activePlatformData.title}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Caption & Description</label>
                  <button
                    onClick={() => copyToClipboard(activePlatformData.description, 'caption')}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    {copiedKey === 'caption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'caption' ? 'Copied' : 'Copy Caption'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={activePlatformData.description}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-xs text-slate-300 leading-relaxed font-sans"
                />
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activePlatformData.hashtags?.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-dark-surface text-brand-300 border border-dark-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Skeleton height={140} />
        )}
      </Card>

      {/* Thumbnail Generator Concepts */}
      <Card className="space-y-4">
        <div className="border-b border-dark-border pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Image className="w-4 h-4 text-brand-400" />
            <span>3. Viral Thumbnail Concepts (3 Ideas)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineered with visual pattern interrupts, color theory, and curiosity gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {thumbnails.map((t, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-dark-bg/60 border border-dark-border hover:border-brand-500/50 flex flex-col justify-between space-y-3 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="brand" size="sm">
                    Concept #{idx + 1}
                  </Badge>
                  <span className="text-[10px] text-amber-300 font-semibold">
                    {t.psychologicalTrigger}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/80 border border-white/10 text-center font-extrabold text-sm text-yellow-300 tracking-wider">
                  {t.headline}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Composition: </strong>
                  {t.composition}
                </p>

                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">Focal Element: </strong>
                  {t.focalPoint}
                </p>
              </div>

              <div className="pt-2 border-t border-dark-border/60 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 mr-1">Palette:</span>
                  {t.colorPalette?.map((c: string, cIdx: number) => (
                    <span
                      key={cIdx}
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
                <button
                  onClick={() => copyToClipboard(t.headline, `thumb_${idx}`)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium"
                >
                  {copiedKey === `thumb_${idx}` ? 'Copied' : 'Copy Headline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
