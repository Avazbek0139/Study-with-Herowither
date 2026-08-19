'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QuestionBlock from '@/components/test/QuestionBlock'
import BlockTransition from '@/components/test/BlockTransition'
import { formatTime } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export default function ActiveTestPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<any>(null)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [blocks, setBlocks] = useState<any[]>([])
  const [showingTransition, setShowingTransition] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/test/${params.id}`)
        const data = await res.json()
        if (data.status === 'completed') {
          router.push(`/test/${params.id}/results`)
          return
        }
        
        // Group into blocks of 5
        const blockMap = new Map()
        data.questions.forEach((q: any) => {
          if (!blockMap.has(q.blockNumber)) blockMap.set(q.blockNumber, [])
          blockMap.get(q.blockNumber).push(q)
        })
        
        const sortedBlocks = Array.from(blockMap.keys()).sort().map(bn => blockMap.get(bn))
        setBlocks(sortedBlocks)
        setTest(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchTest()
  }, [params.id, router])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTaken(t => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!test || blocks.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    )
  }

  const handleBlockComplete = () => {
    if (currentBlockIndex < blocks.length - 1) {
      setShowingTransition(true)
    } else {
      finishTest()
    }
  }

  const handleNextBlock = () => {
    setShowingTransition(false)
    setCurrentBlockIndex(prev => prev + 1)
  }

  const finishTest = async () => {
    try {
      await fetch(`/api/test/${params.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeTaken })
      })
      router.push(`/test/${params.id}/results`)
    } catch (err) {
      console.error(err)
    }
  }

  const completedQuestions = currentBlockIndex * 5 // approximate
  const progressPercent = (completedQuestions / test.totalQuestions) * 100

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col min-h-screen">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="text-sm font-bold text-dark-400">
            TEST {currentBlockIndex + 1} OF {blocks.length}
          </div>
          <div className="text-dark-100 text-xl font-bold font-mono">
            {formatTime(timeTaken)}
          </div>
        </div>
        <div className="w-1/2">
          <div className="flex justify-between text-xs text-dark-400 mb-1">
            <span>Progress</span>
            <span>{Math.min(completedQuestions, test.totalQuestions)} / {test.totalQuestions}</span>
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        {showingTransition ? (
          <BlockTransition 
            completedCount={5}
            totalInBlock={5}
            blockNumber={currentBlockIndex + 1}
            totalBlocks={blocks.length}
            onContinue={handleNextBlock}
          />
        ) : (
          <div className="w-full">
            <QuestionBlock 
              questions={blocks[currentBlockIndex]} 
              blockNumber={currentBlockIndex + 1}
              onComplete={handleBlockComplete}
              isActive={true}
              testId={params.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
