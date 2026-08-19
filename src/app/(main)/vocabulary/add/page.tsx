'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Loader2, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddVocabularyPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Single word state
  const [formData, setFormData] = useState({
    word: '',
    translation: '',
    partOfSpeech: '',
    exampleSentence: '',
    pronunciation: '',
    synonyms: '',
    antonyms: '',
    personalNote: ''
  });

  // Bulk add state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkResults, setBulkResults] = useState<{added: string[], skipped: string[], errors: string[]} | null>(null);

  const partsOfSpeech = [
    'noun', 'verb', 'adjective', 'adverb', 'preposition', 
    'conjunction', 'pronoun', 'interjection', 'phrasal verb', 'idiom'
  ];

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word.trim()) {
      setErrorMsg('Word is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`"${formData.word}" added successfully!`);
        setFormData({
          word: '', translation: '', partOfSpeech: '', exampleSentence: '',
          pronunciation: '', synonyms: '', antonyms: '', personalNote: ''
        });
        // Clear success message after 3s
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to add word');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    const words = bulkInput.split('\n').map(w => w.trim()).filter(w => w.length > 0);
    if (words.length === 0) {
      setErrorMsg('Please enter at least one word');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    setBulkResults(null);

    try {
      const res = await fetch('/api/vocabulary/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words })
      });

      const data = await res.json();

      if (res.ok) {
        setBulkResults(data);
        setBulkInput(''); // Clear input on success
        if (data.added.length > 0) {
          setSuccessMsg(`Successfully added ${data.added.length} words.`);
        }
      } else {
        setErrorMsg(data.error || 'Failed to process bulk add');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-100">Add Vocabulary</h1>
        <p className="text-dark-400 mt-2">Expand your knowledge by adding new words to learn.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 p-1 bg-dark-900 rounded-lg w-full max-w-md">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'single' 
              ? 'bg-brand-500 text-white shadow-md' 
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Plus size={16} />
            <span>Single Word</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'bulk' 
              ? 'bg-brand-500 text-white shadow-md' 
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ListPlus size={16} />
            <span>Bulk Add</span>
          </div>
        </button>
      </div>

      {/* Notifications */}
      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 mb-6 rounded-lg bg-success/10 border border-success/30 text-success flex items-center gap-3"
          >
            <Check size={20} />
            <p>{successMsg}</p>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 mb-6 rounded-lg bg-error/10 border border-error/30 text-error"
          >
            <p>{errorMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forms */}
      <div className="glass-surface p-6 md:p-8 rounded-xl shadow-card border border-dark-700/50">
        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="word" className="block text-sm font-medium text-dark-200">
                  Word / Phrase <span className="text-error">*</span>
                </label>
                <input
                  id="word"
                  type="text"
                  required
                  value={formData.word}
                  onChange={(e) => setFormData({...formData, word: e.target.value})}
                  className="input-field w-full text-lg font-bold"
                  placeholder="e.g. Resilient"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="translation" className="block text-sm font-medium text-dark-200">
                  Translation
                </label>
                <input
                  id="translation"
                  type="text"
                  value={formData.translation}
                  onChange={(e) => setFormData({...formData, translation: e.target.value})}
                  className="input-field w-full"
                  placeholder="e.g. Chidamli"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="partOfSpeech" className="block text-sm font-medium text-dark-200">
                  Part of Speech
                </label>
                <select
                  id="partOfSpeech"
                  value={formData.partOfSpeech}
                  onChange={(e) => setFormData({...formData, partOfSpeech: e.target.value})}
                  className="input-field w-full appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {partsOfSpeech.map(pos => (
                    <option key={pos} value={pos}>{pos.charAt(0).toUpperCase() + pos.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="exampleSentence" className="block text-sm font-medium text-dark-200">
                  Example Sentence
                </label>
                <textarea
                  id="exampleSentence"
                  rows={2}
                  value={formData.exampleSentence}
                  onChange={(e) => setFormData({...formData, exampleSentence: e.target.value})}
                  className="input-field w-full resize-none"
                  placeholder="Write a sentence using the word..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="pronunciation" className="block text-sm font-medium text-dark-200">
                  Pronunciation (IPA)
                </label>
                <input
                  id="pronunciation"
                  type="text"
                  value={formData.pronunciation}
                  onChange={(e) => setFormData({...formData, pronunciation: e.target.value})}
                  className="input-field w-full font-mono text-sm"
                  placeholder="e.g. rɪˈzɪl.jənt"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="synonyms" className="block text-sm font-medium text-dark-200">
                  Synonyms (comma separated)
                </label>
                <input
                  id="synonyms"
                  type="text"
                  value={formData.synonyms}
                  onChange={(e) => setFormData({...formData, synonyms: e.target.value})}
                  className="input-field w-full"
                  placeholder="e.g. tough, strong"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="personalNote" className="block text-sm font-medium text-dark-200">
                  Personal Notes
                </label>
                <textarea
                  id="personalNote"
                  rows={2}
                  value={formData.personalNote}
                  onChange={(e) => setFormData({...formData, personalNote: e.target.value})}
                  className="input-field w-full resize-none"
                  placeholder="Any tricks to remember this word?"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4 border-t border-dark-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full md:w-auto min-w-[150px] flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Add Word'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/vocabulary')}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="bulkInput" className="block text-sm font-medium text-dark-200">
                Paste words here (one per line)
              </label>
              <textarea
                id="bulkInput"
                rows={10}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                className="input-field w-full font-mono text-sm leading-relaxed"
                placeholder={`advance\ngrieve\ndraining\nprove\nscandal`}
              />
              <p className="text-xs text-dark-400">
                Translations, examples, and other details can be added later by editing the words.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-4 border-t border-dark-800">
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting || !bulkInput.trim()}
                className="btn-primary w-full md:w-auto min-w-[150px] flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Process Words'}
              </button>
            </div>

            {/* Bulk Results Summary */}
            {bulkResults && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 space-y-4"
              >
                <h3 className="font-semibold border-b border-dark-700 pb-2">Results</h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-success">{bulkResults.added.length}</div>
                    <div className="text-xs text-success/80 uppercase">Added</div>
                  </div>
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-warning">{bulkResults.skipped.length}</div>
                    <div className="text-xs text-warning/80 uppercase">Skipped</div>
                  </div>
                  <div className="bg-error/10 border border-error/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-error">{bulkResults.errors.length}</div>
                    <div className="text-xs text-error/80 uppercase">Failed</div>
                  </div>
                </div>

                {bulkResults.skipped.length > 0 && (
                  <div className="text-sm">
                    <p className="text-dark-300 font-medium mb-1">Skipped (already exist):</p>
                    <div className="flex flex-wrap gap-1">
                      {bulkResults.skipped.map((w, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-dark-800 text-dark-400 text-xs">{w}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
