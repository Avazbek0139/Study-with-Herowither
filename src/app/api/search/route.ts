export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const results = await prisma.vocabulary.findMany({
      where: {
        userId: user.id,
        OR: [
          { word: { contains: query, mode: 'insensitive' } },
          { translation: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: {
        progress: true
      },
      take: 10
    });

    const formattedResults = results.map(v => ({
      id: v.id,
      word: v.word,
      translation: v.translation,
      partOfSpeech: v.partOfSpeech || 'noun',
      pronunciation: v.pronunciation
    }));

    return NextResponse.json(formattedResults);

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

