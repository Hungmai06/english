'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Timer,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
} from 'lucide-react';
import { ExamMode, BankQuestion, GrammarTopic } from '@/types/grammarSystem';
import {
  getQuestionsForLesson,
  getQuestionsForTopic,
  getQuestionsForMultiTopics,
  getQuestionsForCourse,
} from '@/lib/questionBankStorage';
import { getGrammarTopics } from '@/lib/grammarCourseStorage';

interface ExamCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ExamMode;
  topicId?: string;
  lessonId?: string;
  lessonTitle?: string;
  topicName?: string;
  customQuestions?: BankQuestion[];
  customDuration?: number;
  customTitle?: string;
}

export const ExamCenterModal: React.FC<ExamCenterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'topic',
  topicId,
  lessonId,
  lessonTitle,
  topicName,
  customQuestions,
  customDuration,
  customTitle,
}) => {
  const [mode, setMode] = useState<ExamMode>(initialMode);
  const [allTopics, setAllTopics] = useState<GrammarTopic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(topicId ? [topicId] : []);

  // Exam flow states
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes default

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      const loadedTopics = getGrammarTopics();
      setAllTopics(loadedTopics);
      if (topicId) setSelectedTopicIds([topicId]);
      resetExamState();
    }
  }, [isOpen, initialMode, topicId]);

  const resetExamState = () => {
    setExamStarted(false);
    setExamSubmitted(false);
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeLeft(customDuration ? customDuration * 60 : 600);
  };

  // Timer countdown when exam is active
  useEffect(() => {
    if (!examStarted || examSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted]);

  // Load questions based on chosen mode
  const handleStartExam = () => {
    let loaded: BankQuestion[] = [];
    let duration = customDuration ? customDuration * 60 : 600;

    if (customQuestions && customQuestions.length > 0) {
      loaded = customQuestions;
    } else if (mode === 'lesson' && topicId) {
      loaded = getQuestionsForLesson(topicId, lessonId);
      duration = Math.max(300, loaded.length * 90);
    } else if (mode === 'topic' && (topicId || selectedTopicIds[0])) {
      const activeTopicId = topicId || selectedTopicIds[0];
      loaded = getQuestionsForTopic(activeTopicId, 10);
      duration = 600;
    } else if (mode === 'multi_topic') {
      loaded = getQuestionsForMultiTopics(selectedTopicIds, 15);
      duration = 900;
    } else if (mode === 'full_course') {
      loaded = getQuestionsForCourse(20);
      duration = 1200;
    }

    if (loaded.length === 0) {
      alert('Chưa có câu hỏi nào trong ngân hàng câu hỏi cho chế độ thi này. Vui lòng thêm câu hỏi hoặc import bài học trước!');
      return;
    }

    setQuestions(loaded);
    setTimeLeft(duration);
    setUserAnswers({});
    setCurrentIndex(0);
    setExamStarted(true);
    setExamSubmitted(false);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (examSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    setExamSubmitted(true);
  };

  // Calculate score
  const scoreResult = useMemo(() => {
    if (!examSubmitted || questions.length === 0) return null;
    let correct = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    const percent = Math.round((correct / questions.length) * 100);
    const passed = percent >= 70;
    return { correct, total: questions.length, percent, passed };
  }, [examSubmitted, questions, userAnswers]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Trung Tâm Thi Online Ngữ Pháp (Question Bank Engine)
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                4 Chế độ thi: Theo Bài · Theo Chuyên Đề · Tổng Hợp Nhiều Chuyên Đề · Toàn Khóa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!examStarted ? (
            /* CONFIG & MODE SELECTOR */
            <div className="space-y-6">
              {/* 4 Exam Modes Tabs */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Chọn 1 trong 4 chế độ thi trực tuyến:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      id: 'lesson',
                      label: '1. Thi theo bài',
                      desc: lessonTitle || 'Kiểm tra nhanh bài học',
                      icon: BookOpen,
                      color: 'border-blue-500 bg-blue-50/50 text-blue-700',
                    },
                    {
                      id: 'topic',
                      label: '2. Thi theo chuyên đề',
                      desc: topicName || '10 câu trong chuyên đề',
                      icon: Layers,
                      color: 'border-purple-500 bg-purple-50/50 text-purple-700',
                    },
                    {
                      id: 'multi_topic',
                      label: '3. Thi tổng hợp',
                      desc: 'Chọn nhiều chuyên đề',
                      icon: Sparkles,
                      color: 'border-amber-500 bg-amber-50/50 text-amber-700',
                    },
                    {
                      id: 'full_course',
                      label: '4. Thi toàn khóa',
                      desc: 'Bao quát 21 chuyên đề',
                      icon: Award,
                      color: 'border-emerald-500 bg-emerald-50/50 text-emerald-700',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = mode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setMode(item.id as ExamMode)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? `${item.color} shadow-sm ring-2 ring-purple-600/20`
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-2" />
                        <div className="font-extrabold text-xs text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode Details / Settings */}
              {mode === 'multi_topic' && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700">
                    Chọn các chuyên đề muốn đưa vào đề thi tổng hợp:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {allTopics.map((t) => {
                      const isChecked = selectedTopicIds.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-purple-50 border-purple-300 font-bold text-purple-900'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTopicIds([...selectedTopicIds, t.id]);
                              } else {
                                setSelectedTopicIds(selectedTopicIds.filter((id) => id !== t.id));
                              }
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="truncate">{t.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                <div className="text-xs text-indigo-950 space-y-1">
                  <p className="font-bold">Đề thi được tạo ngẫu nhiên từ Ngân Hàng Câu Hỏi (Question Bank)</p>
                  <p className="text-indigo-800 leading-relaxed">
                    Hệ thống tự động sử dụng câu hỏi không trùng lặp, đảm bảo độ bao quát chuẩn CEFR. Sau khi nộp bài sẽ hiển thị ngay điểm số, tỷ lệ đỗ/trượt và lời giải chi tiết từng câu.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleStartExam}
                  className="px-6 py-3 rounded-2xl font-extrabold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-200 transition-all flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <span>Bắt Đầu Làm Đề Thi Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !examSubmitted ? (
            /* ACTIVE EXAM RUNNER */
            <div className="space-y-6">
              {/* Exam Top Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">
                    Câu {currentIndex + 1} / {questions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                    CEFR {currentQ?.cefr}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/60">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span>Thời gian còn lại: {formatTime(timeLeft)}</span>
                </div>

                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-colors"
                >
                  Nộp Bài Thi
                </button>
              </div>

              {/* Question Navigator Pill Bar */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50/80 rounded-2xl border border-slate-200">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isCurrent = currentIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-purple-600 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Current Question Card */}
              {currentQ && (
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-black uppercase text-purple-600 tracking-wider">
                      Câu Hỏi #{currentIndex + 1}
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {currentQ.prompt}
                    </h4>
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;
                      const letter = String.fromCharCode(65 + optIdx);
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQ.id, optIdx)}
                          className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className={`text-xs font-medium ${isSelected ? 'font-bold text-purple-950' : 'text-slate-800'}`}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Next / Prev Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Câu trước</span>
                    </button>

                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      disabled={currentIndex === questions.length - 1}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-purple-600 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
                    >
                      <span>Câu tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EXAM RESULT & EXPLANATION REVIEW */
            scoreResult && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Scorecard Hero */}
                <div
                  className={`p-6 rounded-3xl border text-center space-y-2 ${
                    scoreResult.passed
                      ? 'bg-gradient-to-b from-emerald-50 to-teal-50/50 border-emerald-200'
                      : 'bg-gradient-to-b from-rose-50 to-orange-50/50 border-rose-200'
                  }`}
                >
                  <div className="inline-flex p-3 rounded-2xl bg-white shadow-xs">
                    {scoreResult.passed ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    ) : (
                      <XCircle className="w-10 h-10 text-rose-500" />
                    )}
                  </div>
                  <h4 className="font-black text-xl text-slate-900">
                    {scoreResult.passed ? 'Chúc Mừng! Bạn Đã Đạt Chuẩn' : 'Chưa Đạt Điểm Chuẩn'}
                  </h4>
                  <div className="text-3xl font-black text-purple-700">
                    {scoreResult.correct} / {scoreResult.total} ({scoreResult.percent}%)
                  </div>
                  <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                    {scoreResult.passed
                      ? 'Khả năng nắm vững ngữ pháp của bạn rất tốt! Hãy xem lại chi tiết giải thích bên dưới để củng cố kiến thức sâu hơn.'
                      : 'Bạn cần ôn tập thêm một số chuyên đề ngữ pháp này trước khi thử lại đề thi tiếp theo.'}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={resetExamState}
                      className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Thi Lại Đề Này</span>
                    </button>
                  </div>
                </div>

                {/* Review Explanations */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Chi Tiết Bài Làm & Lời Giải:
                  </h5>

                  <div className="space-y-3">
                    {questions.map((q, idx) => {
                      const userChoice = userAnswers[q.id];
                      const isCorrect = userChoice === q.correctAnswer;
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-2xl border text-xs space-y-2 ${
                            isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-extrabold text-slate-900">
                              Câu {idx + 1}: {q.prompt}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isCorrect ? 'Đúng' : 'Sai'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-700">
                            {q.options.map((opt, optIdx) => {
                              const letter = String.fromCharCode(65 + optIdx);
                              const isThisCorrect = optIdx === q.correctAnswer;
                              const isThisUser = optIdx === userChoice;
                              return (
                                <div
                                  key={optIdx}
                                  className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center justify-between ${
                                    isThisCorrect
                                      ? 'bg-emerald-100/70 border-emerald-300 font-bold text-emerald-900'
                                      : isThisUser
                                      ? 'bg-rose-100/70 border-rose-300 font-bold text-rose-900'
                                      : 'bg-white border-slate-200/80 text-slate-600'
                                  }`}
                                >
                                  <span>
                                    {letter}. {opt}
                                  </span>
                                  {isThisCorrect && <span>✓ Đáp án đúng</span>}
                                  {!isThisCorrect && isThisUser && <span>✗ Bạn chọn</span>}
                                </div>
                              );
                            })}
                          </div>

                          {q.explanation && (
                            <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600">
                              <span className="font-bold text-slate-800">💡 Giải thích: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
