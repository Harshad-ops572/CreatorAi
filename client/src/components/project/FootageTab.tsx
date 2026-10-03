import React, { useState, useEffect } from 'react';
import {
  FileVideo,
  Upload,
  Search,
  Sparkles,
  Play,
  CheckCircle2,
  Trash2,
  Tag,
  ArrowRight,
  Video,
  Layers,
  Percent,
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { api } from '../../api/client';
import { Asset } from '../../types';

export const FootageTab: React.FC = () => {
  const { activeProject, setActiveStep } = useProject();
  const { success, error } = useToast();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [scriptMatches, setScriptMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'footage' | 'matching' | 'clips'>('footage');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const tagsList = ['product', 'close-up', 'talking', 'demo', 'indoor', 'outdoor', 'hand', 'face', 'packaging'];

  const loadAssets = async () => {
    if (!activeProject?._id) return;
    setIsLoading(true);
    try {
      const data = await api.getAssets(activeProject._id, {
        q: debouncedSearch || undefined,
        tag: selectedTag || undefined,
      });
      setAssets(data);
    } catch (e) {
      error('Failed to load assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, [activeProject?._id, debouncedSearch, selectedTag]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeProject?._id || !e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('folder', 'Raw Footage');
      files.forEach((f) => formData.append('files', f));

      const created = await api.uploadAssets(activeProject._id, formData);
      setAssets((prev) => [...created, ...prev]);
      success(`Uploaded and auto-tagged ${created.length} footage file(s)!`);

      // Trigger analysis for new video assets
      for (const a of created) {
        if (a.type === 'video') {
          api.analyzeFootage(a._id).catch(() => {});
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to upload footage.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunMatching = async () => {
    if (!activeProject?._id) return;
    setIsMatching(true);
    try {
      const matches = await api.matchScriptToFootage(activeProject._id);
      setScriptMatches(matches);
      setActiveTab('matching');
      success(`Vector search matched ${matches.length} script sections with footage!`);
    } catch (err: any) {
      error(err.message || 'Script-to-footage matching failed.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await api.deleteAsset(assetId);
      setAssets((prev) => prev.filter((a) => a._id !== assetId));
      success('Asset deleted.');
    } catch (e) {
      error('Failed to delete asset.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Pipeline Stage 4
            </span>
            <Badge variant="brand" size="sm">
              <Sparkles className="w-3 h-3" />
              Footage Understanding & Vector Search
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            Footage Management & Script Matching
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Semantic search and vector search automatically matches each script section to the best footage clip with confidence %.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunMatching}
            variant="secondary"
            size="sm"
            isLoading={isMatching}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
          >
            Run Script Matching
          </Button>
          <Button
            onClick={() => setActiveStep('editor')}
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Next: AI Video Editor
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-border">
        <button
          onClick={() => setActiveTab('footage')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'footage'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Footage Assets ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'matching'
              ? 'border-brand-500 text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Script-to-Footage Matches</span>
          {scriptMatches.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-[10px] text-white">
              {scriptMatches.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'footage' && (
        <div className="space-y-5">
          {/* Search, Filter & Upload Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-7">
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Semantic search (e.g. 'show all product close-ups', 'talking head')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="md:col-span-5 flex items-center gap-2 justify-end">
              <label className="relative cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="video/*,image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isUploading}
                  leftIcon={<Upload className="w-4 h-4" />}
                  className="pointer-events-none"
                >
                  Upload Footage Clips
                </Button>
              </label>
            </div>
          </div>

          {/* Quick Tag Badges Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags:
            </span>
            <button
              onClick={() => setSelectedTag('')}
              className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedTag === ''
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'bg-dark-surface text-slate-400 hover:text-white'
              }`}
            >
              All Tags
            </button>
            {tagsList.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'bg-dark-surface text-slate-400 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Assets Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <Skeleton height={200} />
              <Skeleton height={200} />
              <Skeleton height={200} />
              <Skeleton height={200} />
            </div>
          ) : assets.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <FileVideo className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No footage found</h3>
              <p className="text-xs text-slate-400">
                Upload your recorded A-roll, product close-ups, or demo clips to start automatic matching.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {assets.map((asset) => (
                <Card key={asset._id} className="p-3 flex flex-col justify-between group overflow-hidden">
                  <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden flex items-center justify-center border border-dark-border mb-2.5">
                    {asset.type === 'video' ? (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img src={asset.url} alt={asset.originalName} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white pointer-events-none">
                      {asset.metadata?.duration ? `${asset.metadata.duration}s` : 'MP4'}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white truncate" title={asset.originalName}>
                      {asset.originalName}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {asset.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-dark-surface text-slate-300 border border-dark-border"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-dark-border/60">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">
                      {asset.metadata?.orientation || 'portrait'}
                    </span>
                    <button
                      onClick={() => handleDeleteAsset(asset._id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Script-to-Footage Vector Matching View */}
      {activeTab === 'matching' && (
        <div className="space-y-4">
          {scriptMatches.length === 0 ? (
            <Card className="text-center py-12 space-y-3">
              <Sparkles className="w-10 h-10 text-brand-400 mx-auto" />
              <h3 className="text-base font-bold text-white">No matches computed yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Run script matching to let MongoDB Atlas vector search match each script section to the best footage scenes.
              </p>
              <Button
                onClick={handleRunMatching}
                variant="primary"
                size="md"
                isLoading={isMatching}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Match Script to Footage
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span>Matched Storyboard Sections ({scriptMatches.length})</span>
                <span className="text-emerald-400 font-medium">Top 3 alternatives computed per section</span>
              </div>

              {scriptMatches.map((m, idx) => (
                <Card key={idx} className="space-y-4 border border-brand-500/20">
                  <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-white">{m.sectionTitle}</h3>
                      <Badge variant="brand" size="sm">
                        {m.sectionType}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{m.durationSeconds}s</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Script requirement */}
                    <div className="lg:col-span-4 space-y-2 bg-dark-bg/60 p-3 rounded-xl border border-dark-border">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Script Shot Plan:
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {m.shotPlan?.visualDescription}
                      </p>
                      <div className="text-[11px] text-amber-300 font-semibold">
                        &ldquo;{m.onScreenText}&rdquo;
                      </div>
                    </div>

                    {/* Best Match & Alternatives */}
                    <div className="lg:col-span-8 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Top 3 Footage Alternatives (Ranked by Semantic Confidence):
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {m.alternatives?.map((alt: any, aIdx: number) => (
                          <div
                            key={aIdx}
                            className={`p-2.5 rounded-xl border transition-all ${
                              aIdx === 0
                                ? 'bg-brand-950/30 border-brand-500/60 shadow-glow-sm'
                                : 'bg-dark-surface/40 border-dark-border'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-bold text-white text-[11px] truncate" title={alt.assetName}>
                                {alt.assetName}
                              </span>
                              <Badge variant={aIdx === 0 ? 'success' : 'neutral'} size="sm">
                                {alt.confidencePercent}%
                              </Badge>
                            </div>

                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                              {alt.summary}
                            </p>

                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Range: {alt.startTime}s - {alt.endTime}s</span>
                              {aIdx === 0 && (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Selected</span>
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setActiveStep('editor')}
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Assemble Auto Draft in Video Editor
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
