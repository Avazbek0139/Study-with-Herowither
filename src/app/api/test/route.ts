export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateTestQuestions } from '@/lib/question-generator'
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tests = await prisma.test.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        totalQuestions: true,
        correctAnswers: true,
        accuracy: true,
        timeTaken: true,
        difficulty: true,
        questionTypes: true,
        status: true,
        createdAt: true,
      },
      take: 20
    })

    return NextResponse.json({ tests })
  } catch (error) {
    console.error('Fetch tests error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { totalQuestions, questionTypes, difficulty } = await req.json()

    const words = await prisma.vocabulary.findMany({
      where: { userId: session.user.id }
    })

    if (words.length < 4) {
      return NextResponse.json({ 
        error: 'Not enough words', 
        availableWords: words.length,
        requiredWords: 4
      }, { status: 400 })
    }

    const test = await prisma.test.create({
      data: {
        userId: session.user.id,
        totalQuestions,
        questionTypes,
        difficulty,
        status: 'in_progress',
      }
    })

    const questions = generateTestQuestions(words as any, {
      totalQuestions,
      questionTypes,
      difficulty
    })

    for (const q of questions) {
      await prisma.testQuestion.create({
        data: {
          testId: test.id,
          type: q.type,
          questionData: JSON.stringify(q.questionData),
          correctAnswer: q.correctAnswer,
          blockNumber: q.blockNumber,
          orderInBlock: q.orderInBlock
        }
      })
    }

    return NextResponse.json({
      testId: test.id,
      totalQuestions,
      totalBlocks: Math.ceil(totalQuestions / 5)
    })
  } catch (error) {
    console.error('Test creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

