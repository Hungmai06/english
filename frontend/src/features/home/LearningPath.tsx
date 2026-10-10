'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const LearningPath: React.FC = () => {
  const steps = [
    { num: '01', title: 'Ngữ pháp Cơ bản', sub: '21 chuyên đề' },
    { num: '02', title: 'Từ vựng & Ngữ cảnh', sub: '30 bài học' },
    { num: '03', title: 'Luyện tập', sub: '6 dạng bài' },
    { num: '04', title: 'Giao tiếp thực tế', sub: 'Tình huống & hội thoại' },
    { num: '05', title: 'Ôn tập & Thi thử', sub: 'Đánh giá năng lực' },
  ];

  return (
    <section className="py-14 md:py-20 border-t border-[#E7DED2]/80">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* Header with Title & "Xem toàn bộ lộ trình" link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#FF5C28] uppercase mb-1.5">
              LỘ TRÌNH HỌC
            </p>
            <h2 className="font-sans text-3xl sm:text-4xl font-bold text-[#102A43] tracking-[-0.015em]">
              Từ cơ bản đến nâng cao
            </h2>
          </div>

          <Link
            href="/learn/grammar"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#102A43] hover:text-[#FF5C28] transition-colors self-start sm:self-auto"
          >
            <span>Xem toàn bộ lộ trình</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs sm:text-sm text-[#718096] mb-12 font-normal">
          Lộ trình được thiết kế khoa học, phù hợp với mọi trình độ.
        </p>

        {/* 5 Steps with Orange Arrows matching Image 2 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-3">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="space-y-2 flex-1">
                <div className="w-9 h-9 rounded-full bg-white border border-[#E7DED2] flex items-center justify-center text-xs font-extrabold text-[#102A43] shadow-sm">
                  {step.num}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#102A43] leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-[#718096] mt-0.5">
                    {step.sub}
                  </p>
                </div>
              </div>

              {/* Connecting orange arrow (desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-1 text-[#FF5C28]">
                  <div className="w-6 lg:w-10 h-[1.5px] bg-[#FF5C28]" />
                  <ArrowRight className="w-3 h-3 -ml-1 text-[#FF5C28]" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

      </div>
    </section>
  );
};


