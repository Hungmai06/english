'use client';

import React, { useState } from 'react';
import {
  List,
  CheckSquare,
  LayoutGrid,
  Type,
  Headphones,
  Shuffle,
  RotateCw,
  Play,
  Settings,
  Volume2,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { VOCABULARY_COLLECTIONS } from '@/lib/data/mockData';
import { VocabularyWord } from '@/types';
import { VocabHistoryItem, WordSRSData, CustomDeck } from '@/lib/storage';
import { RewardCoinBadge, CoinIcon } from '@/components/CoinIcon';

export type GameMode =
  | 'flashcard'
  | 'quiz'
  | 'matching'
  | 'dictation'
  | 'listening_write';

interface LearningHubViewProps {
  allWords: VocabularyWord[];
  customWords: VocabularyWord[];
  customDecks?: CustomDeck[];
  srsMap: Record<string, WordSRSData>;
  historyList: VocabHistoryItem[];
  selectedCollection: string;
  onSelectCollection: (colId: string) => void;
  filterStatus: 'all' | 'unlearned' | 'learning' | 'mastered' | 'starred';
  onSelectFilterStatus: (status: 'all' | 'unlearned' | 'learning' | 'mastered' | 'starred') => void;
  sortOrder: 'random' | 'az' | 'difficulty' | 'newest';
  onSelectSortOrder: (order: 'random' | 'az' | 'difficulty' | 'newest') => void;
  wordCountLimit: number;
  onSelectWordCountLimit: (limit: number) => void;
  availableWordsCount: number;
  onStartMode: (mode: GameMode) => void;
  onStartSRS: () => void;
  onOpenAddWordModal?: () => void;
  onOpenImportModal?: () => void;
}

export const LearningHubView: React.FC<LearningHubViewProps> = ({
  allWords,
  customWords,
  customDecks = [],
  srsMap,
  historyList,
  selectedCollection,
  onSelectCollection,
  filterStatus,
  onSelectFilterStatus,
  sortOrder,
  onSelectSortOrder,
  wordCountLimit,
  onSelectWordCountLimit,
  availableWordsCount,
  onStartMode,
  onStartSRS,
  onOpenAddWordModal,
  onOpenImportModal,
}) => {
  const [volume, setVolume] = useState(70);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. TOP 4 CONTROL BOXES (Matching user screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Box 1: Bộ từ vựng */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-center text-xs font-bold text-slate-500 select-none">
              Bộ từ vựng
            </label>
            {onOpenAddWordModal && (
              <button
                type="button"
                onClick={onOpenAddWordModal}
                className="text-[11px] font-bold text-[#FF5C28] hover:text-[#ea501e] flex items-center gap-0.5"
                title="Thêm từ mới vào Bộ từ của tôi"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm từ</span>
              </button>
            )}
          </div>
          <div className="relative">
            <select
              value={selectedCollection}
              onChange={(e) => onSelectCollection(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer pr-8 truncate"
            >
              <option value="all">Tất cả bộ từ ({allWords.length} từ)</option>
              
              {/* Nhóm Bộ từ của tôi */}
              <optgroup label="⭐ Bộ từ của tôi (tự tạo)">
                <option value="custom">
                  ⭐ Tất cả từ của tôi ({customWords.length} từ)
                </option>
                {customDecks.map((deck) => {
                  const dWords = customWords.filter((w) => w.collectionId === deck.id);
                  return (
                    <option key={deck.id} value={deck.id}>
                      {deck.icon} {deck.title} ({dWords.length} từ)
                    </option>
                  );
                })}
              </optgroup>

              {/* Nhóm Bộ từ chuẩn */}
              <optgroup label="── Bộ từ chuẩn hệ thống ──">
                {VOCABULARY_COLLECTIONS.map((c) => {
                  const count = allWords.filter((w) => w.collectionId === c.id).length || c.wordsCount;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.title} ({count} từ)
                    </option>
                  );
                })}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Box 2: Bộ lọc */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <label className="block text-center text-xs font-bold text-slate-500 mb-1.5 select-none">
            Bộ lọc
          </label>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => onSelectFilterStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer pr-8"
            >
              <option value="all">Tất cả từ</option>
              <option value="unlearned">Chưa thuộc (Cấp 1 - 2)</option>
              <option value="learning">Đang học (Cấp 3 - 4)</option>
              <option value="mastered">Đã thuộc (Cấp 5)</option>
              <option value="starred">Đã đánh dấu ⭐</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Box 3: Thứ tự */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <label className="block text-center text-xs font-bold text-slate-500 mb-1.5 select-none">
            Thứ tự
          </label>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => onSelectSortOrder(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer pr-8"
            >
              <option value="random">Ngẫu nhiên</option>
              <option value="az">Theo thứ tự A-Z</option>
              <option value="difficulty">Độ khó tăng dần</option>
              <option value="newest">Từ mới nhất</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Box 4: Số lượng */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:border-[#FF5C28]/40 transition-colors">
          <label className="block text-center text-xs font-bold text-slate-500 mb-1.5 select-none">
            Số lượng
          </label>
          <div className="relative">
            <select
              value={wordCountLimit}
              onChange={(e) => onSelectWordCountLimit(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 cursor-pointer pr-8"
            >
              <option value={10}>10 từ</option>
              <option value={20}>20 từ</option>
              <option value={30}>30 từ</option>
              <option value={50}>50 từ</option>
              <option value={999}>Tất cả</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* 1.5. BỘ TỪ CỦA TÔI NOTIFICATION & QUICK ACTIONS BANNER */}
      {selectedCollection === 'custom' && (
        <div className="bg-gradient-to-r from-[#FFF0E7] via-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl border border-[#FF5C28]/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5C28] to-[#FF8C66] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#FF5C28]/25 flex-shrink-0">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  Bộ Từ Của Tôi (Personal Deck)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#FF5C28] text-[11px] font-black border border-orange-200 shadow-2xs">
                  {customWords.length} từ vựng
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {customWords.length === 0
                  ? 'Bộ từ của bạn đang trống. Hãy thêm từ vựng mới hoặc nạp từ file Excel/CSV để bắt đầu luyện tập!'
                  : 'Đang áp dụng danh sách từ cá nhân cho tất cả các dạng bài luyện tập và ôn tập ngắt quãng (SRS).'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            {onOpenAddWordModal && (
              <button
                type="button"
                onClick={onOpenAddWordModal}
                className="px-3.5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all transform hover:scale-[1.02]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm từ mới</span>
              </button>
            )}
            {onOpenImportModal && (
              <button
                type="button"
                onClick={onOpenImportModal}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Nhập file / Excel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. SUBHEADER BAR: "Chọn dạng bài: ⚙️" + "🔊 70%" + "24 TỪ SẴN SÀNG" */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Chọn dạng bài:
          </h2>
          <button
            onClick={() => setIsVolumeOpen(!isVolumeOpen)}
            className="p-1.5 text-slate-400 hover:text-[#FF5C28] hover:bg-white rounded-xl transition-colors"
            title="Cài đặt âm lượng phát âm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Volume tag */}
          <div className="relative">
            <button
              onClick={() => setIsVolumeOpen(!isVolumeOpen)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{volume}%</span>
            </button>

            {isVolumeOpen && (
              <div className="absolute right-0 mt-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-200 z-30 w-44 space-y-2 animate-in fade-in">
                <span className="text-xs font-bold text-slate-600 block">Âm lượng TTS: {volume}%</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="w-full accent-[#FF5C28]"
                />
              </div>
            )}
          </div>

          {/* Green ready words pill badge */}
          <span className="px-3.5 py-1 rounded-full bg-[#E6F9E6] border border-emerald-300 text-emerald-800 text-xs font-black tracking-wide uppercase shadow-xs">
            {availableWordsCount} TỪ SẴN SÀNG
          </span>
        </div>
      </div>

      {/* 3. 5 BIG COLORFUL LEARNING MODE CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        {/* Card 1: Flashcard */}
        <button
          onClick={() => onStartMode('flashcard')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#7548CE] via-[#6240B9] to-[#53329D] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-purple-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
        >
          <div className="card-top-gloss" />
          <div className="card-wave-shape-1" />
          <div className="card-wave-shape-2" />

          {/* Floating Glass Icon Bubble */}
          <div className="glass-icon-bubble">
            <List className="w-6 h-6 text-white drop-shadow-xs" />
          </div>

          <div className="relative z-10 my-0.5">
            <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Flashcard
            </h3>
            <p className="text-[11.5px] font-semibold text-purple-100/90 mt-0.5 line-clamp-1">
              Lật thẻ học từ vựng
            </p>
          </div>

          {/* 3D Gold Reward Coin */}
          <RewardCoinBadge amount={6} className="mt-1" />
        </button>

        {/* Card 2: Trắc nghiệm */}
        <button
          onClick={() => onStartMode('quiz')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#FF6B3A] via-[#FA5428] to-[#EC4119] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-orange-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
        >
          <div className="card-top-gloss" />
          <div className="card-wave-shape-1" />
          <div className="card-wave-shape-2" />

          <div className="glass-icon-bubble">
            <CheckSquare className="w-6 h-6 text-white drop-shadow-xs" />
          </div>

          <div className="relative z-10 my-0.5">
            <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Trắc nghiệm
            </h3>
            <p className="text-[11.5px] font-semibold text-orange-100/90 mt-0.5 line-clamp-1">
              Chọn đáp án đúng
            </p>
          </div>

          <RewardCoinBadge amount={10} className="mt-1" />
        </button>

        {/* Card 3: Nối từ với nghĩa */}
        <button
          onClick={() => onStartMode('matching')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#6870F2] via-[#5759E9] to-[#4B42D9] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-indigo-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
        >
          <div className="card-top-gloss" />
          <div className="card-wave-shape-1" />
          <div className="card-wave-shape-2" />

          <div className="glass-icon-bubble">
            <LayoutGrid className="w-6 h-6 text-white drop-shadow-xs" />
          </div>

          <div className="relative z-10 my-0.5">
            <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Nối từ với nghĩa
            </h3>
            <p className="text-[11.5px] font-semibold text-indigo-100/90 mt-0.5 line-clamp-1">
              Ghép đôi từ vựng với ý nghĩa
            </p>
          </div>

          <RewardCoinBadge amount={10} className="mt-1" />
        </button>

        {/* Card 4: Gõ từ vựng */}
        <button
          onClick={() => onStartMode('dictation')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#19C18A] via-[#10AF7C] to-[#069865] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-emerald-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
        >
          <div className="card-top-gloss" />
          <div className="card-wave-shape-1" />
          <div className="card-wave-shape-2" />

          <div className="glass-icon-bubble">
            <Type className="w-6 h-6 text-white drop-shadow-xs" />
          </div>

          <div className="relative z-10 my-0.5">
            <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Gõ từ vựng
            </h3>
            <p className="text-[11.5px] font-semibold text-emerald-100/90 mt-0.5 line-clamp-1">
              Nhìn nghĩa và gõ từ tiếng...
            </p>
          </div>

          <RewardCoinBadge amount={10} className="mt-1" />
        </button>

        {/* Card 5: Nghe viết */}
        <button
          onClick={() => onStartMode('listening_write')}
          className="group relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#20B4E8] via-[#109FD5] to-[#078BC7] text-white p-4 sm:p-4.5 flex flex-col items-center justify-between text-center min-h-[195px] shadow-lg shadow-cyan-950/20 hover:scale-[1.015] hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-200 border border-white/30"
        >
          <div className="card-top-gloss" />
          <div className="card-wave-shape-1" />
          <div className="card-wave-shape-2" />

          <div className="glass-icon-bubble">
            <Headphones className="w-6 h-6 text-white drop-shadow-xs" />
          </div>

          <div className="relative z-10 my-0.5">
            <h3 className="text-base sm:text-[17.5px] font-black tracking-tight leading-tight text-white drop-shadow-xs">
              Nghe viết
            </h3>
            <p className="text-[11.5px] font-semibold text-cyan-100/90 mt-0.5 line-clamp-1">
              Nghe phát âm và viết từ
            </p>
          </div>

          <RewardCoinBadge amount={15} className="mt-1" />
        </button>

      </div>

      {/* 4. SRS BANNER */}
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

        <button
          onClick={onStartSRS}
          className="self-start sm:self-auto px-6 py-3 rounded-full bg-white text-[#A82EFF] hover:text-[#9319EB] hover:-translate-y-0.5 font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 flex-shrink-0 active:translate-y-0"
        >
          <span>▷ Bắt đầu ôn tập</span>
        </button>
      </div>

      {/* 5. CARD: "LỊCH SỬ ĐẤU" */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
        {/* Title Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#9333EA] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Lịch sử đấu
          </h3>
        </div>

        {/* History List or Empty Dashed State */}
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
