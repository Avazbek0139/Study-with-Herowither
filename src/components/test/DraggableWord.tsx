'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

interface Props {
  id: string
  word: string
  isUsed?: boolean
  isSelected?: boolean
  onTap?: () => void
}

export default function DraggableWord({ id, word, isUsed, isSelected, onTap }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: isUsed
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isUsed ? {} : listeners)}
      {...(isUsed ? {} : attributes)}
      onClick={onTap}
      className={cn(
        "px-4 py-2 rounded-full border text-sm font-medium transition-all select-none",
        isUsed ? "bg-dark-900 border-dark-800 text-dark-600 opacity-50 line-through cursor-not-allowed" : "cursor-grab active:cursor-grabbing bg-dark-800 border-dark-600 text-dark-100 hover:border-dark-500",
        isDragging && "scale-105 shadow-xl border-brand-500 bg-brand-500/10 z-50",
        isSelected && "border-brand-500 shadow-glow bg-brand-500/20"
      )}
    >
      {word}
    </div>
  )
}
