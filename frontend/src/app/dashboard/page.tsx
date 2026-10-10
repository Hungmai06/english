'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  BookOpen,
  Sparkles,
  ArrowRight,
  List,
  CheckSquare,
  LayoutGrid,
  Type,
  Headphones,
  RotateCw,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Progress } from '@/design-system/components/Progress';
import { Button } from '@/design-system/components/Button';
import { getUserStats, getMistakes } from '@/lib/storage';
import { UserProgressStats } from '@/types';
import { RewardCoinBadge, CoinIcon } from '@/components/CoinIcon';

export default function DashboardPage() {
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [pendingMistakesCount, setPendingMistakesCount] = useState(0);

  useEffect(() => {
    setStats(getUserStats());
    const m = getMistakes();
    setPendingMistakesCount(m.filter((item) => item.status === 'needs_review').length);
  }, []);

  const VIETNAMESE_ACHIEVEMENTS = [
    {
      id: 'streak-5',
      title: 'Bậc Thầy Kiên Trì 5 Ngày',
      desc: 'Duy trì học liên tục không bỏ ngày nào.',
      icon: Flame,
      unlocked: true,
      tone: 'orange',
    },
    {
      id: 'grammar-tenses',
      title: 'Chuyên Gia Các Thì',
      desc: 'Hoàn thành chuyên đề Hiện tại đơn & Tiếp diễn.',
      icon: BookOpen,
      unlocked: true,
      tone: 'orange',
    },
    {
      id: 'vocab-100',
      title: 'Nhà Xây Dựng Vốn Từ',
      desc: 'Đã học và ôn luyện hơn 100 từ vựng cốt lõi.',
      icon: Sparkles,
      unlocked: true,
      tone: 'purple',
    },
    {
      id: 'exam-champ',
      title: 'Chinh Phục Đề Thi Thử',
      desc: 'Đạt từ 80% điểm trở lên trong bài thi chẩn đoán.',
      icon: Award,
      unlocked: false,
      tone: 'green',
    },
  ];

  const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge tone="orange">Trung Tâm Phân Tích</Badge>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
              Bảng Tiến Độ & Năng Lực Học Tập
            </h1>
          </div>
        </div>

        {/* Top 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card tone="white" className="p-5 border-slate-200 space-y-1.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Chuỗi ngày học liên tục
              </span>
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats?.streakDays || 5} Ngày</div>
          </Card>

          <Card tone="white" className="p-5 border-slate-200 space-y-1.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Cấp độ & Số dư Xu
              </span>
              <Award className="w-5 h-5 text-[#FF5C28]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-[#FF5C28]">Cấp {stats?.level || 4}</span>
              <span className="text-xs font-black text-amber-900 bg-amber-50 border border-amber-200/90 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <CoinIcon className="w-4 h-4 flex-shrink-0" />
                <span>{stats?.xp || 1420} Xu</span>
              </span>
            </div>
          </Card>

          <Card tone="white" className="p-5 border-slate-200 space-y-1.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Bài học đã hoàn thành
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">
              {stats?.lessonsCompleted || 12} bài
            </div>
          </Card>

          <Link href="/review/mistakes" className="block">
            <Card tone="white" className="p-5 border-slate-200 hover:border-red-300 transition-colors space-y-1.5 shadow-subtle h-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Lỗi sai cần ôn lại
                </span>
                <RotateCcw className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-3xl font-black text-red-600">{pendingMistakesCount} câu</div>
            </Card>
          </Link>
        </div>

        {/* 5 COLORFUL LEARNING MODES & SRS BANNER (Matching Hub Layout) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Chọn dạng bài luyện tập
            </h2>
            <Link
              href="/learn/vocabulary"
              className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1"
            >
              <span>Vào học chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {/* Flashcard */}
            <Link
              href="/learn/vocabulary"
              className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#7548CE] via-[#6240B9] to-[#53329D] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-purple-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
            >
              <div className="card-top-gloss" />
              <div className="card-wave-shape-1" />
              <div className="card-wave-shape-2" />

              <div className="glass-icon-bubble">
                <List className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="relative z-10 my-0.5">
                <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">Flashcard</h3>
                <p className="text-[11.5px] font-semibold text-purple-100/90 mt-0.5 line-clamp-1">Lật thẻ học từ vựng</p>
              </div>
              <RewardCoinBadge amount={6} className="mt-1" />
            </Link>

            {/* Trắc nghiệm */}
            <Link
              href="/learn/vocabulary"
              className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#FF6B3A] via-[#FA5428] to-[#EC4119] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-orange-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
            >
              <div className="card-top-gloss" />
              <div className="card-wave-shape-1" />
              <div className="card-wave-shape-2" />

              <div className="glass-icon-bubble">
                <CheckSquare className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="relative z-10 my-0.5">
                <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">Trắc nghiệm</h3>
                <p className="text-[11.5px] font-semibold text-orange-100/90 mt-0.5 line-clamp-1">Chọn đáp án đúng</p>
              </div>
              <RewardCoinBadge amount={10} className="mt-1" />
            </Link>

            {/* Nối từ với nghĩa */}
            <Link
              href="/learn/vocabulary"
              className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#6870F2] via-[#5759E9] to-[#4F46E5] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-indigo-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
            >
              <div className="card-top-gloss" />
              <div className="card-wave-shape-1" />
              <div className="card-wave-shape-2" />

              <div className="glass-icon-bubble">
                <LayoutGrid className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="relative z-10 my-0.5">
                <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">Nối từ với nghĩa</h3>
                <p className="text-[11.5px] font-semibold text-indigo-100/90 mt-0.5 line-clamp-1">Ghép đôi từ vựng với ý nghĩa</p>
              </div>
              <RewardCoinBadge amount={10} className="mt-1" />
            </Link>

            {/* Gõ từ vựng */}
            <Link
              href="/learn/vocabulary"
              className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#19C18A] via-[#10AF7C] to-[#069865] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-emerald-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
            >
              <div className="card-top-gloss" />
              <div className="card-wave-shape-1" />
              <div className="card-wave-shape-2" />

              <div className="glass-icon-bubble">
                <Type className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="relative z-10 my-0.5">
                <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">Gõ từ vựng</h3>
                <p className="text-[11.5px] font-semibold text-emerald-100/90 mt-0.5 line-clamp-1">Nhìn nghĩa và gõ từ tiếng...</p>
              </div>
              <RewardCoinBadge amount={10} className="mt-1" />
            </Link>

            {/* Nghe viết */}
            <Link
              href="/learn/vocabulary"
              className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#20B4E8] via-[#109FD5] to-[#078BC7] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-cyan-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
            >
              <div className="card-top-gloss" />
              <div className="card-wave-shape-1" />
              <div className="card-wave-shape-2" />

              <div className="glass-icon-bubble">
                <Headphones className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div className="relative z-10 my-0.5">
                <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">Nghe viết</h3>
                <p className="text-[11.5px] font-semibold text-cyan-100/90 mt-0.5 line-clamp-1">Nghe phát âm và viết từ</p>
              </div>
              <RewardCoinBadge amount={15} className="mt-1" />
            </Link>
          </div>

          {/* Ôn tập ngắt quãng (SRS) */}
          <div className="rounded-[26px] bg-gradient-to-r from-[#A82EFF] via-[#C93BEA] to-[#F03C91] text-white p-5 sm:p-6 shadow-xl shadow-fuchsia-900/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/30 relative overflow-hidden">
            {/* Background Ring Accent */}
            <div className="w-60 h-60 rounded-full border-[24px] border-white/10 absolute -right-8 -top-12 pointer-events-none" />

            {/* Decorative Sparkles */}
            <svg className="w-4 h-4 text-white absolute right-72 top-4 hidden lg:block animate-sparkle-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
            </svg>
            <svg className="w-3.5 h-3.5 text-white absolute left-28 bottom-3 hidden lg:block animate-sparkle-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
            </svg>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-[52px] h-[52px] rounded-2xl bg-white/20 border border-white/35 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-md">
                <RotateCw className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
              <div>
                <h3 className="text-lg sm:text-[19px] font-black tracking-tight text-white drop-shadow-xs">
                  Ôn tập ngắt quãng (SRS)
                </h3>
                <p className="text-xs sm:text-[13px] text-purple-100/95 mt-0.5 font-medium leading-relaxed">
                  Hệ thống tự động nhắc lại các từ vựng bạn sắp quên. Học ít, nhớ lâu!
                </p>
              </div>
            </div>

            <Link
              href="/learn/vocabulary"
              className="self-start sm:self-auto px-6 py-2.5 rounded-full bg-white text-[#B026FF] hover:bg-purple-50 font-black text-xs sm:text-sm shadow-md transition-all transform hover:scale-[1.03] flex items-center gap-2 flex-shrink-0"
            >
              <span>▷ Bắt đầu ôn tập</span>
            </Link>
          </div>
        </div>

        {/* 2-Column: Mastery Breakdown & Habit Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Mastery Progress by Module */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Mức Độ Thành Thạo Từng Kỹ Năng</h3>
                <Badge tone="orange">Điểm trung bình: {stats?.masteryPercent || 62}%</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800">Ngữ pháp & Cấu trúc câu</span>
                    <span className="text-orange-600">{stats?.grammarMastery || 70}%</span>
                  </div>
                  <Progress value={stats?.grammarMastery || 70} tone="orange" size="md" />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800">Từ vựng & Cụm từ (Collocations)</span>
                    <span className="text-orange-600">{stats?.vocabularyMastery || 55}%</span>
                  </div>
                  <Progress value={stats?.vocabularyMastery || 55} tone="orange" size="md" />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800">Kỹ năng Đọc hiểu</span>
                    <span className="text-purple-600">30%</span>
                  </div>
                  <Progress value={30} tone="green" size="md" />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                    <span className="text-slate-800">Độ chính xác Đề thi TOEIC</span>
                    <span className="text-emerald-700">50%</span>
                  </div>
                  <Progress value={50} tone="green" size="md" />
                </div>
              </div>
            </div>

            {/* Weak Areas Recommendation Box */}
            <Card tone="cream" className="p-6 border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <TrendingUp className="w-4 h-4 text-amber-700" />
                  <span>Cần chú ý</span>
                </div>
                <p className="text-sm text-slate-800 font-bold">
                  Câu điều kiện hỗn hợp & Giới từ đi kèm
                </p>
              </div>
              <Link href="/learn/grammar/conditionals" className="flex-shrink-0">
                <Button tone="orange" size="sm" className="font-bold shadow-sm">
                  <span>Ôn tập ngay</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Right Column: Weekly Activity & Streak Tracker */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">Tính Kiên Trì Trong Tuần</h3>
                <span className="text-xs text-emerald-600 font-bold">5/7 Ngày đã học</span>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center pt-2">
                {DAYS.map((day, idx) => {
                  const isActive = idx < 5;
                  return (
                    <div key={day} className="space-y-1.5">
                      <div
                        className={`h-12 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isActive
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isActive ? '✓' : ''}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges & Achievements */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
              <h3 className="font-bold text-base text-slate-900">Huy Hiệu Thành Tích</h3>

              <div className="space-y-3">
                {VIETNAMESE_ACHIEVEMENTS.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div
                      key={ach.id}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                        ach.unlocked
                          ? 'bg-slate-50/70 border-slate-200'
                          : 'bg-slate-50/30 border-dashed border-slate-200 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            ach.unlocked
                              ? 'bg-[#FFF0E7] text-[#FF5C28]'
                              : 'bg-slate-200 text-slate-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900">{ach.title}</h4>
                      </div>
                      {ach.unlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
