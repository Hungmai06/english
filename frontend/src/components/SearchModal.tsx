'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Sparkles, Award, ArrowRight, X } from 'lucide-react';
import { Modal } from '@/design-system/components/Modal';
import { GRAMMAR_CATEGORIES, VOCABULARY_WORDS, EXAMS_DATA } from '@/lib/data/mockData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');

  // Collect all searchable items
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { grammar: [], vocabulary: [], exams: [] };

    // Search grammar topics
    const grammarMatches = GRAMMAR_CATEGORIES.flatMap((c) =>
      c.topics
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.summary.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)
        )
        .map((t) => ({ ...t, categoryName: c.name }))
    );

    // Search vocabulary
    const vocabMatches = VOCABULARY_WORDS.filter(
      (w) =>
        w.lemma.toLowerCase().includes(q) ||
        w.senses.some(
          (s) =>
            s.definition.toLowerCase().includes(q) ||
            s.viDefinition.toLowerCase().includes(q)
        )
    );

    // Search exams
    const examMatches = EXAMS_DATA.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );

    return {
      grammar: grammarMatches.slice(0, 4),
      vocabulary: vocabMatches.slice(0, 4),
      exams: examMatches.slice(0, 3),
    };
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const hasAnyResults =
    results.grammar.length > 0 ||
    results.vocabulary.length > 0 ||
    results.exams.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" className="p-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search grammar, vocabulary, rules, exams... (e.g. 'Present Simple', 'meticulous')"
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-base focus:outline-none"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
        {!query && (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm">Type any keyword to search across the entire curriculum.</p>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs">
              <span className="px-2 py-1 bg-slate-100 rounded-md font-mono">Present Simple</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md font-mono">Conditionals</span>
              <span className="px-2 py-1 bg-slate-100 rounded-md font-mono">TOEIC</span>
            </div>
          </div>
        )}

        {query && !hasAnyResults && (
          <div className="py-8 text-center text-slate-500">
            <p className="text-sm">No matches found for &quot;{query}&quot;.</p>
          </div>
        )}

        {results.grammar.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF5C28] mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Grammar Topics</span>
            </div>
            <div className="space-y-1.5">
              {results.grammar.map((t) => (
                <Link
                  key={t.id}
                  href={`/learn/grammar/${t.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FFF0E7]/70 transition-colors group"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-[#FF5C28]">
                      {t.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{t.summary}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 group-hover:text-[#FF5C28]">
                    <span>{t.difficulty}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {results.vocabulary.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vocabulary</span>
            </div>
            <div className="space-y-1.5">
              {results.vocabulary.map((w) => (
                <Link
                  key={w.id}
                  href={`/learn/vocabulary?word=${w.lemma}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-orange-50/70 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-orange-600">
                      {w.lemma}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{w.ipa}</span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      — {w.senses[0]?.viDefinition}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-semibold">
                    {w.level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {results.exams.length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Exams & Tests</span>
            </div>
            <div className="space-y-1.5">
              {results.exams.map((e) => (
                <Link
                  key={e.id}
                  href={`/exams/${e.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                >
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700">
                      {e.title}
                    </h4>
                    <p className="text-xs text-slate-500">{e.durationMinutes} mins · {e.totalQuestions} questions</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
