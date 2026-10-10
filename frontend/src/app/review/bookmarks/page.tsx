'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Volume2, ArrowRight, BookOpen, Trash2 } from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { getBookmarks, toggleBookmark } from '@/lib/storage';
import { VOCABULARY_WORDS, PRACTICE_QUESTIONS } from '@/lib/data/mockData';
import { speakText } from '@/lib/tts';

export default function BookmarksPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarks());
  }, []);

  const handleRemove = (id: string) => {
    toggleBookmark(id);
    setBookmarkedIds(getBookmarks());
  };

  const savedWords = VOCABULARY_WORDS.filter((w) => bookmarkedIds.includes(w.id));
  const savedQuestions = PRACTICE_QUESTIONS.filter((q) => bookmarkedIds.includes(q.id));

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge tone="orange">Personal Archive</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Quickly access complex sentences, challenging questions, and vocabulary items you bookmarked for later study.
          </p>
        </div>

        {/* Saved Vocabulary Words */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span>Bookmarked Words ({savedWords.length})</span>
            </h2>
            <Link
              href="/learn/vocabulary"
              className="text-xs font-bold text-[#FF5C28] hover:text-[#ea501e]"
            >
              Browse Vocabulary →
            </Link>
          </div>

          {savedWords.length === 0 ? (
            <Card tone="white" className="p-8 text-center text-slate-400 text-sm">
              No vocabulary words bookmarked yet. Tap the bookmark icon on any word card to save it.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedWords.map((word) => (
                <Card key={word.id} tone="white" className="p-5 flex items-start justify-between gap-4 border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-bold text-slate-900">{word.lemma}</h4>
                      <span className="font-mono text-xs text-slate-400">{word.ipa}</span>
                      <Badge tone="orange" size="sm">{word.level}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {word.senses[0]?.definition}
                    </p>
                    <p className="text-xs text-slate-400 italic">
                      Tiếng Việt: {word.senses[0]?.viDefinition}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => speakText(word.lemma)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 transition-colors"
                      title="Pronounce"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(word.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Saved Questions */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF5C28]" />
              <span>Bookmarked Questions ({savedQuestions.length})</span>
            </h2>
            <Link
              href="/practice"
              className="text-xs font-bold text-[#FF5C28] hover:text-[#ea501e]"
            >
              Start Practice Session →
            </Link>
          </div>

          {savedQuestions.length === 0 ? (
            <Card tone="white" className="p-8 text-center text-slate-400 text-sm">
              No questions bookmarked yet. Tap the bookmark icon during practice to pin questions here.
            </Card>
          ) : (
            <div className="space-y-3">
              {savedQuestions.map((q) => (
                <Card key={q.id} tone="white" className="p-5 flex items-start justify-between gap-4 border-slate-200">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge tone="orange" size="sm">{q.moduleId}</Badge>
                      <span className="text-xs text-slate-400 font-medium">{q.type}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{q.prompt}</p>
                    <p className="text-xs text-slate-500">{q.explanation}</p>
                  </div>

                  <button
                    onClick={() => handleRemove(q.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Remove Bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
