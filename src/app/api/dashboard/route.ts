export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all user vocabulary with progress
    const vocabularies = await prisma.vocabulary.findMany({
      where: { userId },
      include: { progress: true },
      orderBy: { createdAt: 'desc' },
    })

    const totalVocabularyCount = vocabularies.length
    let learnedCount = 0
    let reviewCount = 0

    const wordsToReview: typeof vocabularies = []
    const now = new Date()

    for (const vocab of vocabularies) {
      if (vocab.isLearned) {
        learnedCount++
      }

      if (vocab.progress) {
        const needsReview =
          (vocab.progress.confidenceScore < 0.5 && vocab.progress.attempts > 0) ||
          (vocab.progress.nextReviewDate && new Date(vocab.progress.nextReviewDate) <= now)

        if (needsReview) {
          reviewCount++
          wordsToReview.push(vocab)
        }
      }
    }

    // Sort words to review by confidence score ascending
    wordsToReview.sort((a, b) => {
      return (a.progress?.confidenceScore || 0) - (b.progress?.confidenceScore || 0)
    })

    // Fetch completed tests
    const tests = await prisma.test.findMany({
      where: { userId, status: 'completed' },
      orderBy: { createdAt: 'desc' },
    })

    const testsCompletedCount = tests.length

    // Calculate average accuracy
    const totalAccuracy = tests.reduce((acc, t) => acc + (t.accuracy || 0), 0)
    const averageAccuracy = testsCompletedCount > 0 ? Math.round(totalAccuracy / testsCompletedCount) : 0
    const bestAccuracy = testsCompletedCount > 0 ? Math.round(Math.max(...tests.map(t => t.accuracy || 0))) : 0

    // Calculate streak
    let currentStreak = 0
    const testDates = new Set(
      tests.map(t => new Date(t.createdAt).toDateString())
    )

    const checkDate = new Date()
    while (true) {
      if (testDates.has(checkDate.toDateString())) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (currentStreak === 0 && new Date().toDateString() === checkDate.toDateString()) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysTests = tests.filter(t => new Date(t.createdAt) >= today)
    const todaysAccuracy = todaysTests.length > 0
      ? Math.round(todaysTests.reduce((acc, t) => acc + (t.accuracy || 0), 0) / todaysTests.length)
      : 0
    const wordsReviewedToday = todaysTests.reduce((acc, t) => acc + t.totalQuestions, 0)

    return NextResponse.json({
      totalVocabularyCount,
      learnedCount,
      reviewCount,
      testsCompletedCount,
      averageAccuracy,
      bestAccuracy,
      currentStreak,
      todayStats: {
        testsCompleted: todaysTests.length,
        accuracy: todaysAccuracy,
        wordsReviewed: wordsReviewedToday,
      },
      wordsToReview: wordsToReview.slice(0, 20),
      recentVocabulary: vocabularies.slice(0, 8),
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

