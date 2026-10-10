'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Volume2,
  Flame,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { speakText } from '@/lib/tts';

interface QuizModeProps {
  words: VocabularyWord[];
  allWords: VocabularyWord[];
  onWordResult: (wordId: string, isCorrect: boolean) => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ words, allWords, onWordResult }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active quiz pool
  const quizWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5);
  }, [words]);

  const currentWord = quizWords[currentIndex];

  // Generate 4 options for the current question
  const currentOptions = useMemo(() => {
    if (!currentWord) return [];

    const correctAnswer = currentWord.senses[0]?.viDefinition || '';
    // Pick 3 distractors from allWords
    const otherWords = allWords.filter((w) => w.id !== currentWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5);
    const distractorAnswers = shuffledOthers
      .slice(0, 3)
      .map((w) => w.senses[0]?.viDefinition || '');

    const options = [correctAnswer, ...distractorAnswers];
    return options.sort(() => Math.random() - 0.5);
  }, [currentWord, allWords]);

  const handleSelect = (option: string) => {
    if (isAnswered || !currentWord) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentWord.senses[0]?.viDefinition;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      onWordResult(currentWord.id, true);
    } else {
      setStreak(0);
      onWordResult(currentWord.id, false);
    }

    // Play pronunciation sound
    speakText(currentWord.lemma);
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);

    if (currentIndex < quizWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setIsCompleted(false);
  };

  if (!currentWord) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 font-semibold">Cần tối thiểu 4 từ vựng để tạo bài trắc nghiệm.</p>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const accuracy = Math.round((score / quizWords.length) * 100);
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Kết quả trắc nghiệm
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Hoàn Thành Xuất Sắc!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Bạn đã vượt qua toàn bộ các câu hỏi trắc nghiệm của bộ từ.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl">
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Đúng</span>
            <span className="text-xl font-black text-emerald-600">
              {score}/{quizWords.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Độ chính xác</span>
            <span className="text-xl font-black text-[#FF5C28]">{accuracy}%</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Chuỗi cao nhất</span>
            <span className="text-xl font-black text-orange-500 flex items-center justify-center gap-0.5">
              <Flame className="w-4 h-4 fill-orange-500" />
              {maxStreak}
            </span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3.5 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Làm lại bài trắc nghiệm</span>
        </button>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <p className="text-slate-500 font-semibold">Chưa có từ vựng nào trong danh sách để làm trắc nghiệm.</p>
      </div>
    );
  }

  const correctAnswer = currentWord.senses[0]?.viDefinition || '';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Quiz Progress & Stats Bar */}
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white rounded-full border border-slate-200 text-slate-600 shadow-xs">
            Câu {currentIndex + 1} / {quizWords.length}
          </span>
          <span className="px-2.5 py-0.5 bg-[#FFF0E7] text-[#FF5C28] rounded-full text-[11px] font-black uppercase">
            {currentWord.level}
          </span>
        </div>

        <div className="flex items-center gap-3">
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
          style={{ width: `${((currentIndex + 1) / quizWords.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-sm text-center space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Chọn nghĩa tiếng Việt chính xác của từ:
        </span>

        <div className="flex items-center justify-center gap-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {currentWord.lemma}
          </h2>
          <button
            onClick={() => speakText(currentWord.lemma)}
            className="p-2 rounded-full bg-[#FFF0E7] text-[#FF5C28] hover:bg-[#FFE4D6] transition-colors"
            title="Phát âm"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <p className="text-base font-mono text-slate-400">{currentWord.ipa}</p>
      </div>

      {/* 4 Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {currentOptions.map((opt, idx) => {
          let stateStyle = 'bg-white border-slate-200 hover:border-[#FF5C28] text-slate-800';

          if (isAnswered) {
            if (opt === correctAnswer) {
              stateStyle = 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-sm';
            } else if (opt === selectedOption) {
              stateStyle = 'bg-rose-50 border-rose-500 text-rose-700 font-bold';
            } else {
              stateStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={isAnswered}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-150 flex items-start gap-3 text-sm font-semibold select-none ${stateStyle}`}
            >
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {isAnswered && opt === correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              )}
              {isAnswered && opt === selectedOption && opt !== correctAnswer && (
                <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Next Button when answered */}
      {isAnswered && (
        <div className="pt-2 animate-in fade-in duration-150">
          <button
            onClick={handleNextQuestion}
            className="w-full py-4 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm shadow-md shadow-[#FF5C28]/25 transition-all flex items-center justify-center gap-2 transform hover:scale-[1.01]"
          >
            <span>{currentIndex < quizWords.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả bài trắc nghiệm'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
