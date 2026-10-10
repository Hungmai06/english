'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Upload,
  Play,
  Volume2,
  Trash2,
  Bookmark,
  Search,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  List,
  CheckSquare,
  LayoutGrid,
  Type,
  Headphones,
  FolderPlus,
  Folder,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { VocabularyWord } from '@/types';
import {
  WordSRSData,
  CustomDeck,
  DEFAULT_STARTER_CUSTOM_DECKS,
  DEFAULT_STARTER_CUSTOM_WORDS,
  addCustomVocabWords,
  saveCustomDecks,
} from '@/lib/storage';
import { speakText } from '@/lib/tts';
import { GameMode } from './LearningHubView';

interface MyDeckViewProps {
  customDecks: CustomDeck[];
  customWords: VocabularyWord[];
  srsMap: Record<string, WordSRSData>;
  bookmarkedIds: string[];
  onToggleBookmark: (wordId: string) => void;
  onDeleteWord: (wordId: string) => void;
  onDeleteDeck: (deckId: string) => void;
  onOpenAddWordModal: (deckId?: string) => void;
  onOpenImportModal: (deckId?: string) => void;
  onOpenCreateDeckModal: () => void;
  onStartStudyAll: (deckId?: string) => void;
  onStartSpecificMode: (mode: GameMode, deckId?: string) => void;
  onRefreshData: () => void;
}

