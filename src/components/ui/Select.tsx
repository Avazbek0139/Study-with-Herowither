'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export type SelectOption = {
  value: string
  label: string
}

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  options: SelectOption[]
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || generatedId

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-dark-100">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex h-10 w-full appearance-none rounded-lg border border-dark-700 bg-dark-900 px-3 py-2 pr-10 text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              error && 'border-error focus:border-error focus:ring-error/50'
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 pointer-events-none" />
        </div>
        {error && (
          <p id={`${selectId}-error`} className="text-sm text-error mt-0.5">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
