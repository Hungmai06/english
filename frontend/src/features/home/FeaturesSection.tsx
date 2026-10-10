import React from 'react';
import { Layers, Sparkles, RotateCcw, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const THREE_VALUES = [
  {
    icon: Layers,
    badge: 'Lộ trình bài bản',
    title: 'Ngữ pháp Cốt lõi & Sơ đồ Cây Tư Duy',
    description:
      '21 chuyên đề từ A1 đến C1. Phân cấp rõ ràng: các thì, câu điều kiện, mệnh đề quan hệ, bị động. Học bản chất kèm ví dụ so sánh trực quan.',
    bg: 'bg-[#F0F3FE]',
    border: 'border-[#E0E6FD]',
    iconBg: 'bg-[#5046E5] text-white',
    link: '/learn/grammar',
    linkText: 'Khám phá bài học Ngữ pháp',
  },
  {
    icon: Sparkles,
    badge: 'Học từ tự nhiên',
    title: 'Từ vựng Ngữ cảnh & Phát âm Bản xứ',
    description:
      'Học từ theo cụm Collocations và tình huống thực tế. Tích hợp phiên âm IPA chuẩn xác và công cụ nghe phát âm giọng đọc bản xứ US/UK.',
    bg: 'bg-[#FFF8EC]',
    border: 'border-[#FEE8C8]',
    iconBg: 'bg-[#EA580C] text-white',
    link: '/learn/vocabulary',
    linkText: 'Luyện Flashcard Từ vựng',
  },
  {
    icon: RotateCcw,
    badge: 'Khoa học nhận thức',
    title: 'Động cơ Luyện tập & Sổ tay Diệt Lỗi Sai',
    description:
      '6 dạng bài tương tác (trắc nghiệm, chia thì, ghép cặp). Tự động gom lỗi sai vào Sổ tay riêng và áp dụng Spaced Repetition đến khi làm đúng.',
    bg: 'bg-[#ECFBFB]',
    border: 'border-[#CCF4F5]',
    iconBg: 'bg-[#0D9488] text-white',
    link: '/review/mistakes',
    linkText: 'Mở Sổ tay Lỗi sai',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          3 giá trị bạn nhận được ngay hôm nay
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          Hoàn toàn miễn phí, không cần cài đặt — học ngay trên trình duyệt của bạn.
        </p>
      </div>

      {/* 3 Pastel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {THREE_VALUES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`${item.bg} ${item.border} border rounded-[28px] p-7 sm:p-8 flex flex-col justify-between hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="space-y-5">
                {/* Round Circular Icon */}
                <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-900/5">
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-600 transition-colors group"
                >
                  <span>{item.linkText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
