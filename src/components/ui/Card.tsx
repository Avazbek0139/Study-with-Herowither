'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'interactive' | 'glass' | 'bordered'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-xl overflow-hidden'
  
  const variants = {
    default: 'bg-dark-900 border border-dark-800 shadow-card',
    interactive: 'bg-dark-900 border border-dark-800 shadow-card hover:-translate-y-1 hover:shadow-glow hover:border-brand-500/30 transition-all duration-300 cursor-pointer',
    glass: 'glass-surface',
    bordered: 'bg-transparent border border-dark-700'
  }
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={cn(baseClasses, variants[variant], paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}
