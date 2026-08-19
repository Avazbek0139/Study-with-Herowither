export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const item = await prisma.vocabulary.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { progress: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error in vocabulary[id] GET:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const existingItem = await prisma.vocabulary.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 })
    }

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
      isLearned,
    } = body

    const updatedItem = await prisma.vocabulary.update({
      where: { id: params.id },
      data: {
        ...(word !== undefined && { word }),
        ...(translation !== undefined && { translation }),
        ...(partOfSpeech !== undefined && { partOfSpeech }),
        ...(exampleSentence !== undefined && { exampleSentence }),
        ...(pronunciation !== undefined && { pronunciation }),
        ...(synonyms !== undefined && { synonyms }),
        ...(antonyms !== undefined && { antonyms }),
        ...(personalNote !== undefined && { personalNote }),
        ...(difficultyLevel !== undefined && { difficultyLevel }),
        ...(isLearned !== undefined && { isLearned }),
      },
      include: { progress: true },
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error in vocabulary[id] PUT:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingItem = await prisma.vocabulary.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingItem) {
      return NextResponse.json({ error: 'Vocabulary item not found' }, { status: 404 })
    }

    await prisma.vocabulary.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in vocabulary[id] DELETE:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
