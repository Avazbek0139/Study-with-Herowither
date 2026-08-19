'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type LogoProps = {
  variant?: 'full' | 'compact' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ variant = 'full', size = 'md', className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  }

  const iconPaths = (
    <>
      <path d="M12 8L24 14L36 8V22C36 30 30 36 24 40C18 36 12 30 12 22V8Z" stroke="url(#heroGradient)" strokeWidth="3" strokeLinejoin="round"/>
      <path d="M24 14L24 38" stroke="url(#heroGradient)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 20L24 14L32 20" stroke="url(#heroGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  )

  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 select-none", className)}>
      <svg className={cn(sizeClasses[size], "w-auto")} viewBox={variant === 'full' ? "0 0 200 48" : "0 0 48 48"} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        
        {(variant === 'full' || variant === 'compact') && (
          <g transform={variant === 'full' ? "translate(0, 4) scale(0.833)" : ""}>
            {iconPaths}
          </g>
        )}

        {(variant === 'full' || variant === 'text') && (
          <g transform={variant === 'full' ? "" : "translate(-40, 0)"}>
            <text x="46" y="29" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="14" fill="#94a3b8">Study with</text>
            <text x="124" y="29" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="20" fill="url(#heroGradient)">HERO</text>
          </g>
        )}
      </svg>
    </Link>
  )
}
