'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface Props {
  completedCount: number
  totalInBlock: number
  blockNumber: number
  totalBlocks: number
  onContinue: () => void
}

const phrases = ['Great job!', 'Solid work.', 'Keep it up.', 'Moving on...', 'Excellent!']

export default function BlockTransition({ completedCount, totalInBlock, blockNumber, totalBlocks, onContinue }: Props) {
  const btnRef = useRef<HTMLButtonElement>(null)
  
  useEffect(() => {
    btnRef.current?.focus()
  }, [])

  const randomPhrase = phrases[blockNumber % phrases.length]

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-surface p-12 rounded-2xl flex flex-col items-center text-center max-w-md mx-auto w-full"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
      >
        <CheckCircle className="w-24 h-24 text-success mb-6" />
      </motion.div>
      
      <h2 className="text-3xl font-bold text-dark-100 mb-2">
        {completedCount} / {totalInBlock} COMPLETE
      </h2>
      <p className="text-xl text-dark-400 mb-8">{randomPhrase}</p>

      <button
        ref={btnRef}
        onClick={onContinue}
        className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
      >
        Next challenge →
      </button>
    </motion.div>
  )
}
