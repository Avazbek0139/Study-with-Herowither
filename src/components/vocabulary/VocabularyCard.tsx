'use client';

import { useState } from 'react';
import { Volume2, Pencil, StickyNote, CheckCircle, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// We should use the real util, assuming it's exported from '@/lib/utils'
const speak = (text: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};

export default function VocabularyCard({ item, onDelete, onUpdate }: { item: any, onDelete?: () => void, onUpdate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const confidenceScore = item.progress?.confidenceScore || 0;
  const isLearned = item.progress?.isLearned || false;

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/vocabulary/${item.id}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.();
      } else {
        console.error('Failed to delete');
        setIsDeleting(false);
        setConfirmDelete(false);
      }
    } catch (error) {
      console.error(error);
      setIsDeleting(false);
    }
  };

  const toggleLearned = async () => {
    try {
      const res = await fetch(`/api/vocabulary/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLearned: !isLearned })
      });
      if (res.ok) {
        onUpdate?.();
      }
    } catch (error) {
      console.error('Failed to update learned status', error);
    }
  };

  return (
    <motion.div 
      layout
      className={cn(
        "glass-surface rounded-xl border p-5 flex flex-col shadow-card hover:shadow-glow transition-all duration-300 relative group overflow-hidden",
        isLearned ? "border-success/30" : "border-dark-700 hover:border-brand-500/50"
      )}
    >
      {/* Confidence Indicator Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-dark-800">
        <div 
          className={cn(
            "h-full",
            confidenceScore > 0.8 ? "bg-success" : 
            confidenceScore > 0.4 ? "bg-warning" : 
            confidenceScore > 0 ? "bg-brand-500" : "bg-dark-600"
          )} 
          style={{ width: `${Math.max(confidenceScore * 100, 5)}%` }} 
        />
      </div>

      <div className="flex justify-between items-start mb-3 mt-1">
        <div>
          <h3 className="text-xl font-bold text-dark-100 flex items-center gap-2">
            {item.word}
            {isLearned && <CheckCircle size={16} className="text-success" />}
          </h3>
          {item.pronunciation && (
            <p className="text-sm font-mono text-dark-400">/{item.pronunciation}/</p>
          )}
        </div>
        
        {item.partOfSpeech && (
          <span className="text-xs px-2 py-1 rounded bg-dark-800 text-brand-300 border border-dark-700">
            {item.partOfSpeech}
          </span>
        )}
      </div>

      <div className="mb-4 flex-grow">
        <p className="text-base text-dark-200 mb-2 font-medium">
          {item.translation || <span className="text-dark-500 italic">No translation added</span>}
        </p>
        
        {item.exampleSentence && (
          <p className="text-sm text-dark-400 italic border-l-2 border-brand-500/30 pl-3 line-clamp-2">
            "{item.exampleSentence}"
          </p>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-dark-800 space-y-3 mb-4 text-sm text-dark-300">
              {item.synonyms && item.synonyms.length > 0 && (
                <div>
                  <span className="text-dark-500 text-xs block mb-1">Synonyms</span>
                  <div className="flex flex-wrap gap-1">
                    {item.synonyms.map((syn: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-dark-800 text-dark-200 text-xs">{syn}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.antonyms && item.antonyms.length > 0 && (
                <div>
                  <span className="text-dark-500 text-xs block mb-1">Antonyms</span>
                  <div className="flex flex-wrap gap-1">
                    {item.antonyms.map((ant: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-dark-800 text-dark-200 text-xs">{ant}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.personalNote && (
                <div className="bg-brand-900/10 p-3 rounded-lg border border-brand-900/30">
                  <div className="flex items-center gap-2 text-brand-400 text-xs mb-1">
                    <StickyNote size={12} />
                    <span>Note</span>
                  </div>
                  <p className="text-sm text-dark-200">{item.personalNote}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 bg-dark-900/50 p-2 rounded text-xs text-center">
                <div>
                  <span className="block text-dark-500">Mastery</span>
                  <span className="font-semibold">{Math.round(confidenceScore * 100)}%</span>
                </div>
                <div>
                  <span className="block text-dark-500">Attempts</span>
                  <span className="font-semibold">{item.progress?.attempts || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-800 mt-auto">
        <div className="flex gap-1">
          <button 
            onClick={() => speak(item.word)}
            className="p-2 text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Listen to pronunciation"
          >
            <Volume2 size={18} />
          </button>
          <button 
            onClick={toggleLearned}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isLearned ? "text-success hover:bg-success/10" : "text-dark-400 hover:text-success hover:bg-success/10"
            )}
            title={isLearned ? "Mark as learning" : "Mark as learned"}
          >
            <CheckCircle size={18} className={isLearned ? "fill-success/20" : ""} />
          </button>
          
          {/* Edit feature could link to an edit page or open a modal */}
          <Link href={`/vocabulary/edit/${item.id}`} className="p-2 text-dark-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors inline-block">
            <Pencil size={18} />
          </Link>
          
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              "p-2 rounded-lg transition-colors relative",
              confirmDelete ? "text-error bg-error/10" : "text-dark-400 hover:text-error hover:bg-error/10"
            )}
            title="Delete word"
          >
            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          </button>
        </div>

        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-dark-400 flex items-center gap-1 hover:text-dark-200 transition-colors"
        >
          {expanded ? (
            <>Less <ChevronUp size={14} /></>
          ) : (
            <>More <ChevronDown size={14} /></>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// Need to import Link and Loader2
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
