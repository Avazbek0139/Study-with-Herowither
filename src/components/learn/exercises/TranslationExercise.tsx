'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/learning-engine';
import { cn, speak } from '@/lib/utils';
import { Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TranslationExercise({ exercise, onAnswer, onNext }: { exercise: Exercise, onAnswer: (isCorrect: boolean) => void, onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    setIsAnswered(true);
    onAnswer(option === exercise.correctAnswer);
  };

  const isWordToTranslation = exercise.question === exercise.word.word;

  return (
    <div className="flex flex-col h-full glass-surface p-8 rounded-xl">
      <div className="text-center mb-12">
        <h2 className="text-sm text-dark-400 mb-2 uppercase tracking-wider font-semibold">Translate</h2>
        <div className="flex items-center justify-center gap-3">
          <h1 className="text-4xl font-bold text-dark-100">{exercise.question}</h1>
          {isWordToTranslation && (
            <button 
              onClick={() => speak(exercise.word.word)}
              className="p-2 rounded-full hover:bg-dark-800 text-brand-400 transition-colors"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {exercise.options?.map((option, idx) => {
          let stateClass = "bg-dark-900 border-dark-700 hover:border-brand-500/50 hover:bg-dark-800";
          
          if (isAnswered) {
            if (option === exercise.correctAnswer) {
              stateClass = "bg-success/20 border-success text-success-light";
            } else if (option === selected) {
              stateClass = "bg-error/20 border-error text-error-light";
            } else {
              stateClass = "bg-dark-900 border-dark-800 opacity-50";
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={!isAnswered ? { scale: 1.02 } : {}}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={cn(
                "p-6 rounded-xl border-2 text-lg font-medium transition-all text-dark-100",
                stateClass
              )}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {isAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
          <button onClick={onNext} className="btn-primary w-full md:w-auto px-12 py-4">
            Next
          </button>
        </motion.div>
      )}
    </div>
  );
}
