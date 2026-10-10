'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

export const LearningPhilosophy: React.FC = () => {
  return (
    <section className="py-16 md:py-20 border-t border-[#E7DED2]/80 bg-[#FAF8F5]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12 text-center">
        
        {/* Eyebrow & Headline */}
        <div className="max-w-xl mx-auto mb-8 sm:mb-10 space-y-3">
          <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#FF5C28] uppercase">
            MỘT HỆ THỐNG.
          </p>
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#102A43] tracking-[-0.015em]">
            Ba lớp ghi nhớ.
          </h2>
        </div>

        {/* Centered Progression matching Image 1: Hiểu ──→ Dùng ──→ Nhớ */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 text-base sm:text-lg font-bold text-[#102A43]">
          <span className="hover:text-[#FF5C28] transition-colors">Hiểu</span>
          
          <div className="flex items-center gap-1 text-[#FF5C28]">
            <div className="w-8 sm:w-14 h-[1.5px] bg-[#FF5C28]" />
            <ArrowRight className="w-3.5 h-3.5 -ml-1 text-[#FF5C28]" />
          </div>

          <span className="hover:text-[#FF5C28] transition-colors">Dùng</span>

          <div className="flex items-center gap-1 text-[#FF5C28]">
            <div className="w-8 sm:w-14 h-[1.5px] bg-[#FF5C28]" />
            <ArrowRight className="w-3.5 h-3.5 -ml-1 text-[#FF5C28]" />
          </div>

          <span className="hover:text-[#FF5C28] transition-colors">Nhớ</span>
        </div>

      </div>
    </section>
  );
};



