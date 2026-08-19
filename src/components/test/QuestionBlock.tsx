'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import SentenceChallengeBlock from './SentenceChallengeBlock'

interface Props {
  questions: any[]
  blockNumber: number
  onComplete: () => void
  isActive: boolean
  testId: string
}

export default function QuestionBlock({ questions, blockNumber, onComplete, isActive, testId }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{isCorrect: boolean, correctAnswer: string} | null>(null)
  
  const isSentenceChallengeBlock = questions.length === 1 && questions[0].type === 'sentence_challenge'

  const currentQ = questions[currentIndex]

  const submitAnswer = async (userAnswer: string) => {
    if (submitting) return
    setSubmitting(true)
    
    try {
      const res = await fetch(`/api/test/${testId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: currentQ.id, userAnswer })
      })
      const data = await res.json()
      
      setFeedback(data)
      
      setTimeout(() => {
        setFeedback(null)
        setSubmitting(false)
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1)
        } else {
          onComplete()
        }
      }, 1500) // Show feedback for 1.5s
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  const handleSentenceChallengeComplete = async (answers: Record<number, string>) => {
    await submitAnswer(JSON.stringify(answers))
    // Sentence challenge handles its own feedback inside, but we move on after.
    // wait a tiny bit to let its animations finish or user to click continue?
    // Actually the submitAnswer above will auto advance after 1.5s but SC might need manual advance.
    // Let's adapt: for SC we don't show the 1.5s timeout.
  }

  if (isSentenceChallengeBlock) {
    return (
      <SentenceChallengeBlock 
        challenge={currentQ.questionData} 
        onComplete={async (ans) => {
          await fetch(`/api/test/${testId}/answer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId: currentQ.id, userAnswer: JSON.stringify(ans) })
          })
          onComplete()
        }} 
      />
    )
  }

  // Regular questions
  const qData = currentQ.questionData

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-right text-dark-500 font-medium">
        Question {currentIndex + 1} / {questions.length}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-surface p-8 rounded-2xl"
        >
          {qData.sentence && (
            <h2 className="text-2xl font-medium text-dark-100 mb-8 leading-relaxed">
              {qData.sentence}
            </h2>
          )}
          {!qData.sentence && qData.question && (
            <h2 className="text-2xl font-bold text-dark-100 mb-8 text-center">
              {qData.question}
            </h2>
          )}
          
          {(currentQ.type === 'translation' || currentQ.type === 'multiple_choice' || currentQ.type === 'context') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qData.options.map((opt: string, i: number) => {
                let btnClass = "p-4 rounded-xl border border-dark-700 bg-dark-800 text-dark-100 hover:bg-dark-700 transition-all text-lg font-medium text-center"
                
                if (feedback) {
                  if (opt === feedback.correctAnswer) {
                    btnClass = "p-4 rounded-xl border border-success bg-success/10 text-success text-lg font-medium text-center"
                  } else if (opt !== feedback.correctAnswer) {
                    btnClass = "p-4 rounded-xl border border-dark-700 bg-dark-800/50 text-dark-500 text-lg font-medium text-center opacity-50"
                  }
                }
                
                return (
                  <button
                    key={i}
                    disabled={submitting}
                    onClick={() => submitAnswer(opt)}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {currentQ.type === 'spelling' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const val = (e.target as any).elements.answer.value
              submitAnswer(val)
            }} className="space-y-4 text-center">
              <input
                name="answer"
                type="text"
                disabled={submitting}
                className="input-field text-center text-xl p-4 w-full"
                placeholder="Type the word here..."
                autoFocus
                autoComplete="off"
              />
              {feedback && (
                <div className={cn("text-lg font-bold", feedback.isCorrect ? "text-success" : "text-error")}>
                  {feedback.isCorrect ? 'Correct!' : `Correct answer: ${feedback.correctAnswer}`}
                </div>
              )}
              <button disabled={submitting} className="btn-primary w-full py-4 text-lg hidden">
                Check
              </button>
            </form>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}
