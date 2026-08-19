'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  href?: string
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  className,
  href,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100'
  
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-glow',
    secondary: 'bg-dark-800 hover:bg-dark-700 text-dark-100 border border-dark-700',
    ghost: 'hover:bg-dark-800/50 text-dark-100',
    danger: 'bg-error hover:bg-error/90 text-white'
  }
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  }

  const combinedClasses = cn(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  )

  const content = (
    <>
      {loading ? <Spinner size="sm" className="mr-1" /> : icon}
      {children}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  )
}
