import React from 'react';

export type BadgeVariant = 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral' 
  | 'teal';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = ''
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dotColor: string }> = {
    primary: {
      bg: 'bg-primary-light',
      text: 'text-primary-dark font-semibold',
      border: 'border-red-200',
      dotColor: 'bg-primary'
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800 font-semibold',
      border: 'border-emerald-200',
      dotColor: 'bg-emerald-600'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800 font-semibold',
      border: 'border-amber-200',
      dotColor: 'bg-amber-600'
    },
    danger: {
      bg: 'bg-rose-50',
      text: 'text-rose-800 font-semibold',
      border: 'border-rose-200',
      dotColor: 'bg-rose-600'
    },
    info: {
      bg: 'bg-blue-50',
      text: 'text-blue-800 font-semibold',
      border: 'border-blue-200',
      dotColor: 'bg-blue-600'
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-800 font-semibold',
      border: 'border-teal-200',
      dotColor: 'bg-teal-600'
    },
    neutral: {
      bg: 'bg-slate-100',
      text: 'text-slate-700 font-medium',
      border: 'border-slate-200',
      dotColor: 'bg-slate-500'
    }
  };

  const style = variantStyles[variant];
  const sizeStyles = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeStyles} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`}></span>}
      {children}
    </span>
  );
};

