export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        vocabulary: {
          include: {
            progress: true
          }
        },
        tests: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate Summary Stats
    const totalWords = user.vocabulary.length;
    let masteredWords = 0;
    let learningWords = 0;
    let toReviewWords = 0;
    let totalAccuracy = 0;
    let wordsWithProgress = 0;

    user.vocabulary.forEach(vocab => {
      if (vocab.isLearned) {
        masteredWords++;
      }
      
      const prog = vocab.progress;
      if (prog) {
        wordsWithProgress++;
        totalAccuracy += prog.accuracy * 100; // accuracy is stored as float 0-1 or percentage? In completion route: Math.round((correctCount / test.totalQuestions) * 100). So it's 0-100 or 0-1.
        // Wait, in adaptive engine: accuracy = correctCount / attempts (so 0-1 float). Let's check both or normalize to 0-100.
        // If accuracy is float 0-1, prog.accuracy * 100 gives percentage.
        // Let's check: in adaptive-engine, accuracy = correctCount / attempts. So yes, it's 0-1.
        
        if (!vocab.isLearned) {
          if (prog.confidenceScore >= 0.4) {
            learningWords++;
          } else {
            toReviewWords++;
          }
        }
      } else {
        toReviewWords++; // No progress means needs review
      }
    });

    const averageAccuracy = wordsWithProgress > 0 ? Math.round(totalAccuracy / wordsWithProgress) : 0;
    
    const completedTests = user.tests.filter(t => t.status === 'completed');
    const bestAccuracy = completedTests.length > 0 
      ? Math.max(...completedTests.map(t => t.accuracy)) 
      : 0;

    // Streak calculation
    let currentStreak = 0;
    const testDates = new Set(
      completedTests.map(t => new Date(t.createdAt).toDateString())
    );
    
    const checkDate = new Date();
    while (true) {
      if (testDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (currentStreak === 0 && new Date().toDateString() === checkDate.toDateString()) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Vocabulary Growth Data
    const growthMap = new Map<string, number>();
    user.vocabulary.forEach(v => {
      const date = v.createdAt.toISOString().split('T')[0];
      growthMap.set(date, (growthMap.get(date) || 0) + 1);
    });
    
    let cumulative = 0;
    const vocabularyGrowth = Array.from(growthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => {
        cumulative += count;
        return { date, value: cumulative };
      });

    // Accuracy Trend
    const accuracyTrend = completedTests.map(t => ({
      date: t.createdAt.toISOString().split('T')[0],
      value: t.accuracy
    }));

    // Test Performance (Last 10)
    const testPerformance = completedTests.slice(-10).map(t => ({
      date: t.createdAt.toISOString().split('T')[0],
      value: t.accuracy
    }));

    // Weak Words
    const weakWords = user.vocabulary
      .filter(v => v.progress)
      .sort((a, b) => (a.progress?.confidenceScore || 0) - (b.progress?.confidenceScore || 0))
      .slice(0, 10)
      .map(v => ({
        id: v.id,
        word: v.word,
        translation: v.translation,
        accuracy: Math.round((v.progress?.accuracy || 0) * 100),
        lastReviewed: v.progress?.lastReviewed || v.createdAt
      }));

    return NextResponse.json({
      summary: {
        totalWords,
        masteredWords,
        learningWords,
        toReviewWords,
        testsCompleted: completedTests.length,
        averageAccuracy,
        bestAccuracy,
        currentStreak
      },
      vocabularyGrowth: vocabularyGrowth.length > 0 ? vocabularyGrowth : [{date: new Date().toISOString().split('T')[0], value: 0}],
      accuracyTrend: accuracyTrend.length > 0 ? accuracyTrend : [{date: new Date().toISOString().split('T')[0], value: 0}],
      testPerformance: testPerformance.length > 0 ? testPerformance : [{date: new Date().toISOString().split('T')[0], value: 0}],
      weakWords
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

