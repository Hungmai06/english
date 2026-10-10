import React from 'react';
import { cn } from '@/lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  theme?: 'warm' | 'neutral' | 'cool' | 'blue' | 'pastel';
}

export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, theme = 'neutral', children, ...props }, ref) => {
    const themeStyles = {
      warm: 'bg-[#FAF8F5] text-slate-900', // warm cream hero zones
      neutral: 'bg-white text-slate-900',
      cool: 'bg-slate-50/70 text-slate-900',
      blue: 'bg-gradient-to-b from-blue-50/50 to-white text-slate-900',
      pastel: 'bg-gradient-to-b from-[#FAF7F2] via-white to-blue-50/20 text-slate-900',
    }[theme];

    return (
      <section
        ref={ref}
        className={cn('py-12 md:py-16 transition-colors', themeStyles, className)}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = 'Section';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  className,
  size = 'lg',
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl',
    lg: 'max-w-7xl',
    xl: 'max-w-[1400px]',
    full: 'max-w-full',
  }[size];

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8 w-full', sizeStyles, className)} {...props}>
      {children}
    </div>
  );
};
