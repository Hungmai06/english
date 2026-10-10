'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden bg-gradient-to-b from-white to-[#FAF8F5]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Headlines & Actions */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7">
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#FFF0E7] border border-[#FFD9C6]">
              <span className="text-xs font-semibold tracking-wider text-[#FF5C28] uppercase">
                NỀN TẢNG HỌC TIẾNG ANH HIỆN ĐẠI
              </span>
            </div>

            {/* Main Headline (Balanced font-bold with elegant stroke modulation) */}
            <h1 className="font-sans text-4xl sm:text-5xl lg:text-[58px] font-bold text-[#102A43] tracking-[-0.015em] leading-[1.16]">
              Học tiếng Anh <br />
              theo <span className="text-[#FF5C28]">một hệ thống.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#486581] leading-relaxed max-w-lg font-normal">
              Ngữ pháp rõ ràng. Từ vựng có ngữ cảnh. <br />
              Luyện tập để kiến thức ở lại lâu hơn.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <Link
                href="/learn/grammar"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm sm:text-base transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FF5C28]/25"
              >
                <span>Bắt đầu học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#learning-system"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#E7DED2] hover:border-[#102A43] bg-white text-[#102A43] font-bold text-sm transition-colors shadow-sm"
              >
                <span>Tìm hiểu thêm</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Metadata Line */}
            <div className="pt-1">
              <p className="text-xs sm:text-sm text-[#718096] font-medium tracking-wide">
                21+ chuyên đề <span className="mx-2 text-[#E7DED2]">·</span> 1.200+ từ vựng <span className="mx-2 text-[#E7DED2]">·</span> 6 dạng luyện tập
              </p>
            </div>

            {/* MỘT HỆ THỐNG — Ba lớp ghi nhớ: Hiểu ──→ Dùng ──→ Nhớ */}
            <div className="pt-4 border-t border-[#E7DED2]/80 space-y-2.5">
              <div className="space-y-0.5">
                <p className="text-[11px] font-semibold tracking-wider text-[#FF5C28] uppercase">
                  MỘT HỆ THỐNG.
                </p>
                <h3 className="text-base sm:text-lg font-bold text-[#102A43]">
                  Ba lớp ghi nhớ
                </h3>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-[#102A43]">
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E7DED2] shadow-xs hover:border-[#FF5C28] transition-colors">
                  Hiểu
                </span>
                <div className="flex items-center text-[#FF5C28]">
                  <div className="w-6 sm:w-8 h-[1.5px] bg-[#FF5C28]" />
                  <ArrowRight className="w-3.5 h-3.5 -ml-1 text-[#FF5C28]" />
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E7DED2] shadow-xs hover:border-[#FF5C28] transition-colors">
                  Dùng
                </span>
                <div className="flex items-center text-[#FF5C28]">
                  <div className="w-6 sm:w-8 h-[1.5px] bg-[#FF5C28]" />
                  <ArrowRight className="w-3.5 h-3.5 -ml-1 text-[#FF5C28]" />
                </div>
                <span className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E7DED2] shadow-xs hover:border-[#FF5C28] transition-colors">
                  Nhớ
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual with Oval Backdrop & Handwriting Note */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px] lg:max-w-[540px]">
              
              {/* Warm Oval Shape in Background */}
              <div className="absolute inset-0 bg-[#F4EFE6] rounded-full scale-95 blur-2xl opacity-60 -z-10" />

              {/* Arched Photo Container matching mockup exactly - 3:4 portrait ratio for crystal clarity */}
              <div className="relative aspect-[3/4] w-full max-w-[440px] mx-auto rounded-t-full rounded-b-3xl overflow-hidden bg-[#F3EEE6] border border-[#E7DED2]/70 shadow-2xl shadow-[#102A43]/8">
                <Image
                  src="/images/homepage/hero-student-hd.jpg"
                  alt="Sinh viên học tập tiếng Anh theo hệ thống"
                  fill
                  priority
                  unoptimized
                  quality={100}
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 540px"
                />
              </div>

              {/* Floating Widget: Bài học hôm nay (Top Right) */}
              <div className="absolute top-5 right-2 sm:top-8 sm:right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-[#E7DED2] shadow-lg shadow-[#102A43]/8 w-44 sm:w-48 z-10">
                <div className="flex items-center justify-between text-[11px] text-[#718096] font-medium mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#FFF0E7] flex items-center justify-center text-[#FF5C28]">
                      <BookOpen className="w-2.5 h-2.5" />
                    </div>
                    <span>Bài học hôm nay</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#718096]" />
                </div>
                <div className="font-extrabold text-[#102A43] text-lg sm:text-xl leading-tight">
                  07 <span className="text-xs font-normal text-[#718096]">/ 21</span>
                </div>
                <p className="text-[10px] text-[#718096] mt-0.5 font-medium">
                  Câu điều kiện
                </p>
              </div>

              {/* Handwritten Note floating directly on background matching mockup */}
              <div className="hidden sm:block absolute top-[48%] -right-4 lg:-right-8 z-10 max-w-[160px] text-center -rotate-6 pointer-events-none">
                <p className="font-handwriting text-xl lg:text-2xl text-[#102A43] font-bold leading-snug">
                  Tiếng Anh không khó, chỉ cần đúng phương pháp!
                </p>
                <svg className="w-28 h-4 mx-auto mt-1 text-[#FF5C28]" viewBox="0 0 100 20" fill="none">
                  <path d="M5 14 Q 50 4 95 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};




