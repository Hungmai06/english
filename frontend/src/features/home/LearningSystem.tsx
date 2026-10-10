'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Volume2, CheckCircle2 } from 'lucide-react';

export const LearningSystem: React.FC = () => {
  return (
    <section id="learning-system" className="py-12 md:py-18">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12">
        
        {/* 01: Dominant Module — NGỮ PHÁP CỐT LÕI */}
        <div className="rounded-3xl bg-[#FFF9F3] border border-[#F2EAE0] p-8 sm:p-12 mb-8 relative overflow-hidden">
          {/* Subtle Botanical Leaf Accent at Bottom */}
          <div className="absolute -bottom-2 left-1/3 w-32 h-16 pointer-events-none opacity-40 z-0 hidden sm:block">
            <svg viewBox="0 0 120 60" fill="none" className="w-full h-full text-[#A3B18A]">
              <path d="M10 60 C 25 35, 45 20, 70 10 C 60 25, 45 45, 10 60 Z" fill="currentColor" opacity="0.6" />
              <path d="M40 45 C 55 25, 80 15, 110 5 C 95 20, 80 40, 40 45 Z" fill="currentColor" opacity="0.5" />
              <path d="M10 60 Q 60 25 110 5" stroke="#7A8B63" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-4">
              <span className="font-sans text-5xl sm:text-6xl font-bold text-[#FFB070] block leading-none">
                01
              </span>
              <h3 className="font-sans text-3xl sm:text-4xl font-bold text-[#102A43] tracking-[-0.015em]">
                Ngữ pháp Cốt lõi
              </h3>
              <p className="text-sm sm:text-base text-[#486581] leading-relaxed font-normal">
                Học cấu trúc bằng sơ đồ trực quan, dễ hiểu và dễ nhớ.
              </p>
              <div className="pt-2">
                <Link
                  href="/learn/grammar"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#102A43] hover:text-[#FF5C28] transition-colors underline underline-offset-4 decoration-[#102A43]/40"
                >
                  <span>Khám phá ngữ pháp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Clean Grammar Tree Visual with Handwriting Arrow */}
            <div className="lg:col-span-7 relative">
              
              {/* Handwritten Note pointing to tree matching mockup - placed cleanly outside white card */}
              <div className="hidden sm:block absolute -top-9 right-4 lg:right-6 text-right z-20 pointer-events-none">
                <span className="font-handwriting text-xl text-[#102A43] font-bold block rotate-2 leading-none">
                  Sơ đồ cây trực quan
                </span>
                <svg className="w-10 h-7 ml-auto text-[#102A43]/70 -rotate-12 mt-0.5" viewBox="0 0 40 35" fill="none">
                  <path d="M32 4 C 28 14, 18 24, 8 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M14 24 L 7 28 L 10 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* White Diagram Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E7DED2]/80 shadow-md shadow-[#102A43]/4">
                {/* Root Node */}
                <div className="flex justify-center">
                  <div className="px-5 py-2 rounded-xl bg-[#E8F1FE] text-[#1E75D8] font-bold text-xs sm:text-sm shadow-xs">
                    Câu điều kiện
                  </div>
                </div>

                {/* Connecting branch lines (SVG for crisp, exact alignment!) */}
                <div className="w-full max-w-[440px] mx-auto h-7 my-1">
                  <svg className="w-full h-full text-[#C8DCF0]" viewBox="0 0 300 28" fill="none" preserveAspectRatio="none">
                    <line x1="150" y1="0" x2="150" y2="14" stroke="currentColor" strokeWidth="2" />
                    <line x1="50" y1="14" x2="250" y2="14" stroke="currentColor" strokeWidth="2" />
                    <line x1="50" y1="14" x2="50" y2="28" stroke="currentColor" strokeWidth="2" />
                    <line x1="150" y1="14" x2="150" y2="28" stroke="currentColor" strokeWidth="2" />
                    <line x1="250" y1="14" x2="250" y2="28" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>

                {/* 3 Children Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  {/* Type 1 */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E7DED2]/70 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#E6F4EA] text-[#137333] font-bold text-[11px]">
                      Loại 1
                    </span>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      If + hiện tại, <br />
                      <strong className="text-[#102A43]">will + V</strong>
                    </p>
                  </div>

                  {/* Type 2 */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E7DED2]/70 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#E8F1FE] text-[#1A73E8] font-bold text-[11px]">
                      Loại 2
                    </span>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      If + quá khứ đơn, <br />
                      <strong className="text-[#102A43]">would + V</strong>
                    </p>
                  </div>

                  {/* Type 3 */}
                  <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#E7DED2]/70 space-y-2">
                    <span className="inline-block px-3 py-1 rounded-lg bg-[#F3E8FD] text-[#8430CE] font-bold text-[11px]">
                      Loại 3
                    </span>
                    <p className="text-[11px] text-[#718096] leading-relaxed">
                      If + quá khứ HT, <br />
                      <strong className="text-[#102A43]">would have + V</strong>
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Secondary Modules: 02 and 03 Grid matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 02: TỪ VỰNG THEO NGỮ CẢNH */}
          <div className="rounded-3xl bg-[#F0F6FA] border border-[#E0ECF3] p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              <div className="sm:col-span-7 space-y-3">
                <span className="font-sans text-3xl font-bold text-[#86B4D6] block">
                  02
                </span>
                <h4 className="font-sans text-2xl font-bold text-[#102A43] tracking-[-0.015em]">
                  Từ vựng theo ngữ cảnh
                </h4>
                <p className="text-xs sm:text-sm text-[#486581] leading-relaxed">
                  Học từ trong câu, tình huống thực tế và phát âm chuẩn.
                </p>
                <div className="pt-2">
                  <Link
                    href="/learn/vocabulary"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102A43] hover:text-[#FF5C28] transition-colors underline underline-offset-4 decoration-[#102A43]/40"
                  >
                    <span>Khám phá từ vựng</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual: Tactile Flashcard with Polaroid matching Mockup */}
              <div className="sm:col-span-5 relative flex justify-center items-center min-h-[190px]">
                {/* Polaroid Photo Layer behind - tilted right */}
                <div className="absolute right-0 sm:right-1 top-2 w-32 sm:w-36 aspect-square rounded-xl overflow-hidden border-4 border-white shadow-lg rotate-8 z-0">
                  <Image
                    src="/images/homepage/culture-polaroid.png"
                    alt="Văn hóa và ngữ cảnh"
                    fill
                    unoptimized
                    quality={100}
                    className="object-cover"
                    sizes="160px"
                  />
                </div>

                {/* White Flashcard in front - tilted left */}
                <div className="relative bg-white rounded-2xl p-4 sm:p-5 border border-[#E7DED2]/80 shadow-xl shadow-[#102A43]/8 -rotate-3 z-10 w-38 sm:w-44 space-y-2">
                  <p className="font-bold text-base sm:text-lg text-[#102A43] tracking-tight">culture</p>
                  <div className="flex items-center justify-between pt-0.5">
                    <p className="text-xs sm:text-sm text-[#718096] font-mono">/ˈkʌltʃər/</p>
                    <div className="w-7 h-7 rounded-full bg-[#FFF0E7] flex items-center justify-center text-[#FF5C28] shadow-xs">
                      <Volume2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 03: LUYỆN TẬP & SỔ TAY ĐIỂM LẠI */}
          <div className="rounded-3xl bg-[#EFF8F6] border border-[#DCEFEA] p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              <div className="sm:col-span-7 space-y-3">
                <span className="font-sans text-3xl font-bold text-[#7DC2B2] block">
                  03
                </span>
                <h4 className="font-sans text-2xl font-bold text-[#102A43] tracking-[-0.015em]">
                  Luyện tập & Sổ tay Điểm lại
                </h4>
                <p className="text-xs sm:text-sm text-[#486581] leading-relaxed">
                  6 dạng bài tập + Spaced Repetition để ghi nhớ lâu dài.
                </p>
                <div className="pt-2">
                  <Link
                    href="/learn/grammar"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#102A43] hover:text-[#FF5C28] transition-colors underline underline-offset-4 decoration-[#102A43]/40"
                  >
                    <span>Bắt đầu luyện tập</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual: Quiz Checklist Card mockup */}
              <div className="sm:col-span-5 relative flex justify-center">
                <div className="bg-white rounded-2xl p-5 border border-[#E7DED2]/80 shadow-lg shadow-[#102A43]/5 -rotate-2 max-w-[200px] w-full space-y-3 text-xs">
                  <div className="flex items-center justify-between text-[#137333] font-semibold pb-0.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 fill-[#E6F4EA]" />
                      <span className="text-xs font-bold">Trắc nghiệm</span>
                    </div>
                    <span className="text-[#718096] text-xs">⋮</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#718096]">
                    <div className="w-4 h-4 rounded-full border border-[#CBD5E1]" />
                    <span className="text-xs font-medium">Điền từ</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#718096]">
                    <div className="w-4 h-4 rounded-full border border-[#CBD5E1]" />
                    <span className="text-xs font-medium">Viết câu</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[#718096]">
                    <div className="w-4 h-4 rounded-full border border-[#CBD5E1]" />
                    <span className="text-xs font-medium">Nói</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};



