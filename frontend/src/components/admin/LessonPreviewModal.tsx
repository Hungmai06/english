'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  HelpCircle,
  Timer,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  ExternalLink,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import { AdminGrammarLessonItem } from '@/lib/adminStorage';
import { speakText } from '@/lib/tts';

interface LessonPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: AdminGrammarLessonItem | null;
  onEdit?: (lesson: AdminGrammarLessonItem) => void;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onEdit,
}) => {
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises' | 'exam'>('theory');

  // Exercise quiz interactive state
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, number>>({});
  const [exerciseChecked, setExerciseChecked] = useState<Record<string, boolean>>({});

  // Exam interactive state
  const [examActive, setExamActive] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examTimeLeft, setExamTimeLeft] = useState<number>(600);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examScore, setExamScore] = useState<number | null>(null);

  useEffect(() => {
    if (lesson) {
      setActiveTab('theory');
      setExerciseAnswers({});
      setExerciseChecked({});
      setExamActive(false);
      setExamAnswers({});
      setExamSubmitted(false);
      setExamScore(null);
      setExamTimeLeft((lesson.exam?.durationMinutes || 10) * 60);
    }
  }, [lesson, isOpen]);

  // Exam timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && !examSubmitted && examTimeLeft > 0) {
      timer = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            handleExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, examSubmitted, examTimeLeft]);

  if (!isOpen || !lesson) return null;

  const handleStartExam = () => {
    setExamActive(true);
    setExamSubmitted(false);
    setExamScore(null);
    setExamAnswers({});
    setExamTimeLeft((lesson.exam?.durationMinutes || 10) * 60);
  };

  const handleExamSubmit = () => {
    let correctCount = 0;
    const questions = lesson.exam?.questions || [];
    questions.forEach((q) => {
      if (examAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    setExamScore(correctCount);
    setExamSubmitted(true);
    setExamActive(false);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-2xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-black text-sm">
              #{lesson.order}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Xem Trước Giao Diện Học Viên
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                  {lesson.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                  {lesson.topicTitle}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {lesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(lesson);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chỉnh Sửa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Dedicated Tabs Navigation Strip (Identical to User Page) */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          {/* Tab 1: Lí thuyết & Ví dụ */}
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'theory'
                ? 'bg-[#FF5C28] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Lí Thuyết & Ví Dụ</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'theory' ? 'bg-white/20' : 'bg-orange-100 text-[#FF5C28]'
              }`}
            >
              {lesson.theory?.formulas?.length || 0} công thức • {lesson.examples?.length || 0} ví dụ
            </span>
          </button>

          {/* Tab 2: Bài tập */}
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>2. Bài Tập</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'exercises' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {lesson.exercises?.length || 0} câu hỏi
            </span>
          </button>

          {/* Tab 3: Thi online */}
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'exam'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>3. Thi Online</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'exam' ? 'bg-white/20' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {lesson.exam?.durationMinutes || 10}p ({lesson.exam?.questions?.length || 0}c)
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: LÍ THUYẾT & VÍ DỤ (2 KHUNG TEXT: TÀI LIỆU TRÊN, VÍ DỤ DƯỚI) */}
          {/* ======================================================== */}
          {activeTab === 'theory' && (() => {
            const parts: string[] = [];
            if (lesson.theory?.overview) parts.push(lesson.theory.overview);
            if (lesson.theory?.formulas && lesson.theory.formulas.length > 0) {
              const fLines = lesson.theory.formulas
                .map((f) => `• ${f.type ? `${f.type}: ` : ''}${f.pattern}${f.note ? ` (${f.note})` : ''}`)
                .join('\n');
              parts.push(`Cấu Trúc & Công Thức:\n${fLines}`);
            }
            if (lesson.theory?.usages && lesson.theory.usages.length > 0) {
              const uLines = lesson.theory.usages
                .map((u) => `• ${u.title}${u.detail ? `: ${u.detail}` : ''}${u.signals?.length ? ` (Dấu hiệu: ${u.signals.join(', ')})` : ''}`)
                .join('\n');
              parts.push(`Cách Dùng & Dấu Hiệu:\n${uLines}`);
            }
            if (lesson.theory?.pitfalls && lesson.theory.pitfalls.length > 0) {
              const pLines = lesson.theory.pitfalls
                .map((p) => `• Lưu ý: Sai: ${p.wrong} -> Đúng: ${p.correct} (${p.explanation})`)
                .join('\n');
              parts.push(`Bẫy Cần Tránh:\n${pLines}`);
            }
            const previewTheory = parts.join('\n\n').trim();
            const previewExamples = (lesson.examples || [])
              .map((ex) => `• ${ex.en}${ex.vi ? `\n  (${ex.vi})` : ''}`)
              .join('\n\n');

            return (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* KHUNG TRÊN: TÀI LIỆU LÝ THUYẾT */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        1. Tài Liệu Lý Thuyết
                      </h3>
                      <span className="text-xs text-slate-400">
                        Bản chất, quy tắc và cấu trúc ngữ pháp trọng tâm
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 leading-relaxed font-medium bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/80 whitespace-pre-line break-words min-h-[140px]">
                    {previewTheory || 'Chưa có thông tin tài liệu lý thuyết.'}
                  </div>
                </div>

                {/* KHUNG DƯỚI: VÍ DỤ MINH HỌA */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        2. Ví Dụ Minh Họa
                      </h3>
                      <span className="text-xs text-slate-400">
                        Các câu ví dụ thực tế minh họa song ngữ
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-slate-800 leading-relaxed font-medium bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/80 whitespace-pre-line break-words min-h-[100px]">
                    {previewExamples || 'Chưa có ví dụ minh họa.'}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ======================================================== */}
          {/* TAB 3: BÀI TẬP (EXERCISES)                               */}
          {/* ======================================================== */}
          {activeTab === 'exercises' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Học viên có thể nhấp chọn đáp án và bấm kiểm tra:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {lesson.exercises?.length || 0} câu bài tập tương tác
                </span>
              </div>

              <div className="space-y-4">
                {lesson.exercises?.map((q, idx) => {
                  const chosen = exerciseAnswers[q.id];
                  const checked = exerciseChecked[q.id];
                  const isCorrect = chosen === q.correctAnswer;

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700 uppercase tracking-wider">
                          Câu {idx + 1}
                        </span>
                        {checked && (
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center gap-1 ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Chính xác (+10 Xu)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Chưa chính xác</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-slate-900 leading-relaxed">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const isOptionChosen = chosen === oIdx;
                          const isAnswerKey = oIdx === q.correctAnswer;

                          let btnStyle =
                            'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100';
                          if (checked) {
                            if (isAnswerKey) {
                              btnStyle =
                                'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                            } else if (isOptionChosen && !isCorrect) {
                              btnStyle =
                                'bg-rose-50 border-rose-300 text-rose-800 line-through';
                            }
                          } else if (isOptionChosen) {
                            btnStyle =
                              'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={checked}
                              onClick={() =>
                                setExerciseAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                              }
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                            >
                              <span className="font-bold mr-1.5">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        {!checked ? (
                          <button
                            disabled={chosen === undefined}
                            onClick={() =>
                              setExerciseChecked((prev) => ({ ...prev, [q.id]: true }))
                            }
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs"
                          >
                            Kiểm Tra Đáp Án
                          </button>
                        ) : (
                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 w-full space-y-1">
                            <span className="font-bold text-slate-900 block">
                              💡 Lời giải thích:
                            </span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: THI ONLINE (ONLINE EXAM)                          */}
          {/* ======================================================== */}
          {activeTab === 'exam' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {!examActive && !examSubmitted ? (
                /* Pre-Exam Info Card */
                <div className="bg-white rounded-3xl p-8 border border-purple-200 text-center space-y-5 max-w-lg mx-auto my-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <Timer className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      Đề Thi Đánh Giá Năng Lực Trực Tuyến
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Bài thi gồm{' '}
                      <strong>{lesson.exam?.questions?.length || 0} câu hỏi trắc nghiệm</strong>{' '}
                      trong thời gian <strong>{lesson.exam?.durationMinutes || 10} phút</strong>.
                      Điểm đạt: {lesson.exam?.passScore || 1}/{lesson.exam?.questions?.length || 0} câu.
                    </p>
                  </div>
                  <button
                    onClick={handleStartExam}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all"
                  >
                    Bắt Đầu Làm Thử Đề Thi
                  </button>
                </div>
              ) : examActive && !examSubmitted ? (
                /* Active Exam Mode */
                <div className="space-y-5">
                  <div className="bg-purple-950 text-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                      <Timer className="w-4 h-4 text-purple-300" />
                      <span>Thời gian còn lại:</span>
                    </span>
                    <span className="text-xl font-mono font-black text-amber-300">
                      {formatTimer(examTimeLeft)}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {lesson.exam?.questions?.map((q, idx) => (
                      <div
                        key={q.id || idx}
                        className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3"
                      >
                        <span className="text-xs font-bold text-slate-400">
                          Câu {idx + 1} / {lesson.exam.questions.length}
                        </span>
                        <p className="text-sm font-bold text-slate-900">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options?.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() =>
                                setExamAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                              }
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${
                                examAnswers[q.id] === oIdx
                                  ? 'bg-purple-100 border-purple-400 text-purple-950 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="font-bold mr-1.5">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleExamSubmit}
                      className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md transition-all"
                    >
                      Nộp Bài Thi
                    </button>
                  </div>
                </div>
              ) : (
                /* Exam Results */
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 max-w-md mx-auto my-4 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Kết Quả Bài Thi Thử Nghiệm
                    </span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {examScore} / {lesson.exam?.questions?.length || 0}
                    </div>
                    <p className="text-xs text-emerald-600 font-bold mt-1">
                      {examScore! >= (lesson.exam?.passScore || 1)
                        ? '🎉 Chúc mừng! Đã đạt yêu cầu qua bài.'
                        : '💡 Chưa đạt điểm yêu cầu, hãy thử lại.'}
                    </p>
                  </div>
                  <button
                    onClick={handleStartExam}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm Lại Đề Thi</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
