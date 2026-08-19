'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn, formatDate, formatTime } from '@/lib/utils'
import { Settings, Brain, Zap, Target, BookOpen, FileText, Type, AlertTriangle, CheckCircle, Clock, Award, ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function TestConfigurationPage() {
  const router = useRouter()
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [questionType, setQuestionType] = useState('mixed')
  const [difficulty, setDifficulty] = useState('normal')
  const [isLoading, setIsLoading] = useState(false)
  const [availableWords, setAvailableWords] = useState(0)
  const [isFetching, setIsFetching] = useState(true)
  const [pastTests, setPastTests] = useState<any[]>([])

  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/vocabulary?limit=1').then(res => res.json()).catch(() => ({ total: 0 })),
      fetch('/api/test').then(res => res.json()).catch(() => ({ tests: [] }))
    ]).then(([vocabData, testData]) => {
      setAvailableWords(vocabData.total || 0)
      setPastTests(testData.tests || [])
      setIsFetching(false)
    }).catch(() => {
      setAvailableWords(0)
      setIsFetching(false)
    })
  }, [])

  const startTest = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalQuestions, questionTypes: questionType, difficulty })
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'Not enough words') {
          setError(`You need at least ${data.requiredWords || 4} words to start a test. You have ${data.availableWords || 0}.`)
        } else {
          setError(data.error || 'Failed to create test')
        }
        setIsLoading(false)
        return
      }
      router.push(`/test/${data.testId}`)
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
      setIsLoading(false)
    }
  }

  if (isFetching) return <div className="p-8 text-center text-dark-400">Loading...</div>

  if (availableWords < 4) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-4">
        <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 shadow-card">
          <BookOpen className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-100">Not Enough Words</h2>
          <p className="text-dark-400">
            You need at least 4 vocabulary words to take a test. You currently have {availableWords}.
          </p>
          <button onClick={() => router.push('/vocabulary/add')} className="btn-primary mt-6 w-full">
            Add Words
          </button>
        </div>
      </div>
    )
  }

  const getWordCountWarning = () => {
    if (availableWords < 10) {
      return {
        type: 'orange',
        icon: AlertTriangle,
        title: `⚠️ You only have ${availableWords} words`,
        message: 'Your test will have repeated questions. Add more words for a better experience.',
        showAddButton: true,
        bgClass: 'bg-orange-500/10 border-orange-500/30',
        textClass: 'text-orange-400',
        titleClass: 'text-orange-300',
      }
    }
    if (availableWords < 20) {
      return {
        type: 'yellow',
        icon: AlertTriangle,
        title: `📝 You have ${availableWords} words`,
        message: 'The test will work, but adding more words (20+) will give you better variety and more accurate results.',
        showAddButton: true,
        bgClass: 'bg-yellow-500/10 border-yellow-500/30',
        textClass: 'text-yellow-400',
        titleClass: 'text-yellow-300',
      }
    }
    return {
      type: 'green',
      icon: CheckCircle,
      title: `✅ ${availableWords} words available`,
      message: 'Great! You have enough words for a quality test.',
      showAddButton: false,
      bgClass: 'bg-emerald-500/10 border-emerald-500/30',
      textClass: 'text-emerald-400',
      titleClass: 'text-emerald-300',
    }
  }

  const warning = getWordCountWarning()

  const types = [
    { id: 'mixed', label: 'Mixed', icon: Zap, recommended: true },
    { id: 'translation', label: 'Translation', icon: BookOpen },
    { id: 'multiple_choice', label: 'Multiple Choice', icon: Target },
    { id: 'sentence_challenge', label: 'Sentence Challenge', icon: FileText },
    { id: 'spelling', label: 'Spelling', icon: Type },
    { id: 'context', label: 'Context', icon: Brain },
  ]

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-100">Create a Test</h1>
        <p className="text-dark-400 mt-2">Configure your custom learning challenge or view past results.</p>
      </div>

      {/* Word count warning banner */}
      <div className={`p-4 rounded-xl border ${warning.bgClass} flex items-start gap-3`}>
        <warning.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${warning.textClass}`} />
        <div className="flex-1">
          <p className={`font-semibold ${warning.titleClass}`}>{warning.title}</p>
          <p className={`text-sm mt-1 ${warning.textClass} opacity-80`}>{warning.message}</p>
          {warning.showAddButton && (
            <button
              onClick={() => router.push('/vocabulary/add')}
              className={`mt-3 px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${warning.textClass} border-current/30 hover:bg-white/5`}
            >
              + Add More Words
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <section className="glass-surface p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-dark-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-500" />
            Number of Questions
          </h2>
          <div>
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between mt-2 text-xs text-dark-500">
              <span>20</span><span>25</span><span>30</span><span>35</span><span>40</span><span>45</span><span>50</span>
            </div>
            <div className="mt-4 text-center font-medium text-brand-400">
              Selected: {totalQuestions} questions
            </div>
          </div>
        </section>

        <section className="glass-surface p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-dark-100 flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-500" />
            Question Type
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {types.map(t => (
              <button
                key={t.id}
                onClick={() => setQuestionType(t.id)}
                className={cn(
                  "p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative",
                  questionType === t.id 
                    ? "bg-brand-500/10 border-brand-500 shadow-glow text-brand-400" 
                    : "bg-dark-800 border-dark-700 text-dark-400 hover:border-dark-600 hover:bg-dark-750"
                )}
              >
                {t.recommended && (
                  <span className="absolute -top-2 -right-2 bg-brand-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    REC
                  </span>
                )}
                <t.icon className="w-6 h-6" />
                <span className="text-sm font-medium text-center">{t.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-surface p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-dark-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-500" />
            Difficulty
          </h2>
          <div className="flex gap-4">
            {['easy', 'normal', 'hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 p-3 rounded-lg border capitalize transition-all",
                  difficulty === d 
                    ? "bg-brand-500 text-white border-brand-500 shadow-glow" 
                    : "bg-dark-800 border-dark-700 text-dark-400 hover:bg-dark-750"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </section>

        <div className="pt-4">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <button
            onClick={startTest}
            disabled={isLoading || availableWords < 4}
            className="w-full py-4 rounded-xl bg-brand-500 text-white font-bold text-lg hover:bg-brand-400 transition-all shadow-glow flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'CREATING...' : 'START TEST'}
          </button>
          <p className="text-center text-dark-500 mt-4 text-sm">
            You have {availableWords} words available {availableWords < 4 && '(minimum 4 required)'}
          </p>
        </div>
      </div>

      {/* Past Tests & Results Section */}
      {pastTests.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-brand-400" />
              Recent Test Results & Analysis
            </h2>
            <span className="text-xs text-dark-400">{pastTests.length} tests</span>
          </div>

          <div className="space-y-3">
            {pastTests.map((t: any) => (
              <div
                key={t.id}
                className="p-4 rounded-xl glass-surface border border-dark-700/80 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-full uppercase",
                      t.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" : "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {t.status}
                    </span>
                    <span className="text-xs text-dark-400">
                      {formatDate(t.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-dark-100 flex items-center gap-3">
                    <span>Score: {t.correctAnswers}/{t.totalQuestions} ({Math.round(t.accuracy)}%)</span>
                    {t.timeTaken ? (
                      <span className="text-xs text-dark-400 flex items-center gap-1 font-normal">
                        <Clock className="w-3 h-3" /> {formatTime(t.timeTaken)}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/test/${t.id}/results`}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 text-brand-400 hover:text-brand-300"
                  >
                    <span>View Analysis</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
