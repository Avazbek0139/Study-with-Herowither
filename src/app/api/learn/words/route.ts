export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getNextWords, selectExerciseType, generateExercise } from '@/lib/learning-engine';
import prisma from '@/lib/prisma';
import { Difficulty } from '@/types';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const count = parseInt(searchParams.get('count') || '10');
    const difficulty = (searchParams.get('difficulty') || 'normal') as Difficulty;

    const words = await getNextWords(session.user.id, count);
    const allWords = await prisma.vocabulary.findMany({
      where: { userId: session.user.id }
    });

    const exercises = words.map((word: any) => {
      const type = selectExerciseType(word, word.progress || null, difficulty);
      return generateExercise(word, allWords as any, type, difficulty);
    });

    return NextResponse.json({ words, exercises });
  } catch (error) {
    console.error('Error in /api/learn/words:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

