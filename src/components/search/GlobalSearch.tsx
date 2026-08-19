'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  word: string;
  translation: string;
  partOfSpeech: string;
  pronunciation?: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut to open Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Search API
  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle keyboard navigation within results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    router.push(`/vocabulary`);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-dark-400 bg-dark-900 border border-dark-700 rounded-lg hover:bg-dark-800 transition-colors w-48 sm:w-64"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Search vocabulary...</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-dark-800 rounded border border-dark-700 font-mono">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 sm:px-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-3 border-b border-dark-700">
                <Search className="w-5 h-5 text-dark-400 mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search words, translations..."
                  className="flex-1 bg-transparent border-none outline-none text-dark-100 placeholder:text-dark-500 text-lg"
                />
                {loading && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-3" />}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-dark-400 hover:text-dark-100 rounded bg-dark-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length > 0 ? (
                  <ul className="space-y-1">
                    {results.map((result, idx) => (
                      <li key={result.id}>
                        <button
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            "w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors",
                            idx === selectedIndex ? "bg-dark-800 text-dark-100" : "text-dark-300 hover:bg-dark-800/50"
                          )}
                        >
                          <Book className={cn("w-4 h-4 mr-3", idx === selectedIndex ? "text-brand-400" : "text-dark-500")} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline space-x-2">
                              <span className="font-semibold text-base truncate">{result.word}</span>
                              {result.pronunciation && (
                                <span className="text-xs text-dark-400 font-mono truncate">{result.pronunciation}</span>
                              )}
                              <span className="text-xs px-1.5 py-0.5 rounded bg-dark-700 text-dark-300 uppercase shrink-0">
                                {result.partOfSpeech}
                              </span>
                            </div>
                            <p className="text-sm text-dark-400 truncate mt-0.5">{result.translation}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query.trim() ? (
                  <div className="p-8 text-center text-dark-400">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="p-8 text-center text-dark-500 flex flex-col items-center">
                    <Search className="w-8 h-8 mb-2 opacity-50" />
                    <p>Start typing to search your vocabulary</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
