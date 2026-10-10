'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { speakText } from '@/lib/tts';

interface DictationModeProps {
  words: VocabularyWord[];
  onWordResult: (wordId: string, isCorrect: boolean) => void;
}

export const DictationMode: React.FC<DictationModeProps> = ({ words, onWordResult }) => {
  const [deck, setDeck] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setInputValue('');
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  }, [words]);

  const currentWord = deck[currentIndex];

  // Play audio on new word
  useEffect(() => {
    if (currentWord) {
      speakText(currentWord.lemma);
    }
  }, [currentIndex, currentWord]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !currentWord) return;

    const trimmedInput = inputValue.trim().toLowerCase();
    const correctLemma = currentWord.lemma.trim().toLowerCase();

    const correct = trimmedInput === correctLemma;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      onWordResult(currentWord.id, true);
    } else {
      setStreak(0);
      onWordResult(currentWord.id, false);
    }
  };

  const handleNext = () => {
    setInputValue('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowHint(false);

    if (currentIndex < deck.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
    setInputValue('');
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  };

  if (!currentWord) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 font-semibold">Chưa có từ vựng nào để luyện viết chính tả.</p>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const accuracy = Math.round((score / deck.length) * 100);
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Luyện chính tả hoàn tất!
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Gõ Từ Xuất Sắc!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bạn đã hoàn thành phiên luyện nghe và gõ từ vựng tiếng Anh.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Gõ đúng</span>
            <span className="text-xl font-black text-emerald-600">
              {score}/{deck.length} từ
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Độ chính xác</span>
            <span className="text-xl font-black text-[#FF5C28]">{accuracy}%</span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3.5 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Luyện lại bộ từ này</span>
        </button>
      </div>
    );
  }

  const primarySense = currentWord.senses[0];

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-600 shadow-xs">
            Từ {currentIndex + 1} / {deck.length}
          </span>
          <span className="px-2.5 py-0.5 bg-[#FFF0E7] text-[#FF5C28] rounded-full text-[11px] font-black uppercase">
            {currentWord.level}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-orange-600">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>Chuỗi: {streak}</span>
          </div>
          <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
            Điểm: {score}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#FF5C28] h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
        />
      </div>

      {/* Dictation Sound & Meaning Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm text-center space-y-4">
        {/* Large speaker button */}
        <button
          onClick={() => speakText(currentWord.lemma)}
          className="w-20 h-20 rounded-full bg-[#FFF0E7] hover:bg-[#FFE4D6] text-[#FF5C28] flex items-center justify-center mx-auto transition-transform hover:scale-105 active:scale-95 shadow-md shadow-[#FF5C28]/10"
          title="Bấm để nghe phát âm"
        >
          <Volume2 className="w-10 h-10" />
        </button>

        <span className="text-[11px] text-slate-400 font-semibold block">
          (Bấm vào loa để nghe lại phát âm)
        </span>

        {/* Meaning Hint */}
        <div className="pt-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
            {primarySense?.partOfSpeech}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            {primarySense?.viDefinition}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Gợi ý độ dài: {currentWord.lemma.length} ký tự
          </p>
        </div>

        {/* First Letter Hint */}
        {showHint && (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-800 animate-in fade-in">
            Gợi ý: Bắt đầu bằng chữ "{currentWord.lemma.slice(0, 2).toUpperCase()}"...
          </div>
        )}
      </div>

      {/* Input Field & Submit */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            autoFocus
            disabled={isAnswered}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Gõ từ tiếng Anh bạn vừa nghe..."
            className={`w-full py-4 px-6 text-center text-lg sm:text-xl font-black rounded-2xl border-2 transition-all focus:outline-none ${
              isAnswered
                ? isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-rose-50 border-rose-500 text-rose-800'
                : 'bg-white border-slate-200 focus:border-[#FF5C28] text-slate-900 shadow-sm'
            }`}
          />
        </div>

        {!isAnswered ? (
          <div className="flex gap-2">
            {!showHint && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="py-3.5 px-4 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Gợi ý</span>
              </button>
            )}

            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="flex-1 py-3.5 bg-[#FF5C28] hover:bg-[#ea501e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-[#FF5C28]/25 transition-all"
            >
              Kiểm tra đáp án
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-in fade-in duration-150">
            {/* Feedback details */}
            <div
              className={`p-4 rounded-2xl text-center text-sm font-bold flex items-center justify-center gap-2 ${
                isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Chính xác tuyệt đối! (+15 Xu)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Đáp án đúng là: <strong className="underline text-base">{currentWord.lemma}</strong></span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-4 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex < deck.length - 1 ? 'Từ tiếp theo' : 'Xem kết quả bài học'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
