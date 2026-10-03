import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-dark-bg/80 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error ? 'border-red-500/80 focus:ring-red-500' : 'border-dark-border hover:border-slate-700'
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-500 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
