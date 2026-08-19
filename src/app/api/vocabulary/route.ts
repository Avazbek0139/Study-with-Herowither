export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'a-z'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const whereClause: any = { userId: session.user.id }

    if (search) {
      whereClause.OR = [
        { word: { contains: search } },
        { translation: { contains: search } },
      ]
    }

    if (filter === 'learning') {
      whereClause.isLearned = false
      whereClause.progress = { isNot: null }
    } else if (filter === 'mastered') {
      whereClause.isLearned = true
    } else if (filter === 'review') {
      const now = new Date()
      whereClause.progress = {
        OR: [
          { confidenceScore: { lt: 0.5 }, attempts: { gt: 0 } },
          { nextReviewDate: { lte: now } },
        ],
      }
    }

    let orderByClause: any = { word: 'asc' }
    if (sort === 'newest') orderByClause = { createdAt: 'desc' }
    else if (sort === 'oldest') orderByClause = { createdAt: 'asc' }
    else if (sort === 'a-z') orderByClause = { word: 'asc' }
    else if (sort === 'z-a') orderByClause = { word: 'desc' }

    const [items, total] = await Promise.all([
      prisma.vocabulary.findMany({
        where: whereClause,
        include: { progress: true },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      prisma.vocabulary.count({ where: whereClause }),
    ])

    if (sort === 'accuracy') {
      items.sort((a, b) => {
        const scoreA = a.progress?.confidenceScore || 0
        const scoreB = b.progress?.confidenceScore || 0
        return scoreB - scoreA
      })
    }

    return NextResponse.json({ items, total, page, limit })
  } catch (error) {
    console.error('Error in vocabulary GET:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      word,
      translation,
      partOfSpeech,
      exampleSentence,
      pronunciation,
      synonyms,
      antonyms,
      personalNote,
      difficultyLevel,
    } = body

    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const trimmedWord = word.trim().toLowerCase()

    // Check for duplicates
    const existing = await prisma.vocabulary.findUnique({
      where: {
        userId_word: {
          userId: session.user.id,
          word: trimmedWord,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Word already exists in your vocabulary' }, { status: 409 })
    }

    const newItem = await prisma.vocabulary.create({
      data: {
        userId: session.user.id,
        word: trimmedWord,
        translation: translation || null,
        partOfSpeech: partOfSpeech || null,
        exampleSentence: exampleSentence || null,
        pronunciation: pronunciation || null,
        synonyms: synonyms || null,
        antonyms: antonyms || null,
        personalNote: personalNote || null,
        difficultyLevel: difficultyLevel || 'normal',
      },
      include: { progress: true },
    })

    // Create initial progress record
    await prisma.vocabularyProgress.create({
      data: {
        vocabularyId: newItem.id,
        userId: session.user.id,
        correctCount: 0,
        wrongCount: 0,
        accuracy: 0,
        attempts: 0,
        confidenceScore: 0,
      },
    })

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error in vocabulary POST:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

