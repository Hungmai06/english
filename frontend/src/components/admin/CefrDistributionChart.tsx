'use client';

import React from 'react';
import { BarChart3, Layers } from 'lucide-react';
import { VocabularyWord, Question } from '@/types';

interface CefrDistributionChartProps {
  vocabList: VocabularyWord[];
  questionsList: Question[];
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export function CefrDistributionChart({ vocabList, questionsList }: CefrDistributionChartProps) {
  // Aggregate stats per level
  const stats = CEFR_LEVELS.map((level) => {
    const vocabCount = vocabList.filter((w) => w.level === level).length;
    // Map question difficulty (easy -> A1/A2, medium -> B1/B2, hard -> C1/C2)
    const questionCount = questionsList.filter((q) => {
      if (level === 'A1' || level === 'A2') return q.difficulty === 'easy';
      if (level === 'B1' || level === 'B2') return q.difficulty === 'medium';
      if (level === 'C1' || level === 'C2') return q.difficulty === 'hard';
      return false;
    }).length;

    return {
      level,
      vocabCount,
      questionCount,
      total: vocabCount + questionCount,
    };
  });

  const maxTotal = Math.max(...stats.map((s) => s.total), 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-[#FF5C28]" />
          <span>Biểu Đồ Phân Bố Theo Khung CEFR</span>
        </h4>
        <span className="text-[11px] font-bold text-slate-400">Từ vựng & Câu hỏi</span>
      </div>

      {/* Visual Level Columns */}
      <div className="grid grid-cols-6 gap-2 pt-2">
        {stats.map((item) => {
          const heightPercent = Math.max(Math.round((item.total / maxTotal) * 100), 12);
          const isHighest = item.total === maxTotal && maxTotal > 0;

          return (
            <div key={item.level} className="flex flex-col items-center gap-2 group">
              {/* Bar Container */}
              <div className="w-full h-28 bg-slate-50 rounded-xl p-1.5 flex flex-col justify-end items-center relative border border-slate-100 group-hover:border-orange-300 transition-colors">
                {/* Floating Count Tooltip */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 font-bold shadow-md">
                  {item.vocabCount} từ • {item.questionCount} câu
                </div>

                {/* Animated Bar Column */}
                <div
                  className={`w-full rounded-lg transition-all duration-500 relative flex flex-col justify-end p-1 overflow-hidden ${
                    isHighest
                      ? 'bg-gradient-to-t from-[#FF5C28] to-orange-400 shadow-xs'
                      : 'bg-gradient-to-t from-slate-200 to-slate-300 group-hover:from-orange-200 group-hover:to-orange-300'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span
                    className={`text-[10px] font-black text-center block ${
                      isHighest ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    {item.total}
                  </span>
                </div>
              </div>

              {/* CEFR Badge Label */}
              <div className="text-center">
                <span
                  className={`text-xs font-black block ${
                    isHighest ? 'text-[#FF5C28]' : 'text-slate-700'
                  }`}
                >
                  {item.level}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {item.vocabCount} từ
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend footnote */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#FF5C28]" />
          <span>Cấp độ tập trung nhiều nhất: <b>B2 & C1</b></span>
        </span>
        <span>Tổng: {vocabList.length} từ</span>
      </div>
    </div>
  );
}
