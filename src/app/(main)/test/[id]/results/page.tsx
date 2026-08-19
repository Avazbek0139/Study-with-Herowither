'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScoreDisplay } from '@/components/results/ScoreDisplay';
import { RotateCcw, BookOpen, ArrowLeft, CheckCircle, XCircle, ChevronDown, ChevronUp, Copy, Check, Share2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnswerItem {
  word: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: string;
}

interface MistakeItem {
  word: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface TestResult {
  id: string;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  accuracy: number;
  mistakes: MistakeItem[];
  allAnswers: AnswerItem[];
}

function AnswerCard({ answer, index }: { answer: AnswerItem; index: number }) {
  const [isExpanded, setIsExpanded] = useState(!answer.isCorrect);

  const typeLabels: Record<string, string> = {
    translation: '🔤 Translation',
    multiple_choice: '📋 Multiple Choice',
    spelling: '✏️ Spelling',
    context: '📖 Context',
    sentence_challenge: '📝 Sentence Challenge',
  };

  return (
    <div className={cn(
      "rounded-xl overflow-hidden border transition-colors",
      answer.isCorrect
        ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
        : "bg-red-500/5 border-red-500/20 hover:border-red-500/40"
    )}>
      <div
        className="p-4 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {answer.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <span className="text-xs text-dark-500 font-mono">#{index + 1}</span>
          <span className="text-dark-100 font-semibold truncate">{answer.word}</span>
          <span className="text-xs text-dark-500 hidden sm:inline">
            {typeLabels[answer.type] || answer.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            answer.isCorrect
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-red-500/20 text-red-400"
          )}>
            {answer.isCorrect ? 'CORRECT' : 'WRONG'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-dark-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-dark-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-dark-700/50 p-4 space-y-3 bg-dark-900/30">
          <div>
            <p className="text-xs text-dark-500 mb-1 uppercase tracking-wider">Question</p>
            <p className="text-dark-200 text-sm">{answer.question}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={cn(
              "p-3 rounded-lg border",
              answer.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/20"
                : "bg-red-500/10 border-red-500/20"
            )}>
              <p className={cn(
                "text-xs mb-1 uppercase tracking-wider",
                answer.isCorrect ? "text-emerald-500" : "text-red-500"
              )}>Your Answer</p>
              <p className={cn(
                "text-dark-100 font-medium",
                !answer.isCorrect && "line-through decoration-red-500"
              )}>
                {answer.userAnswer || 'No answer'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-500 mb-1 uppercase tracking-wider">Correct Answer</p>
              <p className="text-dark-100 font-semibold">{answer.correctAnswer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/test/${id}`);
        if (!res.ok) throw new Error('Failed to fetch results');
        const data = await res.json();
        setResult(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchResults();
    }
  }, [id]);

  const copyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-dark-100 mb-4">Results not found</h2>
        <Link href="/test" className="btn-primary inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tests
        </Link>
      </div>
    );
  }

  const allAnswers = result.allAnswers || [];
  const correctCount = allAnswers.filter(a => a.isCorrect).length;
  const wrongCount = allAnswers.filter(a => !a.isCorrect).length;

  const filteredAnswers = allAnswers.filter(a => {
    if (filter === 'correct') return a.isCorrect;
    if (filter === 'wrong') return !a.isCorrect;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gradient-brand">TEST COMPLETE</h1>
          <p className="text-dark-400">Here's how you did!</p>
        </motion.div>

        {/* Score Display */}
        <motion.div variants={itemVariants}>
          <ScoreDisplay
            correct={result.score}
            total={result.totalQuestions}
            accuracy={result.accuracy}
            timeTaken={result.timeTaken}
          />
        </motion.div>

        {/* Shareable Link Box */}
        <motion.div variants={itemVariants} className="glass-surface p-4 rounded-xl border border-dark-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-dark-300 w-full sm:w-auto truncate">
            <Share2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span className="text-dark-400 font-medium">Test linki:</span>
            <span className="font-mono text-xs text-brand-300 bg-dark-900 px-2 py-1 rounded truncate">
              {typeof window !== 'undefined' ? window.location.href : `/test/${id}/results`}
            </span>
          </div>
          <button
            onClick={copyUrl}
            className="btn-secondary text-xs py-1.5 px-4 flex items-center gap-1.5 w-full sm:w-auto justify-center flex-shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Nusxalandi!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-brand-400" />
                <span>Havolani nusxalash</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Full Analysis Section */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-dark-100">📊 DETAILED ANALYSIS</h2>

            {/* Filter tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                  filter === 'all'
                    ? "bg-brand-500/20 border-brand-500 text-brand-400"
                    : "bg-dark-800 border-dark-700 text-dark-400 hover:bg-dark-750"
                )}
              >
                All ({allAnswers.length})
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                  filter === 'correct'
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-dark-800 border-dark-700 text-dark-400 hover:bg-dark-750"
                )}
              >
                ✅ Correct ({correctCount})
              </button>
              <button
                onClick={() => setFilter('wrong')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
                  filter === 'wrong'
                    ? "bg-red-500/20 border-red-500 text-red-400"
                    : "bg-dark-800 border-dark-700 text-dark-400 hover:bg-dark-750"
                )}
              >
                ❌ Wrong ({wrongCount})
              </button>
            </div>
          </div>

          {/* Answer Cards */}
          <div className="space-y-3">
            {filteredAnswers.length === 0 ? (
              <div className="text-center py-8 text-dark-400">
                {filter === 'wrong' ? '🎉 No mistakes! Perfect score!' : 'No answers to show.'}
              </div>
            ) : (
              filteredAnswers.map((answer, index) => (
                <AnswerCard
                  key={index}
                  answer={answer}
                  index={filter === 'all' ? index : allAnswers.indexOf(answer)}
                />
              ))
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8">
          {wrongCount > 0 && result.mistakes && (
            <button
              onClick={() => router.push(`/learn?words=${result.mistakes.map(m => m.word).join(',')}`)}
              className="btn-primary w-full sm:w-auto flex items-center justify-center"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              REVIEW MISTAKES ({wrongCount})
            </button>
          )}
          <button
            onClick={() => router.push('/test')}
            className="btn-secondary w-full sm:w-auto flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            TRY AGAIN
          </button>
          <Link href="/vocabulary" className="btn-ghost w-full sm:w-auto flex items-center justify-center">
            BACK TO VOCABULARY
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
