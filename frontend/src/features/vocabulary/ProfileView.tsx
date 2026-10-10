'use client';

import React from 'react';
import {
  Flame,
  Award,
  BookOpen,
  Trophy,
  Calendar,
  Target,
  ArrowRight,
  Plus,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import { VocabHistoryItem, WordSRSData } from '@/lib/storage';
import { CoinIcon, RewardCoinBadge } from '@/components/CoinIcon';

interface ProfileViewProps {
  allWords: VocabularyWord[];
  srsMap: Record<string, WordSRSData>;
  wordsByLevel: Record<number, VocabularyWord[]>;
  masteredWordsCount: number;
  historyList: VocabHistoryItem[];
  dailyGoal: number;
  onSelectGoal: (goal: number) => void;
  onOpenImportModal: () => void;
  onStartLearning: () => void;
  onOpenAddWordModal?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  allWords,
  srsMap,
  wordsByLevel,
  masteredWordsCount,
  historyList,
  dailyGoal,
  onSelectGoal,
  onOpenImportModal,
  onStartLearning,
  onOpenAddWordModal,
}) => {
  // Calculate total learned words
  const learnedCount = Object.values(srsMap).filter((s) => s.reviewCount > 0).length;
  // Calculate average accuracy from history
  const totalQuestions = historyList.reduce((acc, item) => acc + item.totalWords, 0);
  const totalCorrect = historyList.reduce((acc, item) => acc + item.correctCount, 0);
  const accuracyPercent = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 85;

  const ACHIEVEMENTS = [
    {
      id: 'streak',
      title: 'Bậc Thầy Kiên Trì',
      desc: 'Chuỗi học 5 ngày liên tục',
      icon: Flame,
      color: 'from-orange-500 to-amber-500',
      unlocked: true,
    },
    {
      id: 'vocab',
      title: 'Thợ Săn Từ Vựng',
      desc: 'Tích lũy vốn từ cốt lõi',
      icon: BookOpen,
      color: 'from-purple-500 to-indigo-500',
      unlocked: true,
    },
    {
      id: 'speed',
      title: 'Phản Xạ Thần Tốc',
      desc: 'Đạt độ chính xác trên 80%',
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
      unlocked: true,
    },
    {
      id: 'srs',
      title: 'Chiến Binh SRS',
      desc: 'Chinh phục từ vựng Cấp 5',
      icon: Trophy,
      color: 'from-blue-500 to-cyan-500',
      unlocked: masteredWordsCount > 0,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Profile Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5C28] to-[#FF8C66] text-white flex items-center justify-center font-black text-2xl shadow-md shadow-[#FF5C28]/25 flex-shrink-0">
            LC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Hồ Sơ Học Tập
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E7] text-[#FF5C28] text-xs font-black">
                Cấp 4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Học viên LinguaCore · Tham gia từ tháng 09/2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddWordModal || onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm từ mới</span>
          </button>
          <button
            onClick={onStartLearning}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF5C28]/25 transition-all transform hover:scale-[1.02]"
          >
            <span>Vào học ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top 4 Stat Boxes (Consistent 4-column structure) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Chuỗi học */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 select-none">
            <span>Chuỗi liên tục</span>
            <Flame className="w-4 h-4 text-[#FF5C28]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            5 <span className="text-sm font-bold text-slate-500">ngày 🔥</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Kỷ lục tốt nhất
          </span>
        </div>

        {/* Box 2: Số dư Xu / Coin */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 select-none">
            <span>Số dư Xu tích lũy</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>450</span>
            <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
              <span>Xu</span>
              <CoinIcon className="w-3.5 h-3.5" />
            </span>
          </div>
          <span className="text-[11px] text-amber-600 font-semibold block mt-1">
            Đổi thưởng & vật phẩm
          </span>
        </div>

        {/* Box 3: Vốn từ */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 select-none">
            <span>Vốn từ tích lũy</span>
            <BookOpen className="w-4 h-4 text-[#FF5C28]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {allWords.length} <span className="text-sm font-bold text-slate-500">từ</span>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold block mt-1">
            {learnedCount} từ đang luyện tập
          </span>
        </div>

        {/* Box 4: Thành thạo Cấp 5 */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 select-none">
            <span>Thành thạo Cấp 5</span>
            <Trophy className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {masteredWordsCount} <span className="text-sm font-bold text-slate-500">từ</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Độ chính xác: {accuracyPercent}%
          </span>
        </div>
      </div>

      {/* 3. Daily Goal Setting & SRS Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Daily Goal Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Mục Tiêu Mỗi Ngày
              </h3>
            </div>
            <span className="text-xs font-bold text-[#FF5C28] px-2.5 py-1 rounded-full bg-[#FFF0E7]">
              {dailyGoal} từ / ngày
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Chọn số lượng từ bạn muốn học hoặc ôn tập mỗi ngày để duy trì thói quen:
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[5, 10, 15, 20].map((goal) => (
              <button
                key={goal}
                onClick={() => onSelectGoal(goal)}
                className={`py-2.5 rounded-2xl text-xs font-black transition-all ${
                  dailyGoal === goal
                    ? 'bg-[#FF5C28] text-white shadow-md shadow-[#FF5C28]/25 scale-[1.03]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {goal} từ
              </button>
            ))}
          </div>
        </div>

        {/* SRS 5-Level Progress Bars */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#9333EA] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Phân Bố Trí Nhớ (SRS)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">
              5 cấp độ ghi nhớ
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { lvl: 1, label: 'Cấp 1 - Làm quen', color: 'bg-rose-500' },
              { lvl: 2, label: 'Cấp 2 - Nhận biết', color: 'bg-amber-500' },
              { lvl: 3, label: 'Cấp 3 - Ghi nhớ', color: 'bg-blue-500' },
              { lvl: 4, label: 'Cấp 4 - Vững vàng', color: 'bg-indigo-500' },
              { lvl: 5, label: 'Cấp 5 - Thành thạo', color: 'bg-emerald-500' },
            ].map(({ lvl, label, color }) => {
              const count = wordsByLevel[lvl]?.length || 0;
              const percent = allWords.length > 0 ? Math.round((count / allWords.length) * 100) : 0;
              return (
                <div key={lvl} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{label}</span>
                    <span className="font-bold text-slate-900">{count} từ ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Achievements / Badges Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Huy Hiệu & Thành Tích
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {ACHIEVEMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-between space-y-2 transition-all ${
                  item.unlocked
                    ? 'bg-gradient-to-b from-white to-slate-50 border-slate-200 shadow-xs'
                    : 'bg-slate-50/60 border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-tr ${item.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.unlocked
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {item.unlocked ? '✓ Đã đạt' : 'Chưa mở'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Match & Practice History (Consistent with Hub layout) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#9333EA] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Lịch sử đấu & Luyện tập gần đây
          </h3>
        </div>

        {historyList.length === 0 ? (
          <div className="border-2 border-dashed border-slate-300 rounded-3xl py-10 px-4 text-center">
            <p className="text-xs sm:text-sm text-slate-400 font-semibold">
              Chưa có lịch sử đấu. Hãy thử một bài luyện nhé!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {historyList.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-4 text-xs font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.modeName}</h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} · {new Date(item.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-slate-600">
                    Đúng: <strong className="text-emerald-600">{item.correctCount}/{item.totalWords}</strong>
                  </span>
                  <RewardCoinBadge amount={item.xpEarned} variant="light" size="sm" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
