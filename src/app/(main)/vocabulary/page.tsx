'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Loader2 } from 'lucide-react';
import VocabularyCard from '@/components/vocabulary/VocabularyCard';

export default function VocabularyPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [sort, setSort] = useState('a-z');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Simple debounce implementation directly in component
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch, sort]);

  const loadData = () => {
    setIsLoading(true);
    const queryParams = new URLSearchParams({
      filter,
      search: debouncedSearch,
      sort,
      page: page.toString(),
      limit: '12'
    });

    fetch(`/api/vocabulary?${queryParams.toString()}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setIsLoading(false);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [filter, debouncedSearch, sort, page]);

  const tabs = [
    { id: 'all', label: 'All Words' },
    { id: 'learning', label: 'Learning' },
    { id: 'mastered', label: 'Mastered' },
    { id: 'review', label: 'To Review' }
  ];

  const handleWordDeleted = () => {
    loadData();
  };

  const handleWordUpdated = () => {
    loadData();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-100">My Vocabulary</h1>
          <p className="text-dark-400 mt-1">
            {!isLoading && data?.total !== undefined ? `${data.total} words total` : 'Loading...'}
          </p>
        </div>
        <Link href="/vocabulary/add" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Add Words</span>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between bg-dark-900/50 p-4 rounded-xl border border-dark-700/50">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-2 lg:pb-0 hide-scrollbar gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.id 
                  ? 'bg-brand-500 text-white' 
                  : 'bg-dark-800 text-dark-400 hover:text-dark-200 hover:bg-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-dark-500" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="input-field pl-10 w-full sm:w-64"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field appearance-none pr-10 cursor-pointer"
            >
              <option value="a-z">A - Z (Alphabetical)</option>
              <option value="z-a">Z - A</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="accuracy">By Accuracy</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Filter size={16} className="text-dark-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-brand-500" size={40} />
        </div>
      ) : error ? (
        <div className="p-8 text-center glass-surface rounded-xl border-error/20 text-error">
          Failed to load vocabulary. Please try again later.
        </div>
      ) : !data || data.items?.length === 0 ? (
        <div className="text-center py-20 glass-surface rounded-xl border-dashed border-2 border-dark-700">
          <div className="bg-dark-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-dark-400" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-2">No words found</h3>
          <p className="text-dark-400 mb-6 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? "We couldn't find any words matching your current filters." 
              : "You haven't added any vocabulary yet. Get started by adding some words!"}
          </p>
          {(search || filter !== 'all') ? (
            <button 
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          ) : (
            <Link href="/vocabulary/add" className="btn-primary">
              Add Your First Word
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((item: any) => (
              <VocabularyCard 
                key={item.id} 
                item={item} 
                onDelete={handleWordDeleted}
                onUpdate={handleWordUpdated}
              />
            ))}
          </div>

          {/* Pagination */}
          {data.total > 12 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-dark-800 disabled:opacity-50 hover:bg-dark-700 transition-colors"
              >
                Previous
              </button>
              <span className="flex items-center px-4 py-2 rounded-lg bg-dark-900/50">
                Page {page} of {Math.ceil(data.total / 12)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(data.total / 12)}
                className="px-4 py-2 rounded-lg bg-dark-800 disabled:opacity-50 hover:bg-dark-700 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
