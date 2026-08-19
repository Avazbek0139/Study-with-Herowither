'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export type SliderProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  showValue?: boolean
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, showValue = true, min = 0, max = 100, step = 1, value, onChange, className, id, ...props }, ref) => {
    const generatedId = React.useId()
    const sliderId = id || generatedId
    
    const percentage = ((Number(value) - Number(min)) / (Number(max) - Number(min))) * 100

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {(label || showValue) && (
          <div className="flex justify-between items-center text-sm font-medium text-dark-100">
            {label && <label htmlFor={sliderId}>{label}</label>}
            {showValue && <span className="text-dark-400">{value}</span>}
          </div>
        )}
        <div className="relative flex items-center w-full h-5">
          {/* Custom Track */}
          <div className="absolute w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 rounded-full" 
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Native Input Range hidden mostly but interactive */}
          <input
            id={sliderId}
            type="range"
            ref={ref}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            {...props}
          />
          {/* Custom Thumb - driven by state */}
          <div 
            className="absolute w-4 h-4 bg-white rounded-full shadow-md border-2 border-brand-500 pointer-events-none -ml-2"
            style={{ left: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)

Slider.displayName = 'Slider'
