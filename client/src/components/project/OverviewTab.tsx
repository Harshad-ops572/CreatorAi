import React, { useState, useEffect } from 'react';
import { Sparkles, Package, Lightbulb, FileText, FileVideo, Video, Share2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { api } from '../../api/client';

export const OverviewTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const [product, setProduct] = useState<any>(null);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [script, setScript] = useState<any>(null);
  const [assetCount, setAssetCount] = useState<number>(0);
  const [timeline, setTimeline] = useState<any>(null);

  useEffect(() => {
    if (!activeProject?._id) return;
    const pid = activeProject._id;

    api.getProduct(pid).then((d) => setProduct(d)).catch(() => {});
    api.getIdeas(pid).then((ideas) => {
      setSelectedIdea(ideas.find((i: any) => i.selected) || ideas[0] || null);
    }).catch(() => {});
    api.getCurrentScript(pid).then((s) => setScript(s)).catch(() => {});
    api.getAssets(pid).then((assets) => setAssetCount(assets.length)).catch(() => {});
    api.getCurrentTimeline(pid).then((t) => setTimeline(t)).catch(() => {});
  }, [activeProject?._id]);

  const pipelineCards = [
    {
      step: 'product' as const,
      num: '1',
      title: 'Product Intelligence',
      desc: product?.profile?.name ? `Context active: ${product.profile.name}` : 'Upload product assets & extract intelligence',
      isComplete: Boolean(product?.profile?.name),
      icon: <Package className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: 'ideas' as const,
      num: '2',
      title: 'Viral Ideation',
      desc: selectedIdea ? `Selected hook: "${selectedIdea.hook.slice(0, 40)}..."` : 'Generate product-specific hooks & angles',
      isComplete: Boolean(selectedIdea),
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
    },
    {
      step: 'script' as const,
      num: '3',
      title: 'Timed Script & Shot Plan',
      desc: script ? `${script.sections.length} timed sections ready (${script.totalDurationSeconds}s)` : 'AI timed script with camera shot plans',
      isComplete: Boolean(script),
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
    },
    {
      step: 'footage' as const,
      num: '4',
      title: 'Footage Analysis & Match',
      desc: assetCount > 0 ? `${assetCount} footage clips analyzed & embedded` : 'Upload footage & run script-to-video matching',
      isComplete: assetCount > 0,
      icon: <FileVideo className="w-5 h-5 text-cyan-400" />,
    },
    {
      step: 'editor' as const,
      num: '5',
      title: 'AI Video Editor & Chat',
      desc: timeline?.clips?.length > 0 ? `Active Draft: ${timeline.clips.length} assembled clips` : 'Compile Auto Draft & edit with conversational AI',
      isComplete: Boolean(timeline?.clips?.length > 0),
      icon: <Video className="w-5 h-5 text-purple-400" />,
    },
    {
      step: 'export' as const,
      num: '6',
      title: 'Export & Adaptation',
      desc: 'Render 9:16 Reel, generate thumbnails & platform posts',
      isComplete: false,
      icon: <Share2 className="w-5 h-5 text-pink-400" />,
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Project Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-dark-border relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Context-Aware Creator Pipeline</span>
              </Badge>
              <Badge variant="neutral" size="md">
                Format: {activeProject?.targetPlatform?.toUpperCase() || 'REELS'} (9:16)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeProject?.title}
            </h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {activeProject?.description ||
                'Everything inside this project is tuned around your product context. From viral hooks to clip matching, AI editing, and platform exports.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              onClick={() => setActiveStep('editor')}
              variant="primary"
              size="md"
              leftIcon={<Video className="w-4 h-4" />}
            >
              Open AI Video Editor
            </Button>
            <Button
              onClick={() => setActiveStep('product')}
              variant="secondary"
              size="md"
            >
              View Product Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline Status Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <span>Production Pipeline Flow</span>
          <span className="text-xs text-slate-500 font-normal">
            (Step-by-step from product to viral export)
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineCards.map((c) => (
            <Card
              key={c.step}
              hoverEffect
              className="cursor-pointer group flex flex-col justify-between"
              onClick={() => setActiveStep(c.step)}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center group-hover:border-brand-500/40 transition-colors">
                    {c.icon}
                  </div>
                  {c.isComplete ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Step {c.num}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-xs font-semibold text-brand-400 mt-4 group-hover:translate-x-1 transition-transform">
                <span>Configure Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
