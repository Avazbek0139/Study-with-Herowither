'use client';

import { useState } from 'react';
import { Exercise } from '@/lib/learning-engine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ContextExercise({ exercise, onAnswer, onNext }: { exercise: Exercise, onAnswer: (isCorrect: boolean) => void, onNext: () => void }) {
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
      <div className="text-center mb-10">
        <h2 className="text-sm text-dark-400 mb-6 uppercase tracking-wider font-semibold">In Context</h2>
        <div className="bg-dark-900/50 p-6 rounded-xl border border-dark-800">
          <p className="text-xl font-medium text-dark-100 leading-loose">
            {isAnswered && selected 
              ? exercise.question.split('______').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={cn(
                        "px-3 py-1 mx-1 rounded-md font-bold",
                        selected === exercise.correctAnswer ? "bg-success/20 text-success" : "bg-error/20 text-error"
                      )}>
                        {selected}
                      </span>
                    )}
                  </span>
                ))
              : exercise.question.split('______').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="inline-block w-24 h-1 bg-dark-700 mx-2 align-middle rounded-full"></span>
                  )}
                </span>
              ))
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
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
                "p-4 rounded-xl border-2 text-lg font-medium transition-all text-dark-100",
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
