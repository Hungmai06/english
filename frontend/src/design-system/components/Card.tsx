import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'white' | 'cream' | 'blue' | 'orange' | 'purple' | 'cyan' | 'green' | 'pastel' | 'pink' | 'warm';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, tone = 'white', interactive = false, children, ...props }, ref) => {
    const toneStyles = {
      white: 'bg-white border-slate-100/80 shadow-subtle hover:shadow-card',
      cream: 'bg-[#FAF7F2] border-[#EFE7DC] shadow-subtle',
      blue: 'bg-blue-50/60 border-blue-100 hover:border-blue-200',
      orange: 'bg-orange-50/60 border-orange-100 hover:border-orange-200',
      purple: 'bg-purple-50/60 border-purple-100 hover:border-purple-200',
      cyan: 'bg-cyan-50/60 border-cyan-100 hover:border-cyan-200',
      green: 'bg-emerald-50/60 border-emerald-100 hover:border-emerald-200',
      pink: 'bg-pink-50/60 border-pink-100 hover:border-pink-200',
      warm: 'bg-amber-50/60 border-amber-100 hover:border-amber-200',
      pastel: 'bg-gradient-to-br from-amber-50/40 via-white to-blue-50/30 border-slate-100 shadow-card',
    }[tone];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl border p-5 transition-all duration-200',
          toneStyles,
          interactive && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-float active:translate-y-0',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
