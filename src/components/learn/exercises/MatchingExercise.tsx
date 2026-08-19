'use client';

import { useState, useEffect } from 'react';
import { Exercise } from '@/lib/learning-engine';
import { cn, shuffleArray } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function MatchingExercise({ exercise, onAnswer, onNext }: { exercise: Exercise, onAnswer: (isCorrect: boolean) => void, onNext: () => void }) {
  const [leftItems, setLeftItems] = useState<{id: string, text: string}[]>([]);
  const [rightItems, setRightItems] = useState<{id: string, text: string}[]>([]);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // stores word texts that are matched
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    if (exercise.matchingPairs) {
      const left = exercise.matchingPairs.map(p => ({ id: `l_${p.word}`, text: p.word }));
      const right = exercise.matchingPairs.map(p => ({ id: `r_${p.translation}`, text: p.translation }));
      setLeftItems(shuffleArray([...left]));
      setRightItems(shuffleArray([...right]));
    }
  }, [exercise]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      // Check match
      const leftWord = leftItems.find(i => i.id === selectedLeft)?.text;
      const rightTrans = rightItems.find(i => i.id === selectedRight)?.text;
      
      const isMatch = exercise.matchingPairs?.some(p => p.word === leftWord && p.translation === rightTrans);
      
      if (isMatch && leftWord) {
        setMatchedPairs(prev => [...prev, leftWord]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setErrors(prev => prev + 1);
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, exercise, leftItems, rightItems]);

  const isComplete = matchedPairs.length > 0 && matchedPairs.length === exercise.matchingPairs?.length;

  useEffect(() => {
    if (isComplete) {
      onAnswer(errors === 0);
    }
  }, [isComplete, errors, onAnswer]);

  return (
    <div className="flex flex-col h-full glass-surface p-8 rounded-xl">
      <div className="text-center mb-8">
        <h2 className="text-sm text-dark-400 mb-2 uppercase tracking-wider font-semibold">Match Pairs</h2>
        <p className="text-dark-300">Tap a word and its corresponding translation to match them.</p>
      </div>

      <div className="grid grid-cols-2 gap-8 flex-1">
        {/* Left column - Words */}
        <div className="flex flex-col gap-4">
          {leftItems.map((item) => {
            const isMatched = matchedPairs.includes(item.text);
            const isSelected = selectedLeft === item.id;
            const hasError = isSelected && selectedRight && !isMatched;

            return (
              <motion.button
                key={item.id}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => !isMatched && setSelectedLeft(item.id)}
                disabled={isMatched}
                className={cn(
                  "p-4 rounded-xl border-2 text-lg font-medium transition-all text-center",
                  isMatched ? "bg-dark-800/50 border-dark-800 text-dark-600 opacity-50 cursor-not-allowed" :
                  isSelected ? "bg-brand-500/20 border-brand-500 text-brand-300" :
                  hasError ? "bg-error/20 border-error text-error" :
                  "bg-dark-900 border-dark-700 hover:border-brand-500/50 text-dark-100"
                )}
              >
                {isMatched ? <Check className="h-5 w-5 mx-auto" /> : item.text}
              </motion.button>
            );
          })}
        </div>

        {/* Right column - Translations */}
        <div className="flex flex-col gap-4">
          {rightItems.map((item) => {
            const originalWord = exercise.matchingPairs?.find(p => p.translation === item.text)?.word || '';
            const isMatched = matchedPairs.includes(originalWord);
            const isSelected = selectedRight === item.id;
            const hasError = isSelected && selectedLeft && !isMatched;

            return (
              <motion.button
                key={item.id}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
                onClick={() => !isMatched && setSelectedRight(item.id)}
                disabled={isMatched}
                className={cn(
                  "p-4 rounded-xl border-2 text-lg font-medium transition-all text-center",
                  isMatched ? "bg-dark-800/50 border-dark-800 text-dark-600 opacity-50 cursor-not-allowed" :
                  isSelected ? "bg-brand-500/20 border-brand-500 text-brand-300" :
                  hasError ? "bg-error/20 border-error text-error" :
                  "bg-dark-900 border-dark-700 hover:border-brand-500/50 text-dark-100"
                )}
              >
                {isMatched ? <Check className="h-5 w-5 mx-auto" /> : item.text}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isComplete && (
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
