'use client';

import { useState, useRef, useEffect } from 'react';
import { Exercise } from '@/lib/learning-engine';
import { cn, speak } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Volume2, Check } from 'lucide-react';

export default function SpellingExercise({ exercise, onAnswer, onNext }: { exercise: Exercise, onAnswer: (isCorrect: boolean) => void, onNext: () => void }) {
  const [value, setValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !value.trim()) return;

    const correct = value.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    setIsCorrect(correct);
    setIsAnswered(true);
    onAnswer(correct);
  };

  return (
    <div className="flex flex-col h-full glass-surface p-8 rounded-xl">
      <div className="text-center mb-12">
        <h2 className="text-sm text-dark-400 mb-6 uppercase tracking-wider font-semibold">Spelling</h2>
        <div className="mb-4">
          <span className="text-xl text-dark-300">Translate: </span>
          <span className="text-3xl font-bold text-brand-400">{exercise.word.translation}</span>
        </div>
        
        <button 
          onClick={() => speak(exercise.word.word)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dark-800 hover:bg-dark-700 text-dark-100 transition-colors"
        >
          <Volume2 className="h-5 w-5" />
          <span>Listen</span>
        </button>
      </div>

      <div className="max-w-md mx-auto w-full mt-8">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isAnswered}
            placeholder="Type the English word..."
            className={cn(
              "input-field w-full text-center text-2xl py-6 pr-14",
              isAnswered && (isCorrect ? "border-success bg-success/10 text-success" : "border-error bg-error/10 text-error")
            )}
          />
          {!isAnswered && (
            <button 
              type="submit"
              disabled={!value.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-500 hover:bg-brand-400 text-white rounded-lg disabled:opacity-50"
            >
              <Check className="h-6 w-6" />
            </button>
          )}
        </form>

        {isAnswered && !isCorrect && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg text-center"
          >
            <p className="text-sm text-error mb-1">Correct answer:</p>
            <p className="text-2xl font-bold text-dark-100">{exercise.correctAnswer}</p>
          </motion.div>
        )}
      </div>

      {isAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-auto flex justify-end pt-8"
        >
          <button onClick={onNext} className="btn-primary w-full md:w-auto px-12 py-4">
            Next
          </button>
        </motion.div>
      )}
    </div>
  );
}
