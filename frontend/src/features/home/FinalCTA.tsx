'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-14 md:py-20 border-t border-[#E7DED2]/80">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="rounded-3xl border border-[#E7DED2] overflow-hidden relative min-h-[300px] sm:min-h-[340px] flex items-center bg-[#FAF8F5]">
          
          {/* Background Landscape Image matching Mockup */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src="/images/homepage/final-cta.png"
              alt="Hành trình chinh phục tiếng Anh"
              fill
              unoptimized
              quality={100}
              className="object-cover object-right"
              sizes="(max-width: 1240px) 100vw, 1240px"
              priority
            />
            {/* Smooth gradient on left for text readability, keeping pagoda vivid on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/85 via-50% to-transparent" />
          </div>

          <div className="p-8 sm:p-14 max-w-xl space-y-5 relative z-10">
            <p className="text-xs font-semibold tracking-wider text-[#FF5C28] uppercase">
              SẴN SÀNG BẮT ĐẦU?
            </p>

            <h2 className="font-sans text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#102A43] tracking-[-0.015em] leading-[1.22] max-w-lg">
              Hành trình chinh phục <br className="hidden sm:inline" />
              tiếng Anh của bạn bắt đầu từ đây.
            </h2>

            <div className="pt-2">
              <Link
                href="/learn/grammar"
                className="inline-flex items-center gap-1.5 px-7 py-3.5 rounded-full bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#FF5C28]/25"
              >
                <span>Học ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Handwritten Note matching Image 2 floating above landscape */}
          <div className="hidden lg:block absolute right-44 top-1/2 -translate-y-1/2 z-10 text-center -rotate-6 pointer-events-none">
            <span className="font-handwriting text-2xl lg:text-3xl text-[#102A43] font-bold block leading-snug drop-shadow-sm">
              Học hôm nay, <br />
              tự tin ngày mai!
            </span>
            <svg className="w-24 h-4 mx-auto mt-1 text-[#FF5C28]" viewBox="0 0 100 20" fill="none">
              <path d="M5 14 Q 50 4 95 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
};



