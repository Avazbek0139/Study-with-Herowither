'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export type ToastProps = {
  id: string
  message: string
  type?: ToastType
  onClose: (id: string) => void
}

const icons = {
  success: <CheckCircle2 className="text-success w-5 h-5" />,
  error: <AlertCircle className="text-error w-5 h-5" />,
  info: <Info className="text-brand-400 w-5 h-5" />,
  warning: <AlertTriangle className="text-warning w-5 h-5" />
}

const backgrounds = {
  success: 'bg-success/10 border-success/20',
  error: 'bg-error/10 border-error/20',
  info: 'bg-brand-500/10 border-brand-500/20',
  warning: 'bg-warning/10 border-warning/20'
}

export function Toast({ id, message, type = 'info', onClose }: ToastProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-card pointer-events-auto",
        backgrounds[type]
      )}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium text-dark-100 pr-4">
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="ml-auto flex-shrink-0 text-dark-400 hover:text-dark-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
