'use client';

import React from 'react';
import { Lightbulb, Bookmark, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/design-system/components/Button';
import { Question } from '@/types';
import { toggleBookmark, getBookmarks } from '@/lib/storage';

interface ExplanationBoxProps {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const ExplanationBox: React.FC<ExplanationBoxProps> = ({
  question,
  isCorrect,
  onNext,
  isLastQuestion,
}) => {
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  React.useEffect(() => {
    const bms = getBookmarks();
    setIsBookmarked(bms.includes(question.id));
  }, [question.id]);

  const handleBookmark = () => {
    const nextState = toggleBookmark(question.id);
    setIsBookmarked(nextState);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-card space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Status banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isCorrect ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className={`text-base font-black ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
              {isCorrect ? 'Chính xác! Bạn ghi nhớ rất tốt.' : 'Chưa chính xác'}
            </h4>
            <p className="text-xs text-slate-500">
              {isCorrect
                ? '+15 Xu thưởng'
                : 'Đã tự động lưu vào Sổ tay lỗi sai để bạn ôn tập lại.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
            isBookmarked
              ? 'bg-amber-50 text-amber-600 border-amber-300'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
          title="Lưu câu hỏi này để xem lại sau"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu câu'}</span>
        </button>
      </div>

      {/* Explanation text */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFE7DC] space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FF5C28]">
          <Lightbulb className="w-4 h-4 text-[#FF5C28]" />
          <span>Giải Thích Ngữ Pháp & Mẹo Nhớ Cho Người Việt</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          {question.explanation}
        </p>
      </div>

      {/* Next Question CTA */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={onNext}
          tone="orange"
          size="md"
          className="font-bold shadow-md shadow-orange-500/20 px-6"
        >
          <span>{isLastQuestion ? 'Xem kết quả buổi luyện tập' : 'Câu hỏi tiếp theo'}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
