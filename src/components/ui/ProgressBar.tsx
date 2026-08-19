'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export type ProgressBarProps = {
  value: number // 0 to 100
  size?: 'sm' | 'md'
  color?: 'brand' | 'success' | 'warning' | 'error'
  animated?: boolean
  className?: string
}

export function ProgressBar({
  value,
  size = 'md',
  color = 'brand',
  animated = true,
  className
}: ProgressBarProps) {
  const boundedValue = Math.min(100, Math.max(0, value))
  
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5'
  }
  
  const colors = {
    brand: 'bg-gradient-to-r from-brand-500 to-[#a78bfa]',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
  }

  return (
    <div className={cn("w-full bg-dark-800 rounded-full overflow-hidden", sizes[size], className)}>
      <motion.div
        className={cn("h-full rounded-full", colors[color])}
        initial={animated ? { width: 0 } : { width: `${boundedValue}%` }}
        animate={{ width: `${boundedValue}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  )
}
