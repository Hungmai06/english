'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const ContinueLearning: React.FC = () => {
  const [progressPercent] = useState<number>(75);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="rounded-3xl bg-[#FFF9F3] border border-[#F2EAE0] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left Content */}
            <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
              <p className="text-xs font-bold tracking-wider text-[#FF5C28] uppercase">
                TIẾP TỤC BÀI HỌC.
              </p>

              <div>
                <h3 className="font-sans text-3xl sm:text-4xl font-bold text-[#102A43] tracking-[-0.015em]">
                  Thì hiện tại đơn
                </h3>
                <p className="text-xs sm:text-sm text-[#486581] mt-1 font-medium">
                  Công thức · Thói quen · Sự thật hiển nhiên
                </p>
              </div>

              {/* Progress & Action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1 max-w-xs space-y-1.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#E7DED2] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FF5C28] rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#102A43]">{progressPercent}%</span>
                  </div>
                </div>

                <Link
                  href="/learn/grammar/present-simple/present-simple-1"
                  className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs sm:text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#FF5C28]/25 whitespace-nowrap self-start sm:self-auto"
                >
                  <span>Tiếp tục học</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Visual: continue-learning.png stretched to full height of card */}
            <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[260px] lg:min-h-full">
              <Image
                src="/images/homepage/continue-learning.png"
                alt="Tiếp tục bài học dở dang - Practice makes progress"
                fill
                unoptimized
                quality={100}
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 550px"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};



