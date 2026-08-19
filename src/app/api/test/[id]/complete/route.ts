export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { timeTaken } = await req.json()

    const test = await prisma.test.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { questions: true }
    })
    
    if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let correctCount = 0
    const incorrectWords: any[] = []

    for (const q of test.questions) {
      if (q.type === 'sentence_challenge') {
        if (q.isCorrect) correctCount += 5
        else {
           // We'll just approximate for now or read from parsed answer
           const userAns = q.userAnswer ? JSON.parse(q.userAnswer) : {}
           const correctMap = JSON.parse(q.correctAnswer)
           for (let i = 0; i < 5; i++) {
             if (userAns[i] === correctMap[i]) correctCount++
             else {
               incorrectWords.push({
                 word: correctMap[i],
                 yourAnswer: userAns[i] || 'None',
                 correctAnswer: correctMap[i]
               })
             }
           }
        }
      } else {
        if (q.isCorrect) correctCount++
        else {
          incorrectWords.push({
            word: q.correctAnswer,
            yourAnswer: q.userAnswer || 'None',
            correctAnswer: q.correctAnswer
          })
        }
      }
    }

    const accuracy = Math.round((correctCount / test.totalQuestions) * 100)

    await prisma.test.update({
      where: { id: params.id },
      data: {
        status: 'completed',
        correctAnswers: correctCount,
        accuracy,
        timeTaken
      }
    })

    // create review items
    for (const item of incorrectWords) {
      const voc = await prisma.vocabulary.findFirst({
        where: { userId: session.user.id, word: item.correctAnswer }
      })
      if (voc) {
        await prisma.reviewItem.create({
          data: {
            userId: session.user.id,
            vocabularyId: voc.id,
            reason: 'Failed in test'
          }
        })
      }
    }

    return NextResponse.json({ 
      testId: test.id,
      totalQuestions: test.totalQuestions,
      correctAnswers: correctCount,
      accuracy,
      timeTaken,
      incorrectWords
    })
  } catch (error) {
    console.error('Complete test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
