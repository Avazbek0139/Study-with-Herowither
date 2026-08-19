'use client'

import { useState, useEffect } from 'react'
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SentenceChallengeData } from '@/types'
import DraggableWord from './DraggableWord'
import DroppableBlank from './DroppableBlank'
import { cn } from '@/lib/utils'

interface Props {
  challenge: SentenceChallengeData
  onComplete: (answers: Record<number, string>) => void
}

export default function SentenceChallengeBlock({ challenge, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [checked, setChecked] = useState(false)
  
  // Results
  const [results, setResults] = useState<{correct: boolean, correctWord: string}[] | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window))
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 50, tolerance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && over.id.toString().startsWith('blank-')) {
      const blankIndex = parseInt(over.id.toString().replace('blank-', ''))
      const word = active.id.toString().replace('word-', '')
      
      setAnswers(prev => ({
        ...prev,
        [blankIndex]: word
      }))
    }
  }

  const handleWordTap = (word: string) => {
    if (checked) return
    if (isMobile) {
      if (selectedWord === word) setSelectedWord(null)
      else setSelectedWord(word)
    }
  }

  const handleBlankTap = (index: number) => {
    if (checked) return
    if (isMobile && selectedWord) {
      setAnswers(prev => ({
        ...prev,
        [index]: selectedWord
      }))
      setSelectedWord(null)
    }
  }

  const handleRemove = (index: number) => {
    if (checked) return
    setAnswers(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  const isAllFilled = Object.keys(answers).length === 5

  const handleCheck = () => {
    const res = []
    for (let i = 0; i < 5; i++) {
      res.push({
        correct: answers[i] === challenge.correctMapping[i],
        correctWord: challenge.correctMapping[i]
      })
    }
    setResults(res)
    setChecked(true)
  }

  const handleContinue = () => {
    onComplete(answers)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-dark-100 text-gradient-brand">SENTENCE CHALLENGE</h2>
        <p className="text-dark-400 mt-2">Place the correct word in each blank. One word is extra.</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-4 glass-surface p-6 rounded-2xl">
            {challenge.sentences.map((sentence, i) => {
              const parts = sentence.split('_____')
              const status = results ? (results[i].correct ? 'correct' : 'incorrect') : undefined
              
              return (
                <div key={i} className="text-lg text-dark-100 leading-loose">
                  <span className="text-dark-500 font-mono mr-3">{i + 1}.</span>
                  {parts[0]}
                  <DroppableBlank
                    id={`blank-${i}`}
                    filledWord={answers[i]}
                    onRemove={() => handleRemove(i)}
                    onTap={() => handleBlankTap(i)}
                    isSelectable={isMobile && selectedWord !== null}
                    status={status as any}
                  />
                  {parts[1]}
                  {results && !results[i].correct && (
                    <div className="text-sm text-error mt-1 ml-8">
                      Correct word: <span className="font-bold">{results[i].correctWord}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-4">
            <div className="glass-surface p-6 rounded-2xl sticky top-4">
              <h3 className="font-semibold text-dark-100 mb-4 text-sm uppercase tracking-wider">Word Bank</h3>
              <div className="flex flex-wrap gap-2">
                {challenge.wordBank.map((word) => {
                  const isUsed = Object.values(answers).includes(word)
                  const isExtra = checked && !Object.values(challenge.correctMapping).includes(word)
                  
                  return (
                    <div key={word} className="relative">
                      <DraggableWord
                        id={`word-${word}`}
                        word={word}
                        isUsed={isUsed}
                        isSelected={selectedWord === word}
                        onTap={() => handleWordTap(word)}
                      />
                      {isExtra && (
                        <div className="absolute -top-2 -right-2 bg-dark-700 text-[10px] px-1.5 rounded text-dark-300">
                          Not used
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-8">
                {!checked ? (
                  <button
                    onClick={handleCheck}
                    disabled={!isAllFilled}
                    className="btn-primary w-full py-3 shadow-glow disabled:opacity-50 disabled:shadow-none"
                  >
                    CHECK ANSWERS
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    className="btn-primary w-full py-3 shadow-glow"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </DndContext>
    </div>
  )
}
