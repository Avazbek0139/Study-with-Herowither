import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ScoreDisplayProps {
  correct: number;
  total: number;
  accuracy: number;
  timeTaken: number; // in seconds
}

export function ScoreDisplay({ correct, total, accuracy, timeTaken }: ScoreDisplayProps) {
  const isExcellent = accuracy >= 80;
  const isGood = accuracy >= 60 && accuracy < 80;
  
  const ringColor = isExcellent 
    ? 'text-success' 
    : isGood ? 'text-warning' : 'text-error';

  const strokeColor = isExcellent 
    ? '#10b981' 
    : isGood ? '#f59e0b' : '#ef4444';

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 glass-surface rounded-xl max-w-2xl mx-auto w-full border border-dark-700">
      <div className="relative w-48 h-48 mb-6">
        {/* Background Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <circle
            className="text-dark-700"
            strokeWidth="12"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
          {/* Progress Ring */}
          <motion.circle
            className={ringColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={circumference} // Start at 0
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            stroke={strokeColor}
            fill="transparent"
            r={radius}
            cx="100"
            cy="100"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-dark-100">{correct}/{total}</span>
          <span className={cn("text-lg font-medium", ringColor)}>{Math.round(accuracy)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full mt-4">
        <div className="flex flex-col items-center p-4 rounded-lg bg-dark-900/50 border border-dark-700">
          <CheckCircle className="w-6 h-6 text-success mb-2" />
          <span className="text-2xl font-bold text-dark-100">{correct}</span>
          <span className="text-xs text-dark-400 uppercase tracking-wider">Correct</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-dark-900/50 border border-dark-700">
          <XCircle className="w-6 h-6 text-error mb-2" />
          <span className="text-2xl font-bold text-dark-100">{total - correct}</span>
          <span className="text-xs text-dark-400 uppercase tracking-wider">Incorrect</span>
        </div>
        <div className="flex flex-col items-center p-4 rounded-lg bg-dark-900/50 border border-dark-700">
          <Clock className="w-6 h-6 text-brand-400 mb-2" />
          <span className="text-2xl font-bold text-dark-100">{formatTime(timeTaken)}</span>
          <span className="text-xs text-dark-400 uppercase tracking-wider">Time</span>
        </div>
      </div>
    </div>
  );
}
