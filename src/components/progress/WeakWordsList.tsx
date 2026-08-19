'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface WeakWordsListProps {
  words: {
    id: string;
    word: string;
    translation: string;
    accuracy: number;
    lastReviewed: string;
  }[];
}

export function WeakWordsList({ words }: WeakWordsListProps) {
  const router = useRouter();

  if (!words || words.length === 0) {
    return (
      <div className="glass-surface p-8 text-center rounded-xl border border-dark-700">
        <p className="text-dark-400">No weak words found. Great job!</p>
      </div>
    );
  }

  const handlePractice = (word: string) => {
    router.push(`/learn?words=${word}`);
  };

  return (
    <div className="glass-surface rounded-xl border border-dark-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-dark-900/50 border-b border-dark-700">
            <tr>
              <th className="p-4 font-semibold text-dark-300 text-sm uppercase tracking-wider">Word</th>
              <th className="p-4 font-semibold text-dark-300 text-sm uppercase tracking-wider">Translation</th>
              <th className="p-4 font-semibold text-dark-300 text-sm uppercase tracking-wider hidden sm:table-cell">Accuracy</th>
              <th className="p-4 font-semibold text-dark-300 text-sm uppercase tracking-wider hidden md:table-cell">Last Reviewed</th>
              <th className="p-4 font-semibold text-dark-300 text-sm uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {words.map((w) => (
              <tr key={w.id} className="hover:bg-dark-800/50 transition-colors">
                <td className="p-4 font-medium text-dark-100">{w.word}</td>
                <td className="p-4 text-dark-300">{w.translation}</td>
                <td className="p-4 hidden sm:table-cell">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className={`h-full rounded-full ${w.accuracy > 70 ? 'bg-success' : w.accuracy > 40 ? 'bg-warning' : 'bg-error'}`}
                        style={{ width: `${Math.max(5, w.accuracy)}%` }}
                      />
                    </div>
                    <span className="text-xs text-dark-400">{w.accuracy}%</span>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-dark-400 text-sm">
                  {new Date(w.lastReviewed).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handlePractice(w.word)}
                    className="text-brand-400 hover:text-brand-300 text-sm font-medium inline-flex items-center"
                  >
                    Practice <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
