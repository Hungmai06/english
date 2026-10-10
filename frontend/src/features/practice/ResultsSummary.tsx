'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowRight, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/design-system/components/Button';
import { Question } from '@/types';
import { CoinIcon } from '@/components/CoinIcon';

interface ResultsSummaryProps {
  score: number;
  totalQuestions: number;
  correctCount: number;
  xpEarned: number;
  answers: Record<string, { isCorrect: boolean; givenAnswer: any }>;
  questions: Question[];
  onRetry: () => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  score,
  totalQuestions,
  correctCount,
  xpEarned,
  answers,
  questions,
  onRetry,
}) => {
  useEffect(() => {
    if (score >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe fallback
      }
    }
  }, [score]);

  const incorrectCount = totalQuestions - correctCount;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Trophy Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-card text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Hoàn Thành Buổi Luyện Tập!
          </h2>
          <p className="text-sm text-slate-500">
            {score >= 80
              ? 'Xuất sắc! Khả năng phản xạ và ghi nhớ ngữ pháp của bạn rất tốt.'
              : score >= 60
              ? 'Làm tốt lắm! Hãy xem lại các câu chưa đúng bên dưới để thành thạo 100%.'
              : 'Đừng lo lắng! Xem lại lỗi sai chính là lúc bạn học được nhiều nhất.'}
          </p>
        </div>

        {/* Big Score Numbers */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="text-3xl font-black text-[#FF5C28]">{score}%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Độ chính xác</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="text-3xl font-black text-emerald-600">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Số câu đúng</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1.5">
              <span>+{xpEarned}</span>
              <CoinIcon className="w-6 h-6 inline-block" />
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Xu đạt được</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          {incorrectCount > 0 && (
            <Link href="/review/mistakes" className="w-full sm:w-auto">
              <Button tone="orange" size="md" className="w-full font-bold shadow-md shadow-orange-500/20">
                <RotateCcw className="w-4 h-4 mr-1" />
                <span>Ôn lại {incorrectCount} câu sai</span>
              </Button>
            </Link>
          )}

          <Button
            onClick={onRetry}
            variant="outline"
            tone="blue"
            size="md"
            className="w-full sm:w-auto font-bold"
          >
            <span>Luyện tập lại</span>
          </Button>

          <Link href="/learn/grammar" className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="w-full font-bold text-slate-600">
              <BookOpen className="w-4 h-4 mr-1" />
              <span>Về danh mục bài học</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Answer Breakdown List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 px-1">Chi Tiết Từng Câu Hỏi</h3>

        {questions.map((q, idx) => {
          const ans = answers[q.id];
          const isCorrect = ans?.isCorrect;

          return (
            <div
              key={q.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-subtle flex items-start gap-3.5"
            >
              <div className="mt-0.5">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Câu {idx + 1}</span>
                  <span
                    className={`text-xs font-bold ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? 'Đúng' : 'Cần ôn lại'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800">{q.prompt}</p>
                {!isCorrect && (
                  <p className="text-xs text-slate-500 pt-1">
                    <strong className="text-[#FF5C28]">Giải thích: </strong>
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
