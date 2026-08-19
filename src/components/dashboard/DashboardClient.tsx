'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Flame, ClipboardCheck, Target, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import StatsCard from './StatsCard'
import ProgressRing from './ProgressRing'
import { cn } from '@/lib/utils'

export default function DashboardClient() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setIsLoading(false)
      })
      .catch(() => {
        setError(true)
        setIsLoading(false)
      })
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  if (error || !data) {
    return <div className="text-error text-center py-12">Failed to load dashboard data.</div>
  }

  const {
    totalVocabularyCount = 0,
    learnedCount = 0,
    reviewCount = 0,
    testsCompletedCount = 0,
    averageAccuracy = 0,
    currentStreak = 0,
    todayStats = { wordsReviewed: 0, testsCompleted: 0, accuracy: 0 },
    wordsToReview = [],
  } = data

  const dailyGoal = 20
  const dailyProgress = Math.min(100, Math.round((todayStats.wordsReviewed / dailyGoal) * 100)) || 0

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 px-4 rounded-2xl glass-surface relative overflow-hidden shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent z-0" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            STUDY WITH <span className="text-gradient-brand">HERO</span>
          </h1>
          <p className="text-lg md:text-xl text-dark-400 mb-2 max-w-2xl mx-auto">
            Learn words. Understand context. Master English.
          </p>
          <p className="text-sm text-dark-500 mb-8 max-w-xl mx-auto">
            Build your vocabulary through meaningful practice instead of memorizing translations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/learn" className="btn-primary px-8 py-3 w-full sm:w-auto text-center">
              START LEARNING
            </Link>
            <Link href="/test" className="btn-secondary px-8 py-3 w-full sm:w-auto text-center">
              TAKE A TEST
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <motion.section
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <StatsCard icon={BookOpen} value={learnedCount} label="Words Learned" color="brand" delay={0.1} />
        <StatsCard icon={Flame} value={currentStreak} label="Day Streak" color="warning" delay={0.2} />
        <StatsCard icon={ClipboardCheck} value={testsCompletedCount} label="Tests Taken" color="success" delay={0.3} />
        <StatsCard icon={Target} value={`${averageAccuracy}%`} label="Accuracy" color="brand" delay={0.4} />
        <StatsCard icon={RefreshCw} value={reviewCount} label="To Review" color="warning" delay={0.5} />
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Today's Progress */}
        <section className="md:col-span-1 rounded-2xl glass-surface p-6 shadow-card flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-6 w-full text-left">Today&apos;s Progress</h2>
          <ProgressRing progress={dailyProgress} size={160} strokeWidth={12}>
            <div className="text-center">
              <span className="text-3xl font-bold text-dark-100">{todayStats.wordsReviewed}</span>
              <span className="text-dark-400 text-sm block">/ {dailyGoal} words</span>
            </div>
          </ProgressRing>
          <div className="w-full mt-8 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-400">Tests today</span>
              <span className="font-semibold text-dark-100">{todayStats.testsCompleted}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-dark-400">Today&apos;s accuracy</span>
              <span className="font-semibold text-dark-100">{todayStats.accuracy}%</span>
            </div>
          </div>
        </section>

        {/* Continue Learning */}
        <section className="md:col-span-2 rounded-2xl glass-surface p-6 shadow-card">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold">Continue Learning</h2>
              <p className="text-dark-400 text-sm mt-1">Words due for review</p>
            </div>
            {wordsToReview.length > 0 && (
              <Link
                href="/vocabulary?filter=review"
                className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors"
              >
                View all
              </Link>
            )}
          </div>

          {wordsToReview.length === 0 ? (
            <div className="text-center py-12 bg-dark-900/50 rounded-xl border border-dark-700/50">
              <p className="text-dark-400 mb-4">
                {totalVocabularyCount === 0
                  ? 'Add some vocabulary to get started'
                  : "You're all caught up!"}
              </p>
              <Link href="/vocabulary/add" className="btn-primary inline-flex items-center gap-2">
                Add New Vocabulary
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wordsToReview.slice(0, 8).map((word: any) => (
                <Link
                  key={word.id}
                  href={`/vocabulary?search=${word.word}`}
                  className="p-4 rounded-xl bg-dark-900/50 border border-dark-700 hover:border-brand-500/50 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-dark-100 group-hover:text-brand-400 transition-colors">
                        {word.word}
                      </h3>
                      <p className="text-sm text-dark-400 truncate max-w-[150px]">
                        {word.translation || 'No translation'}
                      </p>
                    </div>
                    <div
                      className={cn(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        (word.progress?.confidenceScore || 0) > 0.7
                          ? 'bg-success/20 text-success'
                          : (word.progress?.confidenceScore || 0) > 0.4
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      )}
                    >
                      {Math.round((word.progress?.confidenceScore || 0) * 100)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Feedback Banner */}
      <section className="glass-surface p-6 rounded-2xl border border-dark-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-dark-100">Fikringiz, taklif yoki shikoyatingiz bormi?</h3>
            <p className="text-xs text-dark-400">Bizga to&apos;g&apos;ridan-to&apos;g&apos;ri yozing — xabaringiz Telegram orqali adminga boradi.</p>
          </div>
        </div>
        <Link href="/feedback" className="btn-secondary text-xs px-5 py-2.5 whitespace-nowrap text-brand-400 hover:text-brand-300">
          Taklif / Shikoyat yuborish
        </Link>
      </section>
    </div>
  )
}
