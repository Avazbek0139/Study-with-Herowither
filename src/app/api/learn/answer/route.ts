export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateProgress } from '@/lib/adaptive-engine';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { vocabularyId, isCorrect, exerciseType } = body;

    if (!vocabularyId || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updatedProgress = await updateProgress(vocabularyId, session.user.id, isCorrect);

    return NextResponse.json({ success: true, progress: updatedProgress });
  } catch (error) {
    console.error('Error in /api/learn/answer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

