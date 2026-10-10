import React from 'react';

const STATS = [
  { value: '21+', label: 'Chuyên đề Ngữ pháp', detail: 'Lộ trình bài bản từ A1 đến C1' },
  { value: '1,200+', label: 'Từ vựng Cốt lõi', detail: 'Kèm Collocation & Audio IPA' },
  { value: '6', label: 'Dạng bài Luyện tập', detail: 'Trắc nghiệm, chia thì, ghép cặp' },
  { value: '100%', label: 'Tự động Gom Lỗi Sai', detail: 'Lặp ngắt quãng Spaced Repetition' },
];

export const StatsSection: React.FC = () => {
  return (
    <div className="relative -mt-6 sm:-mt-10 mb-16 z-20 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="bg-[#FFF4EC] rounded-3xl border border-[#FEE3CD] shadow-lg shadow-orange-950/5 p-6 sm:p-8 text-center">
        {/* Top small tracked caption */}
        <p className="text-[11px] font-black uppercase tracking-widest text-orange-600/90 mb-6">
          Quy mô dữ liệu & Nền tảng học tập hiện có
        </p>

        {/* 4 Stats with divider borders */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-orange-200/80">
          {STATS.map((stat, i) => (
            <div key={i} className="px-4 flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
