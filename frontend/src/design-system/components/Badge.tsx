import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: 'blue' | 'orange' | 'green' | 'purple' | 'yellow' | 'neutral' | 'red';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  tone = 'blue',
  size = 'md',
  children,
  ...props
}) => {
  const toneStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
    orange: 'bg-orange-50 text-orange-700 border-orange-200/60',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
    yellow: 'bg-amber-50 text-amber-800 border-amber-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-200/60',
  }[tone];

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border tracking-wide uppercase',
        toneStyles,
        sizeStyles,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
