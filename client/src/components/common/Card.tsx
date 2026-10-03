import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  glow = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-xl p-5 transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-700 hover:shadow-lg hover:-translate-y-0.5' : ''
      } ${glow ? 'glass-glow border-brand-500/30' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
