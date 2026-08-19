'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { X, Check } from 'lucide-react'

interface Props {
  id: string
  filledWord?: string | null
  isOver?: boolean
  onRemove?: () => void
  onTap?: () => void
  isSelectable?: boolean
  status?: 'correct' | 'incorrect' | null
}

export default function DroppableBlank({ id, filledWord, isOver: isOverProp, onRemove, onTap, isSelectable, status }: Props) {
  const { isOver: isDroppableOver, setNodeRef } = useDroppable({
    id,
    disabled: !!filledWord || status !== undefined
  })

  const isOver = isOverProp || isDroppableOver

  if (status) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-3 py-0.5 mx-1 rounded-md border-b-2 text-dark-100 font-bold",
          status === 'correct' ? "border-success bg-success/10" : "border-error bg-error/10"
        )}
      >
        {filledWord}
        {status === 'correct' ? <Check className="w-4 h-4 text-success" /> : <X className="w-4 h-4 text-error" />}
      </span>
    )
  }

  if (filledWord) {
    return (
      <span
        onClick={onRemove}
        className="inline-flex items-center gap-1 px-3 py-0.5 mx-1 rounded-md bg-brand-500 text-white font-bold cursor-pointer hover:bg-brand-600 transition-colors"
      >
        {filledWord}
        <X className="w-3 h-3 opacity-70" />
      </span>
    )
  }

  return (
    <span
      ref={setNodeRef}
      onClick={onTap}
      className={cn(
        "inline-block w-24 h-7 mx-1 align-middle border-b-2 transition-all",
        isOver || isSelectable ? "border-brand-500 bg-brand-500/10" : "border-dark-600 border-dashed",
        isSelectable && "animate-pulse cursor-pointer"
      )}
    />
  )
}
