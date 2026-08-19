'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/learning-engine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function MultipleChoiceExercise({ exercise, onAnswer, onNext }: { exercise: Exercise, onAnswer: (isCorrect: boolean) => void, onNext: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelected(option);
    setIsAnswered(true);
    onAnswer(option === exercise.correctAnswer);
  };

  return (
    <div className="flex flex-col h-full glass-surface p-8 rounded-xl">
      <div className="text-center mb-12">
        <h2 className="text-sm text-dark-400 mb-4 uppercase tracking-wider font-semibold">Multiple Choice</h2>
        <h1 className="text-2xl font-bold text-dark-100">{exercise.question}</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1">
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
              whileHover={!isAnswered ? { scale: 1.01 } : {}}
              whileTap={!isAnswered ? { scale: 0.99 } : {}}
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={cn(
                "p-4 rounded-xl border-2 text-lg font-medium transition-all text-dark-100 text-left",
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
