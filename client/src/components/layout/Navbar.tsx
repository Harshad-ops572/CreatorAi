import React from 'react';
import { Sparkles, Plus, LogOut, LayoutDashboard, Kanban, BarChart3, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

interface NavbarProps {
  onNewProject?: () => void;
  currentPage?: string;
  setCurrentPage?: (page: string) => void;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewProject,
  currentPage = 'dashboard',
  setCurrentPage,
  mobileMenuOpen = false,
  setMobileMenuOpen,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-dark-border/80 bg-dark-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-surface"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={() => setCurrentPage && setCurrentPage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold tracking-tight text-white">Creator</span>
              <span className="text-lg font-extrabold tracking-tight text-brand-400">Ai</span>
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        {setCurrentPage && user && (
          <nav className="hidden md:flex items-center gap-1 bg-dark-surface/60 border border-dark-border rounded-xl p-1">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setCurrentPage('workflow')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPage === 'workflow'
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Workflow</span>
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPage === 'analytics'
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Creator Intelligence</span>
            </button>
          </nav>
        )}

        {/* User & Actions */}
        <div className="flex items-center gap-3">
          {onNewProject && (
            <Button
              onClick={onNewProject}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-dark-border">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-400/40 flex items-center justify-center text-xs font-bold text-brand-300">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-medium text-slate-300">
                {user.name}
              </span>
              <button
                onClick={logout}
                title="Log Out"
                aria-label="Log Out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-dark-surface rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => setCurrentPage && setCurrentPage('login')}
              variant="outline"
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
