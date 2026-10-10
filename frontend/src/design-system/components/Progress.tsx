import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  tone?: 'blue' | 'orange' | 'green';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  tone = 'blue',
  size = 'md',
  showLabel = false,
  className,
  ...props
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const toneBar = {
    blue: 'bg-blue-600',
    orange: 'bg-orange-500',
    green: 'bg-emerald-500',
  }[tone];

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heightStyles)}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', toneBar)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
