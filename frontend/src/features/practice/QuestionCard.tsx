'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Question } from '@/types';
import { Button } from '@/design-system/components/Button';
import { speakText } from '@/lib/tts';

interface QuestionCardProps {
  question: Question;
  isSubmitted: boolean;
  onAnswer: (answer: any, isCorrect: boolean) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isSubmitted,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  useEffect(() => {
    setSelectedOption('');
    setTypedText('');
    setSelectedLeft(null);
    setMatchedPairs({});

    if (question.type === 'sentence_ordering' && question.scrambledWords) {
      setOrderedWords([]);
      setAvailableWords([...question.scrambledWords]);
    }
  }, [question]);

  // Handle Multiple Choice / Sentence Correction
  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionId);
    const isCorrect = optionId.toLowerCase() === (question.correctAnswer as string).toLowerCase();
    onAnswer(optionId, isCorrect);
  };

  // Handle Fill in the Blank submission
  const handleBlankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted || !typedText.trim()) return;
    const cleanUser = typedText.trim().toLowerCase();
    const cleanCorrect = (question.correctAnswer as string).trim().toLowerCase();
    const isCorrect = cleanUser === cleanCorrect;
    onAnswer(typedText, isCorrect);
  };

  // Handle Sentence Ordering Word Click
  const handleAddWord = (word: string, index: number) => {
    if (isSubmitted) return;
    const nextOrdered = [...orderedWords, word];
    const nextAvailable = availableWords.filter((_, i) => i !== index);
    setOrderedWords(nextOrdered);
    setAvailableWords(nextAvailable);

    if (nextAvailable.length === 0 && question.correctOrder) {
      const isCorrect = nextOrdered.join(' ') === question.correctOrder.join(' ');
      onAnswer(nextOrdered.join(' '), isCorrect);
    }
  };

  const handleResetOrder = () => {
    if (isSubmitted || !question.scrambledWords) return;
    setOrderedWords([]);
    setAvailableWords([...question.scrambledWords]);
  };

  // Handle Matching Pairs Click
  const handleMatchSelect = (side: 'left' | 'right', value: string) => {
    if (isSubmitted) return;
    if (side === 'left') {
      setSelectedLeft(value);
    } else if (side === 'right' && selectedLeft) {
      const next = { ...matchedPairs, [selectedLeft]: value };
      setMatchedPairs(next);
      setSelectedLeft(null);

      if (question.matchingPairs && Object.keys(next).length === question.matchingPairs.length) {
        const allCorrect = question.matchingPairs.every((pair) => next[pair.left] === pair.right);
        onAnswer(next, allCorrect);
      }
    }
  };

  const getVietnameseInstruction = () => {
    switch (question.type) {
      case 'fill_blank':
        return 'Gõ dạng đúng của từ trong ngoặc để hoàn thành câu:';
      case 'sentence_ordering':
        return 'Nhấp các từ bên dưới theo đúng thứ tự câu tiếng Anh chuẩn:';
      case 'matching':
        return 'Ghép động từ bên trái với cụm từ (collocation) tương ứng bên phải:';
      case 'sentence_correction':
        return 'Tìm phần gạch chân bị sai và chọn phương án sửa đúng chuẩn:';
      case 'multiple_choice':
      default:
        return question.instruction || 'Chọn đáp án đúng nhất để hoàn thành câu:';
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>{getVietnameseInstruction()}</span>
          {question.ruleReference && (
            <span className="text-[#FF5C28] bg-[#FFF0E7] px-2.5 py-0.5 rounded-full font-medium">
              {question.ruleReference}
            </span>
          )}
        </div>

        {/* Prompt Text with Audio Icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {question.type === 'sentence_correction' ? (
              <span>
                {question.prompt.split(question.underlinedWord || '')[0]}
                <span className="underline decoration-wavy decoration-orange-400 text-orange-600 font-black">
                  {question.underlinedWord}
                </span>
                {question.prompt.split(question.underlinedWord || '')[1]}
              </span>
            ) : (
              <span>{question.prompt}</span>
            )}
          </div>

          <button
            onClick={() => speakText(question.prompt)}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#FFF0E7] text-slate-600 hover:text-[#FF5C28] transition-colors flex-shrink-0"
            title="Nghe câu này"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Options Area */}
      <div>
        {/* 1. Multiple Choice & Sentence Correction */}
        {(question.type === 'multiple_choice' || question.type === 'sentence_correction') &&
          question.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === question.correctAnswer;

                let btnStyles =
                  'p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ';

                if (!isSubmitted) {
                  btnStyles += isSelected
                    ? 'bg-[#FFF0E7] border-[#FF5C28] text-orange-950 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 hover:border-slate-300';
                } else {
                  if (isCorrect) {
                    btnStyles += 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyles += 'bg-red-50 border-red-400 text-red-950';
                  } else {
                    btnStyles += 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt.id)}
                    disabled={isSubmitted}
                    className={btnStyles}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center uppercase">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        {/* 2. Fill in the Blank Typing */}
        {question.type === 'fill_blank' && (
          <form onSubmit={handleBlankSubmit} className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Nhập câu trả lời của bạn vào đây:
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={typedText}
                  onChange={(e) => setTypedText(e.target.value)}
                  disabled={isSubmitted}
                  placeholder="Ví dụ: tries"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28] disabled:bg-slate-50"
                  autoFocus
                />
                {!isSubmitted && (
                  <Button type="submit" tone="orange" size="md" className="font-bold px-6">
                    Kiểm tra
                  </Button>
                )}
              </div>

              {isSubmitted && (
                <div className="pt-2 flex items-center gap-2 text-sm font-semibold">
                  {typedText.trim().toLowerCase() === (question.correctAnswer as string).toLowerCase() ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Chính xác! Bạn chia động từ rất chuẩn.
                    </span>
                  ) : (
                    <span className="text-red-700 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Đáp án đúng là: <strong className="underline">{question.correctAnswer}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </form>
        )}

        {/* 3. Sentence Ordering / Word arrangement */}
        {question.type === 'sentence_ordering' && (
          <div className="space-y-4">
            {/* Answer builder area */}
            <div className="min-h-[70px] p-4 bg-white rounded-2xl border-2 border-dashed border-blue-200 flex flex-wrap items-center gap-2">
              {orderedWords.length === 0 && (
                <span className="text-xs text-slate-400 font-medium">
                  Nhấp vào các từ bên dưới theo thứ tự để ghép thành câu hoàn chỉnh...
                </span>
              )}
              {orderedWords.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-[#FF5C28] text-white font-bold text-sm shadow-sm animate-in zoom-in-95"
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Scrambled word pool */}
            <div className="flex flex-wrap items-center gap-2">
              {availableWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleAddWord(word, index)}
                  disabled={isSubmitted}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm shadow-sm hover:border-[#FF5C28] hover:bg-[#FFF0E7]/50 transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}

              {!isSubmitted && orderedWords.length > 0 && (
                <button
                  onClick={handleResetOrder}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Xếp lại từ đầu</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4. Matching Pairs */}
        {question.type === 'matching' && question.matchingPairs && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Nhấp một từ ở cột trái, sau đó chọn từ ghép tương ứng ở cột phải:
            </p>

            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                {question.matchingPairs.map((pair, idx) => {
                  const isPaired = !!matchedPairs[pair.left];
                  const isSelected = selectedLeft === pair.left;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMatchSelect('left', pair.left)}
                      disabled={isSubmitted || isPaired}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-bold transition-all ${
                        isPaired
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isSelected
                          ? 'bg-[#FFF0E7] border-[#FF5C28] text-orange-950 ring-2 ring-[#FF5C28]/30'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      {pair.left} {isPaired && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                {question.matchingPairs.map((pair, idx) => {
                  const isUsed = Object.values(matchedPairs).includes(pair.right);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleMatchSelect('right', pair.right)}
                      disabled={isSubmitted || isUsed || !selectedLeft}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                        isUsed
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : selectedLeft
                          ? 'bg-white border-[#FF5C28] text-slate-800 hover:bg-[#FFF0E7]/50 cursor-pointer'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {pair.right}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
