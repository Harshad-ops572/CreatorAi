import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Sparkles,
  Share2,
  PieChart,
  Plus,
  Zap,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export const AnalyticsPage: React.FC = () => {
  const { success, error } = useToast();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalytics();
      setData(res);
    } catch (e) {
      error('Failed to load analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleSeedSamples = async () => {
    setIsSeeding(true);
    try {
      await api.seedSampleAnalytics();
      await loadAnalytics();
      success('Sample analytics metrics loaded!');
    } catch (e) {
      error('Failed to import sample analytics.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <Skeleton height={100} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </div>
        <Skeleton height={280} />
      </div>
    );
  }

  const summary = data?.summary || {
    totalViews: 0,
    totalWatchTimeSeconds: 0,
    avgEngagementRate: 0,
    avgRetention3s: 0,
    totalVideos: 0,
  };

  const platformMix = data?.platformMix || {};
  const hookStats = data?.hookStats || [];
  const observations = data?.observations || [];
  const entries = data?.entries || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              <BarChart3 className="w-3.5 h-3.5" />
              Creator Intelligence
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Performance & Retention Insights</h1>
          <p className="text-xs text-slate-400 mt-1">
            Gemini parses your video retention curves, identifying patterns across viral hook structures and formats.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {entries.length === 0 && (
            <Button
              onClick={handleSeedSamples}
              variant="secondary"
              size="sm"
              isLoading={isSeeding}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Load Sample Metrics
            </Button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Video Views</span>
            <Eye className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary.totalViews.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Across {summary.totalVideos} videos</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg 3s Retention</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">
            {summary.avgRetention3s}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">First 3 seconds survival</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Engagement Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {summary.avgEngagementRate}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Likes + Comments + Saves</span>
        </Card>

        <Card className="p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Watch Time</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">
            {Math.round(summary.totalWatchTimeSeconds / 60).toLocaleString()}m
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Accumulated attention</span>
        </Card>
      </div>

      {/* Gemini AI Observations Card */}
      <Card glow className="space-y-3 border-brand-500/30">
        <div className="flex items-center gap-2 border-b border-dark-border/80 pb-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h2 className="text-sm font-bold text-white">Gemini Creator Observations</h2>
          <span className="text-[10px] text-slate-400 italic">
            (Phrased as observable patterns in data)
          </span>
        </div>

        <div className="space-y-2">
          {observations.map((obs: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed bg-dark-bg/60 p-2.5 rounded-xl border border-dark-border">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0 mt-1.5" />
              <span>{obs}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hook Performance Ranking */}
        <div className="lg:col-span-7">
          <Card className="p-5 space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Best Performing Hook Types</span>
              </h3>
              <span className="text-xs text-slate-400">By 3-Second Retention</span>
            </div>

            <div className="space-y-3">
              {hookStats.map((h: any, idx: number) => (
                <div key={idx} className="space-y-1 bg-dark-bg/60 p-3 rounded-xl border border-dark-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white capitalize">{h.hookType.replace('_', ' ')}</span>
                    <span className="font-mono text-amber-300 font-bold">{h.avgRetention3s}% 3s retention</span>
                  </div>
                  <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-brand-500 rounded-full"
                      style={{ width: `${h.avgRetention3s}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>{h.count} video(s) tested</span>
                    <span>Avg views: {h.avgViews.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Platform Share Mix */}
        <div className="lg:col-span-5">
          <Card className="p-5 space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-cyan-400" />
                <span>Platform Volume Mix</span>
              </h3>
              <span className="text-xs text-slate-400">Views Share</span>
            </div>

            <div className="space-y-3">
              {Object.entries(platformMix).map(([plat, views]: [string, any], idx) => {
                const total = Math.max(1, summary.totalViews);
                const percent = Math.round((views / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-semibold text-slate-300">{plat}</span>
                      <span className="font-mono text-white text-[11px]">{views.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
