'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { LESSONS_DATABASE } from '@/lib/data/mockData';
import { speakText } from '@/lib/tts';
import { markLessonCompleted, toggleBookmark, getBookmarks } from '@/lib/storage';

interface LessonPageProps {
  params: Promise<{ topicId: string; lessonId: string }>;
}

export default function LessonPage({ params }: LessonPageProps) {
  const resolvedParams = use(params);
  const { topicId, lessonId } = resolvedParams;

  // Fetch lesson data
  const lesson =
    LESSONS_DATABASE[lessonId] ||
    (topicId.includes('conditional')
      ? LESSONS_DATABASE['conditionals-1']
      : LESSONS_DATABASE['present-simple-1']);

  // Quick check state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const bms = getBookmarks();
    setIsBookmarked(bms.includes(lesson.id));
  }, [lesson.id]);

  const handleQuickCheck = (index: number) => {
    if (isChecked) return;
    setSelectedOption(index);
    setIsChecked(true);
  };

  const handleMarkComplete = () => {
    markLessonCompleted(lesson.id);
    setIsCompleted(true);
  };

  const handleBookmarkToggle = () => {
    const state = toggleBookmark(lesson.id);
    setIsBookmarked(state);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Top Breadcrumb & Action Strip */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <Container size="md" className="py-3 flex items-center justify-between">
          <Link
            href={`/learn/grammar/${topicId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF5C28] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại danh sách bài của chuyên đề</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmarkToggle}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isBookmarked
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              <span className="hidden sm:inline">{isBookmarked ? 'Đã lưu' : 'Lưu bài'}</span>
            </button>

            <Link href={`/practice?topic=${topicId}`}>
              <Button size="sm" tone="orange" className="font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Luyện tập</span>
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* Main Lesson Body */}
      <Container size="md" className="mt-8 space-y-8">
        {/* Lesson Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center gap-2">
            <Badge tone="orange">Bài học {String(lesson.order).padStart(2, '0')}</Badge>
            <Badge tone="neutral">Trình độ {lesson.level}</Badge>
            <span className="text-xs text-slate-400 font-medium">{lesson.readTime} đọc</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lesson.title}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {lesson.content.introduction}
          </p>
        </div>

        {/* Section 1: Rules & Formulas */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h2 className="text-xl font-bold text-slate-900">Công Thức & Cấu Trúc Ngữ Pháp</h2>
          </div>

          <div className="space-y-3">
            {lesson.content.rules.map((rule, idx) => (
              <Card key={idx} tone="cream" className="border-[#EAE1D5] p-5 space-y-2.5">
                {rule.formula && (
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-[#FFE4D6] font-mono text-sm font-bold text-[#FF5C28] inline-block shadow-sm">
                    {rule.formula}
                  </div>
                )}
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  {rule.explanation}
                </p>

                {rule.conditions && (
                  <ul className="pt-1 space-y-1 text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200/50">
                    {rule.conditions.map((cond, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Section 2: Theory & When to Use */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h2 className="text-xl font-bold text-slate-900">Nguyên Tắc Sử Dụng Cốt Lõi</h2>
          </div>

          <Card tone="white" className="p-6 border-slate-200/80 space-y-3">
            {lesson.content.theory.map((theoryItem, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {theoryItem}
                </p>
              </div>
            ))}
          </Card>
        </div>

        {/* Section 3: High-Yield Examples with Audio */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ví Dụ Thực Tế Kèm Phát Âm</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">Bấm biểu tượng loa để nghe giọng đọc bản xứ</span>
          </div>

          <div className="space-y-3">
            {lesson.content.examples.map((eg, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-subtle hover:border-[#FF5C28] transition-colors flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900">
                    {eg.en}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 italic">
                    Dịch nghĩa: {eg.vi}
                  </p>
                  {eg.note && (
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#FF5C28] bg-[#FFF0E7] px-2 py-0.5 rounded-md">
                      Ghi chú: {eg.note}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => speakText(eg.en)}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#FFF0E7] text-slate-600 hover:text-[#FF5C28] transition-colors flex-shrink-0"
                  title="Nghe phát âm tiếng Anh chuẩn"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Common Mistakes / Traps (Wrong vs Correct) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
              04
            </div>
            <h2 className="text-xl font-bold text-slate-900">Lỗi Sai Người Việt Hay Mắc Phải</h2>
          </div>

          <div className="space-y-3">
            {lesson.content.commonMistakes.map((mistake, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-subtle"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-4 gap-4 bg-slate-50/50">
                  {/* Wrong sentence */}
                  <div className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                        Cách viết SAI (Bị ảnh hưởng tiếng Việt)
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-800 line-through decoration-red-400">
                        {mistake.wrong}
                      </p>
                    </div>
                  </div>

                  {/* Correct sentence */}
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                        Cách viết ĐÚNG chuẩn bản xứ
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {mistake.correct}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50/60 border-t border-amber-100/70 text-xs text-amber-900 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span><strong>Vì sao sai:</strong> {mistake.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Quick Check Interactive Question */}
        {lesson.content.quickCheck && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                05
              </div>
              <h2 className="text-xl font-bold text-slate-900">Kiểm Tra Phản Xạ Nhanh</h2>
            </div>

            <Card tone="white" className="p-6 border-purple-200/60 shadow-card space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-purple-700 uppercase tracking-wider">Câu hỏi kiểm tra</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+10 Xu</span>
              </div>

              <p className="text-sm sm:text-base font-bold text-slate-900">
                {lesson.content.quickCheck.question}
              </p>

              <div className="space-y-2">
                {lesson.content.quickCheck.options.map((opt, i) => {
                  const isChosen = selectedOption === i;
                  const isCorrect = i === lesson.content.quickCheck!.answer;

                  let optionClass =
                    'p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all text-left flex items-center justify-between ';

                  if (!isChecked) {
                    optionClass +=
                      'bg-slate-50 border-slate-200 hover:bg-[#FFF0E7]/60 hover:border-[#FF5C28] text-slate-800 cursor-pointer';
                  } else if (isCorrect) {
                    optionClass +=
                      'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                  } else if (isChosen && !isCorrect) {
                    optionClass +=
                      'bg-red-50 border-red-400 text-red-950 line-through';
                  } else {
                    optionClass += 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleQuickCheck(i)}
                      disabled={isChecked}
                      className={optionClass}
                    >
                      <span>{opt}</span>
                      {isChecked && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                      {isChecked && isChosen && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isChecked && (
                <div className="p-4 rounded-xl bg-[#FFF7F2] border border-[#FFE4D6] text-xs sm:text-sm text-slate-900 animate-in fade-in">
                  <span className="font-bold">Giải thích: </span>
                  {lesson.content.quickCheck.explanation}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Completion & Next Actions Strip */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-slate-900 text-base">Bạn đã học xong lý thuyết bài này?</h4>
            <p className="text-xs text-slate-500">
              Đánh dấu hoàn thành để ghi nhận điểm thưởng và chuyển sang luyện tập củng cố.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleMarkComplete}
              variant={isCompleted ? 'secondary' : 'outline'}
              tone="orange"
              size="md"
              className="font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
              <span>{isCompleted ? 'Đã hoàn thành (+50 Xu)' : 'Đánh dấu đã học'}</span>
            </Button>

            <Link href={`/practice?topic=${topicId}`}>
              <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                <span>Luyện tập bài này</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
