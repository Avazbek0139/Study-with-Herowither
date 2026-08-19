export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { checkSentenceChallengeAnswers } from '@/lib/sentence-challenge-engine'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, userAnswer } = await req.json()

    const test = await prisma.test.findUnique({
      where: { id: params.id, userId: session.user.id }
    })
    
    if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const question = await prisma.testQuestion.findUnique({
      where: { id: questionId, testId: params.id }
    })
    
    if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 })

    let isCorrect = false
    
    if (question.type === 'sentence_challenge') {
      const parsedUserAnswer = JSON.parse(userAnswer)
      const parsedQuestionData = JSON.parse(question.questionData)
      const { score } = checkSentenceChallengeAnswers(parsedQuestionData, parsedUserAnswer)
      isCorrect = score === 5
    } else {
      isCorrect = typeof userAnswer === 'string' && 
                  userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
    }

    await prisma.testQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer),
        isCorrect
      }
    })

    return NextResponse.json({ 
      isCorrect, 
      correctAnswer: question.correctAnswer 
    })
  } catch (error) {
    console.error('Answer submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
