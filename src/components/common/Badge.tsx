import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'neutral' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    gold: 'border border-[#E5A93C]/40 text-[#F5B942] bg-[#E5A93C]/10',
    neutral: 'border border-slate-700/60 text-slate-300 bg-slate-800/40',
    success: 'border border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    warning: 'border border-amber-500/40 text-amber-300 bg-amber-500/10',
    info: 'border border-sky-500/40 text-sky-300 bg-sky-500/10',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded',
    md: 'text-xs px-2.5 py-1 font-medium rounded-md',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 uppercase tracking-wider ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
