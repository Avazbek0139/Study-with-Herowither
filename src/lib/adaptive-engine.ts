import prisma from '@/lib/prisma'

export async function updateProgress(vocabularyId: string, userId: string, isCorrect: boolean) {
  const existingProgress = await prisma.vocabularyProgress.findUnique({
    where: { vocabularyId }
  })

  const now = new Date()

  if (existingProgress) {
    const correctCount = existingProgress.correctCount + (isCorrect ? 1 : 0)
    const wrongCount = existingProgress.wrongCount + (isCorrect ? 0 : 1)
    const attempts = correctCount + wrongCount
    const accuracy = attempts > 0 ? correctCount / attempts : 0

    const oldConfidence = existingProgress.confidenceScore || 0
    const newConfidence = oldConfidence * 0.7 + (isCorrect ? 1 : 0) * 0.3

    let intervalDays = 1
    if (isCorrect) {
      if (existingProgress.lastReviewed && existingProgress.nextReviewDate) {
        const lastInterval = (existingProgress.nextReviewDate.getTime() - existingProgress.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
        intervalDays = Math.max(1, Math.round(lastInterval * 2))
      } else {
        intervalDays = 2
      }
    } else {
      intervalDays = 1
    }

    const nextReviewDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000)
    const shouldMarkLearned = attempts >= 5 && newConfidence > 0.85

    // Update progress record
    const updated = await prisma.vocabularyProgress.update({
      where: { id: existingProgress.id },
      data: {
        correctCount,
        wrongCount,
        accuracy,
        attempts,
        confidenceScore: newConfidence,
        lastReviewed: now,
        nextReviewDate,
      }
    })

    // Update vocabulary isLearned status
    if (shouldMarkLearned) {
      await prisma.vocabulary.update({
        where: { id: vocabularyId },
        data: { isLearned: true }
      })
    }

    return updated
  } else {
    const newConfidence = isCorrect ? 0.3 : 0
    const nextReviewDate = new Date(now.getTime() + (isCorrect ? 2 : 1) * 24 * 60 * 60 * 1000)

    return await prisma.vocabularyProgress.create({
      data: {
        vocabularyId,
        userId,
        correctCount: isCorrect ? 1 : 0,
        wrongCount: isCorrect ? 0 : 1,
        accuracy: isCorrect ? 1 : 0,
        attempts: 1,
        confidenceScore: newConfidence,
        lastReviewed: now,
        nextReviewDate,
      }
    })
  }
}

export async function getWordsToReview(userId: string) {
  const now = new Date()
  const words = await prisma.vocabulary.findMany({
    where: {
      userId,
      OR: [
        {
          progress: {
            nextReviewDate: { lte: now }
          }
        },
        {
          progress: {
            confidenceScore: { lt: 0.4 }
          }
        },
        {
          progress: null
        }
      ]
    },
    include: { progress: true }
  })

  return words.sort((a, b) => {
    const confA = a.progress?.confidenceScore || 0
    const confB = b.progress?.confidenceScore || 0
    return confA - confB
  })
}

export async function calculateStreak(userId: string): Promise<number> {
  const tests = await prisma.test.findMany({
    where: {
      userId,
      status: 'completed'
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  })

  if (tests.length === 0) return 0

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const testDates = new Set(
    tests.map(t => {
      const d = new Date(t.createdAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    checkDate.setHours(0, 0, 0, 0)

    if (testDates.has(checkDate.getTime())) {
      streak++
    } else if (i > 0) {
      break
    }
    // Skip today if no activity yet (don't break the streak)
  }

  return streak
}
