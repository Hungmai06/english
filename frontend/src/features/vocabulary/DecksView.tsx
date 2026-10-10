'use client';

import React from 'react';
import {
  Plus,
  ArrowRight,
  Sparkles,
  Upload,
  BookMarked,
} from 'lucide-react';
import { VOCABULARY_COLLECTIONS } from '@/lib/data/mockData';
import { VocabularyWord } from '@/types';
import { WordSRSData } from '@/lib/storage';

interface DecksViewProps {
  allWords: VocabularyWord[];
  customWords: VocabularyWord[];
  srsMap: Record<string, WordSRSData>;
  onSelectDeck: (collectionId: string) => void;
  onOpenImportModal: () => void;
  onOpenAddWordModal?: () => void;
}

export const DecksView: React.FC<DecksViewProps> = ({
  allWords,
  customWords,
  srsMap,
  onSelectDeck,
  onOpenImportModal,
  onOpenAddWordModal,
}) => {
  // Stats for "Bộ từ của tôi"
  const customMasteredCount = customWords.filter((w) => {
    const srs = srsMap[w.id];
    return srs && srs.level === 5;
  }).length;

  const customLearnedCount = customWords.filter((w) => {
    const srs = srsMap[w.id];
    return srs && srs.reviewCount > 0;
  }).length;

  const customProgressPercent =
    customWords.length > 0
      ? Math.min(100, Math.round((customLearnedCount / customWords.length) * 100))
      : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bộ Từ Vựng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Chọn bộ từ vựng mục tiêu hoặc học bộ từ cá nhân của bạn với đầy đủ 6 dạng bài luyện tập.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenAddWordModal && (
            <button
              onClick={onOpenAddWordModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4 text-[#FF5C28]" />
              <span>Thêm từ mới</span>
            </button>
          )}
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF5C28]/25 transition-all transform hover:scale-[1.02] flex-shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Nạp từ file / Excel</span>
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* ========================================================
            FEATURED CARD 0: BỘ TỪ CỦA TÔI (Personal Custom Set)
           ======================================================== */}
        <div
          onClick={() => onSelectDeck('custom')}
          className="bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 rounded-3xl border-2 border-[#FF5C28]/50 p-6 flex flex-col justify-between hover:shadow-xl hover:border-[#FF5C28] transition-all duration-200 group cursor-pointer relative overflow-hidden"
        >
          {/* Top highlight ribbon */}
          <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FF5C28] to-[#FF8C66] text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-2xl shadow-xs">
            ⭐ Bộ từ cá nhân
          </div>

          <div className="space-y-4">
            {/* Title & Badge */}
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-sm shadow-2xs">
                  ⭐
                </span>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-[#FF5C28] transition-colors tracking-tight">
                  Bộ Từ Của Tôi
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2 line-clamp-2">
                Kho từ vựng do bạn tự thêm, lưu lại từ bài đọc hoặc nạp từ file Excel / CSV cá nhân.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Độ thành thạo</span>
                <span className="font-bold text-[#FF5C28]">{customProgressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5C28] to-[#FF8C66] rounded-full transition-all duration-500"
                  style={{ width: `${customProgressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span className="font-bold text-slate-700">{customWords.length} từ vựng</span>
                <span>{customMasteredCount} từ đã vững</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-5 border-t border-orange-100/80 mt-5 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectDeck('custom');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all transform hover:scale-[1.01]"
            >
              <span>Vào học (6 dạng bài)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 pt-0.5">
              {onOpenAddWordModal && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddWordModal();
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-orange-200 hover:bg-orange-50 text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#FF5C28]" />
                  <span>+ Thêm từ</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImportModal();
                }}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-600 transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Nạp file</span>
              </button>
            </div>
          </div>
        </div>
        {VOCABULARY_COLLECTIONS.map((col) => {
          const colWords = allWords.filter((w) => w.collectionId === col.id);
          const totalWordsCount = colWords.length || col.wordsCount;

          // Calculate mastered count (SRS level 5)
          const masteredCount = colWords.filter((w) => {
            const srs = srsMap[w.id];
            return srs && srs.level === 5;
          }).length;

          // Calculate active learned count
          const learnedCount = colWords.filter((w) => {
            const srs = srsMap[w.id];
            return srs && srs.reviewCount > 0;
          }).length;

          const progressPercent = totalWordsCount > 0 ? Math.min(100, Math.round((learnedCount / Math.max(colWords.length, 1)) * 100)) : 0;

          return (
            <div
              key={col.id}
              onClick={() => onSelectDeck(col.id)}
              className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#FF5C28]/60 transition-all duration-200 group cursor-pointer"
            >
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <h3 className="text-xl font-black text-slate-900 group-hover:text-[#FF5C28] transition-colors tracking-tight">
                    {col.title}
                  </h3>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Độ thành thạo</span>
                    <span className="font-bold text-[#FF5C28]">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF5C28] to-[#FF8C66] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>{totalWordsCount} từ vựng</span>
                    <span>{masteredCount} từ đã vững</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 border-t border-slate-100 mt-5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDeck(col.id);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all transform hover:scale-[1.01]"
                >
                  <span>Vào học (6 dạng bài)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

