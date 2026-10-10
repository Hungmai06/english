'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  FileCheck,
  Send,
  Award,
  AlertCircle
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { addXP } from '@/lib/storage';

interface SentenceRewrite {
  id: string;
  original: string;
  keyword: string;
  expectedPattern: string;
  acceptableAnswers: string[];
  explanation: string;
}

const REWRITE_QUESTIONS: SentenceRewrite[] = [
  {
    id: 'rw-1',
    original: 'It was so noisy that I could not concentrate on my studies.',
    keyword: 'TOO',
    expectedPattern: 'It was _____ for me to concentrate on my studies.',
    acceptableAnswers: [
      'too noisy',
      'too noisy for me'
    ],
    explanation: 'Cấu trúc: "too + adj + (for sb) + to V" dùng để thay thế cho "so + adj + that + S cannot + V".'
  },
  {
    id: 'rw-2',
    original: 'Although she was exhausted, she finished the entire assignment.',
    keyword: 'DESPITE',
    expectedPattern: '_____ being exhausted, she finished the entire assignment.',
    acceptableAnswers: [
      'despite',
      'in spite of'
    ],
    explanation: 'Cấu trúc: "Despite / In spite of + V-ing / Noun phrase" thay thế cho "Although / Even though + S + V".'
  },
  {
    id: 'rw-3',
    original: 'If you do not leave immediately, you will miss the morning train.',
    keyword: 'UNLESS',
    expectedPattern: '_____ you leave immediately, you will miss the morning train.',
    acceptableAnswers: [
      'unless'
    ],
    explanation: 'Cấu trúc: "Unless = If ... not". Vế sau giữ nguyên thì tương lai đơn (will miss).'
  }
];

