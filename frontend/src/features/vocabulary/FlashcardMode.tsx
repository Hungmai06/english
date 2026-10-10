'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Bookmark,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { speakText } from '@/lib/tts';

interface FlashcardModeProps {
  words: VocabularyWord[];
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  onWordResult: (wordId: string, isCorrect: boolean) => void;
}

export const FlashcardMode: React.FC<FlashcardModeProps> = ({
  words,
  bookmarkedIds,
  onToggleBookmark,
  onWordResult,
}) => {
  const [deck, setDeck] = useState<VocabularyWord[]>(words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  useEffect(() => {
    setDeck(words);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [words]);

  const currentWord = deck[currentIndex] || deck[0];
  const isBookmarked = currentWord ? bookmarkedIds.includes(currentWord.id) : false;

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay || !currentWord) return;
    const timer = setInterval(() => {
      setIsFlipped((prev) => {
        if (!prev) {
          return true;
        } else {
          setCurrentIndex((idx) => (idx + 1) % deck.length);
          return false;
        }
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [isAutoPlay, currentWord, deck.length]);

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(deck.length - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentWord) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 font-semibold">Chưa có từ vựng nào trong danh sách này.</p>
      </div>
    );
  }

  const primarySense = currentWord.senses[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 shadow-xs">
            Thẻ {currentIndex + 1} / {deck.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E7] text-[#FF5C28] text-[11px] font-black uppercase">
            {currentWord.level}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Shuffle button */}
          <button
            onClick={handleShuffle}
            className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Xáo trộn thứ tự từ"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Auto play toggle */}
          <button
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-xs ${
              isAutoPlay
                ? 'bg-[#FF5C28] text-white border-[#FF5C28]'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Tự động lật và chuyển thẻ"
          >
            {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Tự chạy</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(currentWord.id)}
            className={`p-2 rounded-xl border transition-colors shadow-xs ${
              isBookmarked
                ? 'bg-amber-50 border-amber-300 text-amber-500'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
            }`}
            title={isBookmarked ? 'Bỏ lưu' : 'Lưu vào sổ từ'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[340px] sm:min-h-[380px] bg-white rounded-3xl border-2 border-slate-200/90 hover:border-[#FF5C28]/60 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col justify-between select-none relative group"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            {isFlipped ? 'Mặt sau' : 'Mặt trước: Nhấn để lật thẻ'}
          </span>
          <span className="flex items-center gap-1 text-[#FF5C28] font-bold group-hover:underline">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Lật thẻ</span>
          </span>
        </div>

        {/* Center Card Content */}
        {!isFlipped ? (
          /* FRONT SIDE */
          <div className="text-center space-y-4 my-auto">
            <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {primarySense?.partOfSpeech || 'Từ vựng'}
            </div>

            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {currentWord.lemma}
            </h2>

            <p className="text-lg font-mono text-slate-500">{currentWord.ipa}</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                speakText(currentWord.lemma);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0E7] text-[#FF5C28] hover:bg-[#FFE4D6] font-bold text-xs transition-colors shadow-xs"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe phát âm</span>
            </button>
          </div>
        ) : (
          /* BACK SIDE */
          <div className="text-center my-auto animate-in fade-in duration-200 py-8">
            <h3 className="text-2xl sm:text-4xl font-black text-[#FF5C28] leading-relaxed max-w-xl mx-auto">
              {primarySense?.viDefinition}
            </h3>
          </div>
        )}

        {/* Card Footer: Progress tracker dots */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#FF5C28] h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Bottom Evaluation / Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors shadow-xs"
          title="Thẻ trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-2 gap-3 flex-1">
          <button
            onClick={() => {
              onWordResult(currentWord.id, false);
              handleNext();
            }}
            className="py-3.5 px-4 rounded-2xl border-2 border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm transition-all"
          >
            Chưa nhớ (Cần ôn lại)
          </button>

          <button
            onClick={() => {
              onWordResult(currentWord.id, true);
              handleNext();
            }}
            className="py-3.5 px-4 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5C28]/25 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã thuộc (+15 Xu)</span>
          </button>
        </div>

        <button
          onClick={handleNext}
          className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-colors shadow-xs"
          title="Thẻ tiếp theo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
