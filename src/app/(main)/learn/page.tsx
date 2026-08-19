'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from '@/lib/learning-engine';
import ExerciseRenderer from '@/components/learn/ExerciseRenderer';
import { useRouter } from 'next/navigation';
import { Difficulty } from '@/types';
import { calculateAccuracy } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function LearnPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [sessionState, setSessionState] = useState<'setup' | 'active' | 'complete'>('setup');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchWords();
  }, [difficulty]);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/learn/words?count=10&difficulty=${difficulty}`);
      if (res.ok) {
        const data = await res.json();
        setExercises(data.exercises);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStart = () => {
    if (exercises.length === 0) return;
    setSessionState('active');
    setResults({ correct: 0, total: exercises.length });
  };

  const handleAnswer = async (isCorrect: boolean, exercise: Exercise) => {
    if (isCorrect) {
      setResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    
    try {
      await fetch('/api/learn/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabularyId: exercise.word.id,
          isCorrect,
          exerciseType: exercise.type
        })
      });
    } catch (e) {
      console.error('Failed to submit answer', e);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionState('complete');
    }
  };

  if (loading) {
    return <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>;
  }

  if (exercises.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="glass-surface p-8 rounded-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-dark-100 mb-4">No words to learn yet</h2>
          <p className="text-dark-400 mb-6">Add some vocabulary words to your collection before starting a learning session.</p>
          <button onClick={() => router.push('/vocabulary/add')} className="btn-primary w-full">
            Add Words
          </button>
        </div>
      </div>
    );
  }

  if (sessionState === 'setup') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="glass-surface p-8 rounded-xl">
          <h1 className="text-3xl font-bold text-dark-100 mb-2">Learning Session</h1>
          <p className="text-dark-400 mb-8">Ready to review some vocabulary?</p>
          
          <div className="mb-8">
            <h3 className="text-lg font-medium text-dark-100 mb-4">Select Difficulty</h3>
            <div className="flex gap-4">
              {(['easy', 'normal', 'hard'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-3 px-4 rounded-lg capitalize font-medium transition-colors border ${
                    difficulty === level 
                      ? 'bg-brand-500 text-white border-brand-500' 
                      : 'bg-dark-900 text-dark-400 border-dark-700 hover:border-brand-500/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-dark-950 p-4 rounded-lg mb-8 border border-dark-700">
            <div className="text-sm text-dark-400 mb-1">Session Summary</div>
            <div className="text-lg font-medium text-dark-100">
              {exercises.length} words to review
            </div>
          </div>
          
          <button onClick={handleStart} className="btn-primary w-full py-4 text-lg">
            Start Session
          </button>
        </div>
      </div>
    );
  }

  if (sessionState === 'complete') {
    const accuracy = calculateAccuracy(results.correct, results.total);
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-surface p-8 rounded-xl text-center"
        >
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success">
            <span className="text-4xl">🎉</span>
          </div>
          <h1 className="text-3xl font-bold text-dark-100 mb-2">Session Complete!</h1>
          <p className="text-dark-400 mb-8">Great job! Here is how you did.</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
              <div className="text-2xl font-bold text-dark-100">{results.total}</div>
              <div className="text-sm text-dark-400">Total Words</div>
            </div>
            <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
              <div className="text-2xl font-bold text-success">{results.correct}</div>
              <div className="text-sm text-dark-400">Correct</div>
            </div>
            <div className="bg-dark-950 p-4 rounded-lg border border-dark-700">
              <div className="text-2xl font-bold text-brand-400">{accuracy}%</div>
              <div className="text-sm text-dark-400">Accuracy</div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => router.push('/dashboard')} className="btn-secondary flex-1">
              Back to Dashboard
            </button>
            <button onClick={() => {
              setSessionState('setup');
              fetchWords();
            }} className="btn-primary flex-1">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((currentIndex) / exercises.length) * 100;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-dark-400 mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {exercises.length}</span>
        </div>
        <div className="h-2 w-full bg-dark-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ExerciseRenderer
              exercise={exercises[currentIndex]}
              onAnswer={(isCorrect) => handleAnswer(isCorrect, exercises[currentIndex])}
              onNext={handleNext}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
