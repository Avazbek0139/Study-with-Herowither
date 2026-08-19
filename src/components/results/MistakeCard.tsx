import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface MistakeCardProps {
  word: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  example?: string;
  explanation?: string;
}

export function MistakeCard({ word, question, userAnswer, correctAnswer, example, explanation }: MistakeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-surface rounded-xl overflow-hidden mb-4 border border-dark-700 transition-colors hover:border-dark-600">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-error" />
          <span className="text-lg font-semibold text-dark-100">{word}</span>
          <span className="badge-error text-xs px-2 py-1 rounded">Incorrect</span>
        </div>
        <button className="text-dark-400 hover:text-dark-100 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-dark-700"
          >
            <div className="p-4 space-y-4 bg-dark-900/30">
              <div>
                <p className="text-sm text-dark-400 mb-1">Question:</p>
                <p className="text-dark-100 font-medium">{question}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-error/10 border border-error/20">
                  <p className="text-xs text-error mb-1 uppercase tracking-wider">Your Answer</p>
                  <p className="text-dark-100 line-through decoration-error">{userAnswer}</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-xs text-success mb-1 uppercase tracking-wider">Correct Answer</p>
                  <p className="text-dark-100 font-semibold">{correctAnswer}</p>
                </div>
              </div>

              {example && (
                <div>
                  <p className="text-sm text-dark-400 mb-1">Example:</p>
                  <p className="text-dark-200 italic">"{example}"</p>
                </div>
              )}

              {explanation && (
                <div>
                  <p className="text-sm text-dark-400 mb-1">Explanation:</p>
                  <p className="text-dark-200">{explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
