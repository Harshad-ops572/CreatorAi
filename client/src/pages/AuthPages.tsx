import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

interface AuthPageProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<AuthPageProps> = ({ onSuccess, onBackToLanding }) => {
  const { login, demoLogin, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegisterMode) {
        await login({ email, password });
      } else {
        await login({ email, password });
      }
      onSuccess();
    } catch (e) {
      // Error is toasted automatically by AuthContext
    }
  };

  const handleDemo = async () => {
    try {
      await demoLogin();
      onSuccess();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">CreatorAi</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            {isRegisterMode ? 'Create CreatorAi Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-400">
            {isRegisterMode
              ? 'Start building context-aware AI creator videos'
              : 'Sign in to access your projects and video pipelines'}
          </p>
        </div>

        {/* Demo Login Callout */}
        <div className="p-4 bg-brand-950/40 border border-brand-500/40 rounded-2xl flex items-center justify-between gap-3 shadow-glow-sm">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Instant Evaluation Mode</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Skip typing and explore with preloaded demo assets.
            </p>
          </div>
          <Button
            onClick={handleDemo}
            variant="primary"
            size="sm"
            isLoading={isLoading}
          >
            One-Click Demo
          </Button>
        </div>

        {/* Form Card */}
        <Card className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegisterMode && (
              <Input
                label="Full Name"
                placeholder="e.g. Alex Rivera"
                leftIcon={<User className="w-4 h-4" />}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isRegisterMode ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-2 text-center border-t border-dark-border">
            <button
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
            >
              {isRegisterMode
                ? 'Already have an account? Sign in'
                : 'Need an account? Register here'}
            </button>
          </div>
        </Card>

        <div className="text-center">
          <button
            onClick={onBackToLanding}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            ← Back to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
