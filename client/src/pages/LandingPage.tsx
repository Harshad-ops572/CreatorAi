import React, { Suspense, lazy } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Video,
  Layers,
  Wand2,
  Lightbulb,
  Share2,
  BarChart3,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';

// Lazy load heavy 3D scene to satisfy rule: "Lazy-load heavy routes and the 3D scene (React.lazy + Suspense)"
const Hero3DScene = lazy(() => import('../components/3d/HeroScene'));

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenLogin }) => {
  const { demoLogin, isLoading } = useAuth();

  const handleStartDemo = async () => {
    await demoLogin();
    onEnterApp();
  };

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-brand-400" />,
      title: 'Context-Aware Product Intelligence',
      desc: 'Upload a product, brochure, or video. Gemini extracts USP, claims, and audience context to power every subsequent idea and cut.',
    },
    {
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />,
      title: 'Viral Hook & Storyboard Engine',
      desc: 'Formulate 3-second pattern interrupt hooks with structured timed script sections and exact camera shot plans.',
    },
    {
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      title: 'Script-to-Footage Vector Matching',
      desc: 'MongoDB Atlas vector search finds the top 3 best matching footage scenes for each line of your script with confidence scores.',
    },
    {
      icon: <Wand2 className="w-5 h-5 text-purple-400" />,
      title: 'Conversational "Chat-to-Edit"',
      desc: 'Say "make the intro faster" or "cut scene 2". The AI assistant turns natural language into validated JSON timeline operations.',
    },
    {
      icon: <Share2 className="w-5 h-5 text-pink-400" />,
      title: 'Multi-Platform 9:16 Video Rendering',
      desc: 'Export vertical reels via FFmpeg with burned-in kinetic captions, adaptive thumbnails, and platform copy in one click.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-emerald-400" />,
      title: 'Creator Intelligence & Retention Analytics',
      desc: 'Track 3-second hook retention and completion rates with AI observations surfacing statistical patterns in your content.',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-dark-border/80 bg-dark-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tracking-tight text-white">Creator</span>
              <span className="text-xl font-extrabold tracking-tight text-brand-400">Ai</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <Button
              onClick={handleStartDemo}
              variant="primary"
              size="sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              One-Click Demo Launch
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 border-b border-dark-border/40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                <span>Next-Generation Creator Operating Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Unify Your Creative Workflow from{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">
                  Product to Published Reel.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Everything is context-aware. Gemini learns your product, then engineers viral hooks, writes timed scripts, matches footage via vector search, and edits the timeline with natural language.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Button
                  onClick={handleStartDemo}
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Demo Workspace
                </Button>
                <Button
                  onClick={onOpenLogin}
                  variant="secondary"
                  size="lg"
                >
                  Log In or Register
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400 pt-3">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-Config Testing</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Local FFmpeg Render Engine</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Gemini Multimodal AI</span>
                </span>
              </div>
            </div>

            {/* Right Interactive 3D Element */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <Suspense
                fallback={
                  <div className="w-full h-[400px] flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                  </div>
                }
              >
                <Hero3DScene />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            The Complete 20-Stage Production Pipeline
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            From product upload and script generation to video rendering and retention analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-panel p-6 rounded-2xl border border-dark-border hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-200 space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-dark-surface border border-dark-border flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-white">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action footer */}
      <section className="py-16 border-t border-dark-border/60 bg-dark-card/40">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-5">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to test the creator pipeline?
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Try the demo project with pre-analyzed product profile, scripts, video footage, and assembled AI drafts.
          </p>
          <Button
            onClick={handleStartDemo}
            variant="primary"
            size="lg"
            isLoading={isLoading}
            leftIcon={<Play className="w-4 h-4 fill-white" />}
          >
            Launch Instant Demo Session
          </Button>
        </div>
      </section>
    </div>
  );
};
