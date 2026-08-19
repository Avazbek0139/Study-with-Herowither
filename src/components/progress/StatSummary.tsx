'use client';

import { Book, CheckCircle, BrainCircuit, RefreshCw, Activity, Target, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatSummaryProps {
  stats: {
    totalWords: number;
    masteredWords: number;
    learningWords: number;
    toReviewWords: number;
    testsCompleted: number;
    averageAccuracy: number;
    bestAccuracy: number;
    currentStreak: number;
  };
}

export function StatSummary({ stats }: StatSummaryProps) {
  const items = [
    { label: 'Total Words', value: stats.totalWords, icon: Book, color: 'text-brand-500' },
    { label: 'Mastered', value: stats.masteredWords, icon: CheckCircle, color: 'text-success' },
    { label: 'Learning', value: stats.learningWords, icon: BrainCircuit, color: 'text-warning' },
    { label: 'To Review', value: stats.toReviewWords, icon: RefreshCw, color: 'text-error' },
    { label: 'Tests Done', value: stats.testsCompleted, icon: Activity, color: 'text-brand-400' },
    { label: 'Avg Accuracy', value: `${stats.averageAccuracy}%`, icon: Target, color: 'text-success' },
    { label: 'Best Accuracy', value: `${stats.bestAccuracy}%`, icon: Zap, color: 'text-warning' },
    { label: 'Current Streak', value: stats.currentStreak, icon: Clock, color: 'text-brand-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-surface p-4 rounded-xl border border-dark-700 flex items-center space-x-4"
          >
            <div className={`p-3 rounded-lg bg-dark-800 ${item.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-dark-100">{item.value}</div>
              <div className="text-xs text-dark-400 uppercase tracking-wider">{item.label}</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
