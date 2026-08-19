export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { words } = await request.json()

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'Invalid input. Expected an array of words.' }, { status: 400 })
    }

    const added: string[] = []
    const skipped: string[] = []
    const errors: string[] = []

    const existingWords = await prisma.vocabulary.findMany({
      where: {
        userId: session.user.id,
        word: { in: words.map((w: string) => w.trim().toLowerCase()) },
      },
      select: { word: true },
    })

    const existingWordsSet = new Set(existingWords.map(w => w.word.toLowerCase()))

    for (const rawWord of words) {
      const word = rawWord.trim().toLowerCase()
      if (!word) continue

      if (existingWordsSet.has(word)) {
        skipped.push(word)
        continue
      }

      try {
        const vocab = await prisma.vocabulary.create({
          data: {
            userId: session.user.id,
            word,
          },
        })

        await prisma.vocabularyProgress.create({
          data: {
            vocabularyId: vocab.id,
            userId: session.user.id,
            correctCount: 0,
            wrongCount: 0,
            accuracy: 0,
            attempts: 0,
            confidenceScore: 0,
          },
        })

        added.push(word)
        existingWordsSet.add(word)
      } catch (err) {
        console.error(`Error adding word ${word}:`, err)
        errors.push(word)
      }
    }

    return NextResponse.json({ added, skipped, errors }, { status: 200 })
  } catch (error) {
    console.error('Error in bulk vocabulary POST:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

