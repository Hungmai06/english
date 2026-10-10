import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#E7DED2]/80 bg-white py-8 text-xs text-[#718096]">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand Logo */}
        <Link href="/" className="font-extrabold tracking-tight text-[#102A43] text-sm hover:text-[#FF5C28] transition-colors">
          LinguaCore<span className="text-[#FF5C28]">.</span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 font-medium">
          <Link href="/learn/grammar" className="hover:text-[#102A43] transition-colors">
            Ngữ pháp
          </Link>
          <Link href="/learn/vocabulary" className="hover:text-[#102A43] transition-colors">
            Từ vựng
          </Link>
          <Link href="/leaderboard" className="hover:text-[#102A43] transition-colors">
            Bảng xếp hạng
          </Link>
          <Link href="/review/mistakes" className="hover:text-[#102A43] transition-colors">
            Sổ tay
          </Link>
        </div>

        {/* Right: Copyright */}
        <p className="text-center sm:text-right font-normal">
          © 2026 LinguaCore. All rights reserved.
        </p>

      </div>
    </footer>
  );
};



