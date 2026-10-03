import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'pill' | 'underline';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'pill',
}) => {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar ${
        variant === 'pill' ? 'bg-dark-surface/60 p-1.5 rounded-xl border border-dark-border' : 'border-b border-dark-border'
      } ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200 select-none ${
              isActive
                ? variant === 'pill'
                  ? 'bg-brand-500 text-white shadow-glow-sm'
                  : 'text-brand-400 border-b-2 border-brand-500 rounded-b-none'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
