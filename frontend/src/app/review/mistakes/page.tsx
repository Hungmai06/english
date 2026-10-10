'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { getMistakes, markMistakeCorrected } from '@/lib/storage';
import { MistakeRecord } from '@/types';

export default function MistakesNotebookPage() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'mastered'>('needs_review');
  const [activeRetestId, setActiveRetestId] = useState<string | null>(null);
  const [retestChoice, setRetestChoice] = useState<string | null>(null);
  const [retestResult, setRetestResult] = useState<'correct' | 'wrong' | null>(null);

  const loadMistakes = () => {
    setMistakes(getMistakes());
  };

  useEffect(() => {
    loadMistakes();
  }, []);

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === 'needs_review') return m.status === 'needs_review';
    if (filter === 'mastered') return m.status === 'mastered';
    return true;
  });

  const handleRetestAnswer = (mistake: MistakeRecord, optionId: string) => {
    setRetestChoice(optionId);
    const isCorrect = optionId.toLowerCase() === (mistake.question.correctAnswer as string).toLowerCase();

    if (isCorrect) {
      setRetestResult('correct');
      markMistakeCorrected(mistake.id);
      setTimeout(() => {
        loadMistakes();
        setActiveRetestId(null);
        setRetestChoice(null);
        setRetestResult(null);
      }, 1200);
    } else {
      setRetestResult('wrong');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone="orange">Phương Pháp Triệt Tiêu Điểm Yếu</Badge>
              <span className="text-xs text-slate-500 font-medium">Lặp lại ngắt quãng thông minh</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Sổ Tay Lỗi Sai
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Mỗi câu bạn làm sai trong bài luyện tập hoặc bài thi đều được tự động gom về đây.
              Luyện lại trực tiếp cho đến khi làm đúng 2 lần liên tiếp để biến bẫy ngữ pháp thành phản xạ tự nhiên.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/practice">
              <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Luyện tập thêm</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setFilter('needs_review')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'needs_review'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cần ôn lại ({mistakes.filter((m) => m.status === 'needs_review').length})
          </button>
          <button
            onClick={() => setFilter('mastered')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'mastered'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Đã thành thạo ({mistakes.filter((m) => m.status === 'mastered').length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Toàn bộ lịch sử ({mistakes.length})
          </button>
        </div>

        {/* Mistakes List */}
        <div className="space-y-4">
          {filteredMistakes.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3 shadow-subtle">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sổ Tay Của Bạn Đang Trống Lỗi Sai!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Không có câu hỏi nào cần ôn lại trong mục này. Hãy tiếp tục làm các bài tập mới để thử thách bản thân.
              </p>
            </div>
          ) : (
            filteredMistakes.map((record) => {
              const isRetesting = activeRetestId === record.id;
              const q = record.question;

              return (
                <Card
                  key={record.id}
                  tone="white"
                  className="p-6 border-slate-200/90 shadow-subtle space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge tone={record.status === 'mastered' ? 'green' : 'orange'}>
                          {record.status === 'mastered' ? 'Đã thành thạo' : 'Cần ôn lại'}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          Đã làm sai {record.failedCount} lần · Đã sửa đúng {record.correctedCount}/2 lần
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 pt-1">
                        {q.prompt}
                      </h3>
                    </div>

                    {!isRetesting && (
                      <Button
                        onClick={() => {
                          setActiveRetestId(record.id);
                          setRetestChoice(null);
                          setRetestResult(null);
                        }}
                        variant="secondary"
                        tone="orange"
                        size="sm"
                        className="font-bold flex-shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Làm lại câu này</span>
                      </Button>
                    )}
                  </div>

                  {/* Active Re-test Mode */}
                  {isRetesting ? (
                    <div className="p-5 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between text-xs font-bold text-orange-800">
                        <span>Chế độ làm lại: Chọn đáp án bạn nghĩ là đúng nhất</span>
                        <button
                          onClick={() => setActiveRetestId(null)}
                          className="text-slate-500 hover:text-slate-800"
                        >
                          Hủy bỏ
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {(q.options || [
                          { id: 'a', text: 'Option A' },
                          { id: 'b', text: 'Option B' },
                          { id: 'c', text: 'Option C' },
                          { id: 'd', text: 'Option D' },
                        ]).map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => handleRetestAnswer(record, opt.id)}
                            className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold text-left hover:border-orange-400 hover:bg-orange-50/50 transition-all flex items-center justify-between"
                          >
                            <span>{opt.text}</span>
                            <span className="w-5 h-5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center uppercase">
                              {opt.id}
                            </span>
                          </button>
                        ))}
                      </div>

                      {retestResult === 'correct' && (
                        <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Chính xác! Đã cập nhật tiến độ (+1 điểm thành thạo).</span>
                        </div>
                      )}

                      {retestResult === 'wrong' && (
                        <div className="p-3 bg-red-100 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Vẫn chưa đúng. Hãy đọc kỹ phần giải thích ngữ pháp bên dưới.</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Normal View: Previous wrong answer vs correct answer */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-red-50/70 border border-red-200/80 text-xs">
                        <span className="text-[10px] font-bold uppercase text-red-600 block">
                          Câu bạn từng chọn SAI:
                        </span>
                        <span className="font-semibold text-slate-800">{String(record.givenAnswer)}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                        <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                          Đáp án ĐÚNG chuẩn bản xứ:
                        </span>
                        <span className="font-bold text-slate-900">{record.correctAnswerText}</span>
                      </div>
                    </div>
                  )}

                  {/* Grammar Logic Explanation */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFE7DC] text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-[#FF5C28]">Giải thích bản chất: </span>
                    <span>{q.explanation}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </div>
  );
}
