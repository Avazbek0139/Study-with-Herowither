'use client';

import { useState, useEffect } from 'react';
import { ProgressChart } from '@/components/progress/ProgressChart';
import { WeakWordsList } from '@/components/progress/WeakWordsList';
import { StatSummary } from '@/components/progress/StatSummary';
import { cn } from '@/lib/utils';

export default function ProgressPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/progress');
        if (!res.ok) throw new Error('Failed to fetch progress');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-dark-400">Failed to load progress data</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-100 mb-2">Your Progress</h1>
        <p className="text-dark-400">Track your vocabulary learning journey</p>
      </div>

      <StatSummary stats={data.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-surface p-6 rounded-xl border border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Vocabulary Growth</h3>
          <div className="h-[300px]">
            <ProgressChart data={data.vocabularyGrowth} type="area" color="#6366f1" />
          </div>
        </div>

        <div className="glass-surface p-6 rounded-xl border border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Accuracy Over Time</h3>
          <div className="h-[300px]">
            <ProgressChart data={data.accuracyTrend} type="line" color="#10b981" />
          </div>
        </div>

        <div className="glass-surface p-6 rounded-xl border border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Recent Test Scores</h3>
          <div className="h-[300px]">
            <ProgressChart data={data.testPerformance} type="bar" color="#f59e0b" />
          </div>
        </div>
        
        <div className="glass-surface p-6 rounded-xl border border-dark-700">
          <h3 className="text-lg font-semibold text-dark-100 mb-6">Activity (Last 30 Days)</h3>
          <div className="grid grid-cols-10 gap-2 mt-4">
             {Array.from({ length: 30 }).map((_, i) => (
               <div key={i} className={cn("aspect-square rounded-sm", Math.random() > 0.6 ? "bg-brand-500" : "bg-dark-800")} title={`Day ${i+1}`} />
             ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-dark-100 mb-6">Words That Need Work</h2>
        <WeakWordsList words={data.weakWords} />
      </div>
    </div>
  );
}
