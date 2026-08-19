export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const test = await prisma.test.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        questions: {
          orderBy: [
            { blockNumber: 'asc' },
            { orderInBlock: 'asc' }
          ]
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const isComplete = test.status === 'completed'

    // Build questions list with parsed data
    const questions = test.questions.map(q => ({
      id: q.id,
      testId: q.testId,
      type: q.type,
      questionData: JSON.parse(q.questionData),
      correctAnswer: isComplete ? q.correctAnswer : undefined,
      userAnswer: q.userAnswer,
      isCorrect: q.isCorrect,
      blockNumber: q.blockNumber,
      orderInBlock: q.orderInBlock,
      explanation: q.explanation
    }))

    // If completed, build full results data for the results page
    if (isComplete) {
      const mistakes: Array<{
        word: string
        question: string
        userAnswer: string
        correctAnswer: string
      }> = []

      const allAnswers: Array<{
        word: string
        question: string
        userAnswer: string
        correctAnswer: string
        isCorrect: boolean
        type: string
      }> = []

      for (const q of questions) {
        if (q.type === 'sentence_challenge') {
          // Parse sentence challenge answers
          const userAns = q.userAnswer ? JSON.parse(q.userAnswer) : {}
          const correctMap = q.correctAnswer ? JSON.parse(q.correctAnswer) : {}
          const qd = q.questionData as any

          for (let i = 0; i < (qd.sentences?.length || 5); i++) {
            const sentenceText = qd.sentences?.[i] || `Sentence ${i + 1}`
            const correct = correctMap[i] || ''
            const user = userAns[i] || 'No answer'
            const wasCorrect = user === correct

            allAnswers.push({
              word: correct,
              question: sentenceText,
              userAnswer: user,
              correctAnswer: correct,
              isCorrect: wasCorrect,
              type: 'sentence_challenge'
            })

            if (!wasCorrect) {
              mistakes.push({
                word: correct,
                question: sentenceText,
                userAnswer: user,
                correctAnswer: correct
              })
            }
          }
        } else {
          const qd = q.questionData as any
          const questionText = qd.question || qd.sentence || ''
          const wasCorrect = q.isCorrect === true

          allAnswers.push({
            word: q.correctAnswer || '',
            question: questionText,
            userAnswer: q.userAnswer || 'No answer',
            correctAnswer: q.correctAnswer || '',
            isCorrect: wasCorrect,
            type: q.type
          })

          if (!wasCorrect) {
            mistakes.push({
              word: q.correctAnswer || '',
              question: questionText,
              userAnswer: q.userAnswer || 'No answer',
              correctAnswer: q.correctAnswer || ''
            })
          }
        }
      }

      return NextResponse.json({
        id: test.id,
        status: test.status,
        totalQuestions: test.totalQuestions,
        score: test.correctAnswers,
        correctAnswers: test.correctAnswers,
        accuracy: test.accuracy,
        timeTaken: test.timeTaken || 0,
        mistakes,
        allAnswers,
        questions
      })
    }

    // In-progress test — return questions without answers
    return NextResponse.json({
      id: test.id,
      status: test.status,
      totalQuestions: test.totalQuestions,
      questions
    })
  } catch (error) {
    console.error('Fetch test error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