export const MyDeckView: React.FC<MyDeckViewProps> = ({
  customDecks,
  customWords,
  srsMap,
  bookmarkedIds,
  onToggleBookmark,
  onDeleteWord,
  onDeleteDeck,
  onOpenAddWordModal,
  onOpenImportModal,
  onOpenCreateDeckModal,
  onStartStudyAll,
  onStartSpecificMode,
  onRefreshData,
}) => {
  // If a deck is selected, we view its words drill-down; if null, we view the decks grid
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlearned' | 'learning' | 'mastered' | 'starred'>('all');
  const [viewTab, setViewTab] = useState<'decks' | 'all-words'>('decks');

  // Currently opened deck
  const currentDeck = useMemo(() => {
    if (!selectedDeckId) return null;
    return customDecks.find((d) => d.id === selectedDeckId) || null;
  }, [customDecks, selectedDeckId]);

  // Words inside the currently selected deck
  const currentDeckWords = useMemo(() => {
    if (!selectedDeckId) return [];
    return customWords.filter((w) => w.collectionId === selectedDeckId);
  }, [customWords, selectedDeckId]);

  // Words for the active view (either deck words or all custom words)
  const activeWordPool = useMemo(() => {
    if (selectedDeckId) {
      return currentDeckWords;
    }
    return customWords;
  }, [selectedDeckId, currentDeckWords, customWords]);

  // Filtered words based on search & status filter
  const filteredWords = useMemo(() => {
    return activeWordPool.filter((w) => {
      const matchSearch =
        w.lemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.senses.some(
          (s) =>
            s.viDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.definition?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (!matchSearch) return false;

      const srs = srsMap[w.id];
      const lvl = srs ? srs.level : 1;

      if (statusFilter === 'unlearned') return !srs || lvl <= 2;
      if (statusFilter === 'learning') return srs && (lvl === 3 || lvl === 4);
      if (statusFilter === 'mastered') return srs && lvl === 5;
      if (statusFilter === 'starred') return bookmarkedIds.includes(w.id);

      return true;
    });
  }, [activeWordPool, searchQuery, statusFilter, srsMap, bookmarkedIds]);

  // Overall Stats
  const totalMastered = customWords.filter((w) => srsMap[w.id]?.level === 5).length;
  const overallMasteryPercent =
    customWords.length > 0 ? Math.min(100, Math.round((totalMastered / customWords.length) * 100)) : 0;

  // Restore Starter Decks & Words
  const handleRestoreStarter = () => {
    saveCustomDecks(DEFAULT_STARTER_CUSTOM_DECKS);
    addCustomVocabWords(DEFAULT_STARTER_CUSTOM_WORDS);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ========================================================
          1. HEADER BANNER
         ======================================================== */}
      <div className="bg-gradient-to-br from-white via-orange-50/40 to-amber-50/20 p-6 sm:p-7 rounded-3xl border-2 border-orange-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-10 h-10 rounded-2xl bg-[#FF5C28] text-white flex items-center justify-center font-black shadow-md shadow-[#FF5C28]/25 text-lg">
              ⭐
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Bộ Từ Vựng Của Tôi
            </h1>
            <span className="px-3 py-1 rounded-full bg-white text-[#FF5C28] text-xs font-black border border-orange-200 shadow-2xs">
              {customDecks.length} bộ từ · {customWords.length} từ vựng
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Tự do tạo nhiều bộ từ vựng theo từng chủ đề riêng biệt (IELTS, IT, Du lịch, v.v.). Thêm từ mới, nạp từ file Excel/CSV, luyện tập trực tiếp 6 dạng bài và lưu tiến trình SRS cá nhân.
          </p>

          <div className="pt-1 flex items-center gap-4 text-xs font-bold text-slate-600 flex-wrap">
            <span className="text-emerald-700">✓ Đã thuộc Cấp 5: {totalMastered} từ</span>
            <span className="text-[#FF5C28] font-black">({overallMasteryPercent}% thành thạo toàn bộ)</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenCreateDeckModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#FF5C28]/25 transition-all transform hover:scale-[1.02]"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Tạo bộ từ mới</span>
          </button>

          <button
            onClick={() => onOpenAddWordModal(selectedDeckId || undefined)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-[#FF5C28]" />
            <span>Thêm từ</span>
          </button>

          <button
            onClick={() => onOpenImportModal(selectedDeckId || undefined)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Nạp Excel/CSV</span>
          </button>

          <button
            onClick={() => onStartStudyAll(selectedDeckId || undefined)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Play className="w-4 h-4 fill-current text-[#FF5C28]" />
            <span>{selectedDeckId ? 'Luyện bộ này' : 'Học tất cả'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. VIEW SWITCHER (Decks Grid vs All Words Drill-down)
         ======================================================== */}
      {!selectedDeckId ? (
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab('decks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewTab === 'decks'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Danh sách bộ từ ({customDecks.length})</span>
            </button>

            <button
              onClick={() => setViewTab('all-words')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                viewTab === 'all-words'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tất cả từ vựng ({customWords.length})</span>
            </button>
          </div>

          {customDecks.length === 0 && (
            <button
              onClick={handleRestoreStarter}
              className="text-xs text-[#FF5C28] font-bold hover:underline"
            >
              ✨ Nạp 3 bộ từ mẫu
            </button>
          )}
        </div>
      ) : (
        /* Breadcrumb when drilled into a specific deck */
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedDeckId(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tất cả bộ từ</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-2">
              <span
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-sm font-bold"
                style={{ backgroundColor: currentDeck?.color || '#FF5C28' }}
              >
                {currentDeck?.icon || '📁'}
              </span>
              <span className="text-sm font-black text-slate-900">{currentDeck?.title}</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5C28] text-[10px] font-black border border-orange-200">
                {currentDeckWords.length} từ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAddWordModal(currentDeck?.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF5C28] text-white hover:bg-[#ea501e] text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm từ vào bộ này</span>
            </button>
            <button
              onClick={() => onOpenImportModal(currentDeck?.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Nạp file</span>
            </button>
            <button
              onClick={() => {
                if (currentDeck && window.confirm(`Bạn có chắc muốn xóa bộ từ "${currentDeck.title}" cùng toàn bộ từ vựng bên trong?`)) {
                  onDeleteDeck(currentDeck.id);
                  setSelectedDeckId(null);
                }
              }}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-red-200 transition-colors"
              title="Xóa bộ từ này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          3. DECKS GRID (When viewing 'decks' and no deck selected)
         ======================================================== */}
      {!selectedDeckId && viewTab === 'decks' && (
        <div className="space-y-4">
          {customDecks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#FF5C28] flex items-center justify-center mx-auto text-2xl font-bold">
                📁
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Bạn chưa tạo bộ từ vựng nào</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Hãy tạo bộ từ đầu tiên (ví dụ: "Từ vựng IELTS", "Giao tiếp hàng ngày", "Thuật ngữ IT") để phân loại và học hiệu quả hơn.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onOpenCreateDeckModal}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold shadow-md shadow-[#FF5C28]/25"
                >
                  + Tạo bộ từ mới
                </button>
                <button
                  onClick={handleRestoreStarter}
                  className="px-5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C28] text-xs font-bold border border-orange-200"
                >
                  ✨ Nạp 3 bộ mẫu đề xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customDecks.map((deck) => {
                const words = customWords.filter((w) => w.collectionId === deck.id);
                const mastered = words.filter((w) => srsMap[w.id]?.level === 5).length;
                const percent = words.length > 0 ? Math.round((mastered / words.length) * 100) : 0;

                return (
                  <div
                    key={deck.id}
                    className="bg-white rounded-3xl p-5 border-2 border-slate-200/80 hover:border-orange-300 transition-all hover:shadow-md flex flex-col justify-between group space-y-4 relative"
                  >
                    {/* Top deck info */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center text-xl font-bold shadow-xs group-hover:scale-105 transition-transform"
                            style={{ backgroundColor: deck.color || '#FF5C28' }}
                          >
                            {deck.icon || '📁'}
                          </span>
                          <div>
                            <h3 className="text-base font-black text-slate-900 group-hover:text-[#FF5C28] transition-colors line-clamp-1">
                              {deck.title}
                            </h3>
                            <span className="text-[11px] font-bold text-slate-500">
                              {words.length} từ vựng
                            </span>
                          </div>
                        </div>

                        {/* Delete Deck button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Bạn có chắc muốn xóa bộ từ "${deck.title}" cùng ${words.length} từ bên trong?`)) {
                              onDeleteDeck(deck.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa bộ từ này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 font-medium">
                        {deck.description || 'Bộ từ vựng cá nhân tự tạo.'}
                      </p>

                      {/* Mastery progress */}
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Đã vững Cấp 5: {mastered}/{words.length}</span>
                          <span className="text-[#FF5C28]">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: deck.color || '#FF5C28',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bottom action buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedDeckId(deck.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors text-center"
                      >
                        Xem từ vựng ({words.length})
                      </button>

                      <button
                        onClick={() => onStartStudyAll(deck.id)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Vào học</span>
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Deck Card */}
              <button
                onClick={onOpenCreateDeckModal}
                className="rounded-3xl border-2 border-dashed border-orange-300 hover:border-[#FF5C28] bg-orange-50/20 hover:bg-orange-50/60 p-6 flex flex-col items-center justify-center text-center gap-3 transition-all group min-h-[200px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF5C28] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-[#FF5C28] transition-colors">
                    + Tạo thêm bộ từ mới
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Thêm một chủ đề riêng biệt với biểu tượng và màu sắc tùy chỉnh.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          4. PRACTICE MODES SHORTCUTS (When a deck is opened or 'all-words' active)
         ======================================================== */}
      {(selectedDeckId || viewTab === 'all-words') && activeWordPool.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider px-1">
            {selectedDeckId
              ? `Luyện tập bộ "${currentDeck?.title}" qua 5 dạng bài:`
              : 'Luyện tập tất cả từ cá nhân qua 5 dạng bài:'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => onStartSpecificMode('flashcard', selectedDeckId || undefined)}
              className="p-3.5 rounded-2xl bg-white hover:bg-purple-50 border border-purple-200 hover:border-purple-400 text-slate-800 flex items-center gap-3 transition-all group shadow-2xs text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                <List className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">Flashcard</span>
                <span className="text-[11px] text-purple-600 font-semibold block">Lật thẻ học từ</span>
              </div>
            </button>

            <button
              onClick={() => onStartSpecificMode('quiz', selectedDeckId || undefined)}
              className="p-3.5 rounded-2xl bg-white hover:bg-orange-50 border border-orange-200 hover:border-orange-400 text-slate-800 flex items-center gap-3 transition-all group shadow-2xs text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5C28] flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">Trắc nghiệm</span>
                <span className="text-[11px] text-[#FF5C28] font-semibold block">Chọn đáp án</span>
              </div>
            </button>

            <button
              onClick={() => onStartSpecificMode('matching', selectedDeckId || undefined)}
              className="p-3.5 rounded-2xl bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-slate-800 flex items-center gap-3 transition-all group shadow-2xs text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">Nối từ</span>
                <span className="text-[11px] text-indigo-600 font-semibold block">Ghép từ và nghĩa</span>
              </div>
            </button>

            <button
              onClick={() => onStartSpecificMode('dictation', selectedDeckId || undefined)}
              className="p-3.5 rounded-2xl bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 text-slate-800 flex items-center gap-3 transition-all group shadow-2xs text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                <Type className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">Gõ từ</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">Gõ từ chính xác</span>
              </div>
            </button>

            <button
              onClick={() => onStartSpecificMode('listening_write', selectedDeckId || undefined)}
              className="p-3.5 rounded-2xl bg-white hover:bg-cyan-50 border border-cyan-200 hover:border-cyan-400 text-slate-800 flex items-center gap-3 transition-all group shadow-2xs text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">Nghe viết</span>
                <span className="text-[11px] text-cyan-600 font-semibold block">Luyện phản xạ tai</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          5. WORDS LIST (When a deck is opened or 'all-words' active)
         ======================================================== */}
      {(selectedDeckId || viewTab === 'all-words') && (
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tất cả ({activeWordPool.length})
              </button>
              <button
                onClick={() => setStatusFilter('unlearned')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === 'unlearned'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Chưa thuộc ({activeWordPool.filter((w) => !srsMap[w.id] || srsMap[w.id].level <= 2).length})
              </button>
              <button
                onClick={() => setStatusFilter('learning')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === 'learning'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đang học ({activeWordPool.filter((w) => srsMap[w.id] && (srsMap[w.id].level === 3 || srsMap[w.id].level === 4)).length})
              </button>
              <button
                onClick={() => setStatusFilter('mastered')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === 'mastered'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đã vững ({activeWordPool.filter((w) => srsMap[w.id]?.level === 5).length})
              </button>
              <button
                onClick={() => setStatusFilter('starred')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  statusFilter === 'starred'
                    ? 'bg-[#FF5C28] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Đã lưu ⭐ ({activeWordPool.filter((w) => bookmarkedIds.includes(w.id)).length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm từ hoặc nghĩa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 w-full sm:w-64 shadow-xs"
              />
            </div>
          </div>

          {/* Words Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            {activeWordPool.length === 0 ? (
              <div className="py-14 text-center space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#FF5C28] flex items-center justify-center mx-auto shadow-inner text-2xl font-bold">
                  {currentDeck?.icon || '📁'}
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {selectedDeckId ? `Bộ "${currentDeck?.title}" chưa có từ nào` : 'Bạn chưa có từ vựng nào'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Hãy thêm từ mới hoặc nạp từ file Excel/CSV để bắt đầu luyện tập với bộ từ này.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => onOpenAddWordModal(selectedDeckId || undefined)}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold shadow-md shadow-[#FF5C28]/25"
                  >
                    + Thêm từ vào bộ này
                  </button>
                  <button
                    onClick={() => onOpenImportModal(selectedDeckId || undefined)}
                    className="px-5 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C28] text-xs font-bold border border-orange-200"
                  >
                    Nạp file Excel/CSV
                  </button>
                </div>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">Không tìm thấy từ vựng phù hợp</h4>
                <p className="text-xs text-slate-400">Hãy thử thay đổi từ khóa hoặc bộ lọc tìm kiếm.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredWords.map((word) => {
                  const isBookmarked = bookmarkedIds.includes(word.id);
                  const srs = srsMap[word.id];
                  const level = srs ? srs.level : 1;
                  const sense = word.senses[0];
                  const deckOfWord = customDecks.find((d) => d.id === word.collectionId);

                  return (
                    <div
                      key={word.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-orange-50/20 p-2.5 rounded-2xl transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            {word.lemma}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            {word.ipa}
                          </span>
                          <button
                            onClick={() => speakText(word.lemma)}
                            className="p-1 rounded-lg text-slate-400 hover:text-[#FF5C28] hover:bg-[#FFF0E7] transition-colors"
                            title="Phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="px-2 py-0.5 rounded-md bg-[#FFF0E7] text-[#FF5C28] text-[10px] font-black uppercase">
                            {word.level} · {sense?.partOfSpeech || 'noun'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Cấp SRS: {level}/5
                          </span>
                          {/* Deck badge if viewing all words */}
                          {!selectedDeckId && deckOfWord && (
                            <span
                              className="px-2 py-0.5 rounded-md text-white text-[10px] font-bold flex items-center gap-1"
                              style={{ backgroundColor: deckOfWord.color || '#FF5C28' }}
                            >
                              <span>{deckOfWord.icon}</span>
                              <span>{deckOfWord.title}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-[#FF5C28]">
                          {sense?.viDefinition}
                        </p>

                        {sense?.definition && sense.definition !== sense.viDefinition && (
                          <p className="text-xs text-slate-600 font-medium">
                            {sense.definition}
                          </p>
                        )}

                        {sense?.examples?.[0] && (
                          <p className="text-xs text-slate-500 italic">
                            "{sense.examples[0].en}"
                            {sense.examples[0].vi && (
                              <span className="text-slate-400 not-italic block text-[11px] mt-0.5">
                                → {sense.examples[0].vi}
                              </span>
                            )}
                          </p>
                        )}

                        {word.collocations && word.collocations.length > 0 && (
                          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                            <span className="text-[10px] font-bold text-slate-400">Cụm từ:</span>
                            {word.collocations.map((c, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] border border-slate-200"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => onToggleBookmark(word.id)}
                          className={`p-2.5 rounded-xl border transition-colors ${
                            isBookmarked
                              ? 'bg-amber-50 border-amber-300 text-amber-500'
                              : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                          }`}
                          title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ'}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa từ "${word.lemma}" khỏi bộ từ này?`)) {
                              onDeleteWord(word.id);
                            }
                          }}
                          className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          title="Xóa từ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
