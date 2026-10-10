'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  tone?: 'orange' | 'blue' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      tone = 'orange',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 shadow-sm',
      md: 'text-sm px-4 py-2.5 gap-2 shadow-sm',
      lg: 'text-base px-6 py-3.5 gap-2.5 shadow-md',
    }[size];

    let variantStyles = '';

    if (variant === 'primary') {
      if (tone === 'orange') {
        variantStyles =
          'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 hover:shadow-orange-500/30 focus:ring-orange-400';
      } else if (tone === 'blue') {
        variantStyles =
          'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30 focus:ring-blue-400';
      } else {
        variantStyles =
          'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10 focus:ring-slate-400';
      }
    } else if (variant === 'secondary') {
      if (tone === 'blue') {
        variantStyles = 'bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-300';
      } else if (tone === 'orange') {
        variantStyles = 'bg-orange-50 text-orange-700 hover:bg-orange-100 focus:ring-orange-300';
      } else {
        variantStyles = 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300';
      }
    } else if (variant === 'outline') {
      if (tone === 'orange') {
        variantStyles =
          'border border-orange-300 text-orange-600 hover:bg-orange-50 focus:ring-orange-400';
      } else if (tone === 'blue') {
        variantStyles =
          'border border-blue-200 text-blue-600 hover:bg-blue-50 focus:ring-blue-400';
      } else {
        variantStyles =
          'border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-300';
      }
    } else if (variant === 'ghost') {
      variantStyles = 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none';
    } else if (variant === 'danger') {
      variantStyles = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400';
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles, variantStyles, className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