export default function WritingLabPage() {
  const [activeTab, setActiveTab] = useState<'rewrite' | 'studio'>('rewrite');

  // Rewrite state
  const [rewriteInputs, setRewriteInputs] = useState<Record<string, string>>({});
  const [rewriteChecked, setRewriteChecked] = useState(false);

  // Essay Studio state
  const [essayText, setEssayText] = useState(
    'Dear Mr. Davis,\n\nI am writing to inform you that the final delivery of the analytics module will be slightly delayed by two days due to unexpected server synchronization tests.\n\nOur team is working diligently to ensure the highest code quality and security standards. We sincerely apologize for this inconvenience and will keep you updated every step of the way.\n\nBest regards,\nAlex'
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [essayFeedback, setEssayFeedback] = useState<any>(null);

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;

  const handleCheckRewrites = () => {
    setRewriteChecked(true);
    let correct = 0;
    REWRITE_QUESTIONS.forEach((q) => {
      const userVal = rewriteInputs[q.id]?.trim().toLowerCase() || '';
      const isMatch = q.acceptableAnswers.some((ans) => userVal === ans.toLowerCase());
      if (isMatch) correct++;
    });
    if (correct > 0) addXP(correct * 15);
  };

  const handleEvaluateEssay = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEssayFeedback({
        overallScore: 8.5,
        wordCount,
        rubric: [
          { criteria: 'Task Response', score: '9.0/9.0', comment: 'Nêu rõ lý do hoãn, thời gian cụ thể (2 ngày) và lời xin lỗi chân thành.' },
          { criteria: 'Coherence & Cohesion', score: '8.5/9.0', comment: 'Bố cục thư chuẩn mực (mở đầu, giải thích nguyên nhân, cam kết, kết thư).' },
          { criteria: 'Lexical Resource', score: '8.5/9.0', comment: 'Sử dụng các từ vựng học thuật & thương mại tốt: "diligently", "unexpected synchronization", "sincerely apologize".' },
          { criteria: 'Grammar & Accuracy', score: '9.0/9.0', comment: 'Cấu trúc câu phức và thì động từ hoàn toàn chuẩn xác.' }
        ],
        advancedVocab: ['diligently', 'synchronization', 'sincerely apologize', 'inconvenience'],
        recommendation: 'Thư viết rất chuyên nghiệp, độ dài và văn phong trang trọng phù hợp hoàn hảo với ngữ cảnh công sở.'
      });
      addXP(40);
    }, 700);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 pb-20">
      <Container size="lg" className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone="purple">Phòng Luyện Viết & Biến Đổi Câu</Badge>
            <Badge tone="orange">AI Phân Tích Văn Phong</Badge>
          </div>
        </div>

        {/* Title & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Phòng Luyện Viết (Writing & Paraphrasing Lab)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Rèn kỹ năng biến đổi câu (Sentence Transformation) và thực hành viết email, đoạn văn với AI chấm điểm theo chuẩn CEFR.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rewrite')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rewrite'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              1. Biến Đổi Câu (Paraphrasing)
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'studio'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              2. Viết Đoạn Văn & Email
            </button>
          </div>
        </div>

        {/* Tab 1: Sentence Transformation Drill */}
        {activeTab === 'rewrite' && (
          <div className="space-y-6">
            <Card tone="white" className="p-6 sm:p-8 border-slate-200 shadow-subtle space-y-6">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  Bài Tập Viết Lại Câu Không Đổi Nghĩa
                </h3>
                <p className="text-xs text-slate-500">
                  Sử dụng từ khóa gợi ý in hoa để điền vào phần chỗ trống sao cho câu mới giữ nguyên vẹn ý nghĩa ban đầu.
                </p>
              </div>

              <div className="space-y-6">
                {REWRITE_QUESTIONS.map((q, idx) => {
                  const userVal = rewriteInputs[q.id] || '';
                  const isCorrect = q.acceptableAnswers.some(
                    (ans) => userVal.trim().toLowerCase() === ans.toLowerCase()
                  );

                  return (
                    <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase">
                          Câu {idx + 1}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-pink-100 text-pink-700 font-mono text-xs font-bold">
                          Từ khóa: {q.keyword}
                        </span>
                      </div>

                      <div className="text-sm font-semibold text-slate-700">
                        {q.original}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-900 pt-1">
                        <span>→ Điền từ:</span>
                        <input
                          type="text"
                          value={userVal}
                          onChange={(e) =>
                            setRewriteInputs((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                          placeholder="Gõ từ khóa biến đổi..."
                          disabled={rewriteChecked}
                          className={`px-3 py-1.5 rounded-xl border text-sm font-bold min-w-[200px] transition-all ${
                            rewriteChecked
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                : 'bg-red-50 border-red-500 text-red-900'
                              : 'bg-white border-slate-300 focus:border-pink-600 focus:ring-1 focus:ring-pink-600'
                          }`}
                        />
                      </div>

                      {rewriteChecked && (
                        <div className="pt-2 text-xs space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng hoàn toàn! (+15 Xu)
                              </span>
                            ) : (
                              <span className="text-red-700 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Đáp án gợi ý: <strong>{q.acceptableAnswers[0]}</strong>
                              </span>
                            )}
                          </p>
                          <p className="text-slate-600 italic">💡 Giải thích: {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {!rewriteChecked ? (
                  <Button
                    onClick={handleCheckRewrites}
                    tone="orange"
                    size="md"
                    className="font-bold shadow-md shadow-orange-500/20"
                  >
                    Kiểm Tra Câu Đã Điền
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setRewriteChecked(false);
                      setRewriteInputs({});
                    }}
                    variant="outline"
                    size="sm"
                    className="font-bold"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Làm lại bài này</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Essay & Email Studio */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Writing Editor */}
            <div className="lg:col-span-7 space-y-4">
              <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-4">
                <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200/80 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="purple">Đề bài thực hành</Badge>
                    <span className="text-xs text-slate-500">Business Communication</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    Viết một email trang trọng (khoảng 60 - 90 từ) gửi đối tác thông báo việc bàn giao dự án sẽ bị lùi lại 2 ngày do thử nghiệm máy chủ, kèm theo lời xin lỗi chân thành.
                  </p>
                </div>

                {/* Text area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Soạn thảo nội dung:</span>
                    <span className={wordCount >= 60 ? 'text-emerald-600' : 'text-amber-600'}>
                      {wordCount} từ (Yêu cầu: 60 - 90 từ)
                    </span>
                  </div>

                  <textarea
                    rows={10}
                    value={essayText}
                    onChange={(e) => setEssayText(e.target.value)}
                    placeholder="Gõ bài viết tiếng Anh của bạn tại đây..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-sm leading-relaxed text-slate-900 bg-slate-50/40 focus:bg-white focus:border-pink-600 focus:ring-1 focus:ring-pink-600 transition-all font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400">Kiểm tra tự động lỗi chính tả & ngữ pháp</span>
                  <Button
                    onClick={handleEvaluateEssay}
                    disabled={isEvaluating || wordCount < 10}
                    tone="orange"
                    size="md"
                    className="font-bold shadow-md shadow-orange-500/20"
                  >
                    {isEvaluating ? (
                      <span>Đang phân tích bài viết...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        <span>Chấm Điểm & Nhận Xét AI</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right: AI Feedback Report */}
            <div className="lg:col-span-5 space-y-4">
              {essayFeedback ? (
                <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">Kết Quả Đánh Giá AI</h4>
                      <p className="text-xs text-slate-500">Chuẩn thang điểm CEFR & IELTS Writing</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-pink-600">{essayFeedback.overallScore}</span>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Overall Band</span>
                    </div>
                  </div>

                  {/* Rubric Breakdown */}
                  <div className="space-y-3">
                    {essayFeedback.rubric.map((r: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{r.criteria}</span>
                          <span className="font-mono font-bold text-pink-600">{r.score}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>

                  {/* Advanced Vocab Highlight */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-800">Từ vựng nâng cao đã sử dụng:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {essayFeedback.advancedVocab.map((w: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-semibold">
                          ✓ {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-pink-900 leading-relaxed">
                    💡 <strong>Đánh giá tổng quan: </strong>
                    {essayFeedback.recommendation}
                  </div>
                </Card>
              ) : (
                <Card tone="white" className="p-8 border-slate-200 shadow-subtle text-center space-y-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700">Chờ Bài Viết Của Bạn</h4>
                  <p className="text-xs max-w-xs mx-auto">
                    Sau khi bạn bấm <strong>"Chấm Điểm & Nhận Xét AI"</strong>, hệ thống sẽ phân tích 4 tiêu chí: Task Response, Cohesion, Từ vựng và Ngữ pháp.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
