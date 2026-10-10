'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Gamepad2,
  BookMarked,
  User,
  ShoppingBag,
  Settings,
  Heart,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Moon,
  Calendar,
  BarChart3,
  Trophy,
  CheckCircle2,
  Volume2,
  Bookmark,
  Search,
  Sparkles,
  Upload,
  RotateCw,
  Plus,
  Play,
  ArrowRight,
  X,
  Clock,
  GraduationCap,
  Sparkle,
  Puzzle,
  PenTool,
  HelpCircle,
  Filter,
  Trash2,
} from 'lucide-react';
import { VOCABULARY_WORDS, VOCABULARY_COLLECTIONS } from '@/lib/data/mockData';
import {
  getSRSMap,
  updateWordSRS,
  getDailyGoal,
  setDailyGoal as persistDailyGoal,
  getCustomVocab,
  getCustomDecks,
  deleteCustomDeck,
  CustomDeck,
  toggleBookmark,
  getBookmarks,
  WordSRSData,
  addXP,
  getVocabHistory,
  addVocabHistoryItem,
  VocabHistoryItem,
  deleteCustomWord,
} from '@/lib/storage';
import { speakText } from '@/lib/tts';
import { VocabularyWord } from '@/types';
import { VocaRobotMascot } from '@/components/VocaRobotMascot';
import { ImportVocabularyModal } from '@/components/ImportVocabularyModal';
import { AddCustomWordModal } from '@/components/AddCustomWordModal';
import { CreateCustomDeckModal } from '@/components/CreateCustomDeckModal';
import { DecksView } from '@/features/vocabulary/DecksView';
import { LearningHubView, GameMode } from '@/features/vocabulary/LearningHubView';
import { FlashcardMode } from '@/features/vocabulary/FlashcardMode';
import { QuizMode } from '@/features/vocabulary/QuizMode';
import { MatchingMode } from '@/features/vocabulary/MatchingMode';
import { DictationMode } from '@/features/vocabulary/DictationMode';
import { MyDeckView } from '@/features/vocabulary/MyDeckView';

export default function VocabularyPage() {
  // Navigation & View State: 'decks' | 'learn' | 'my-deck' | 'notebook'
  const [activeTab, setActiveTab] = useState<'decks' | 'learn' | 'my-deck' | 'notebook'>('learn');
  
  // Learning Modes inside 'learn': 'hub' (Dashboard như ảnh user) | 'srs' | 'flashcard' | 'quiz' | 'matching' | 'dictation' | 'listening_write' | 'special'
  const [learnMode, setLearnMode] = useState<'hub' | 'srs' | GameMode>('hub');
  
  // 4 Top Filter Controls from the design reference
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unlearned' | 'learning' | 'mastered' | 'starred'>('unlearned');
  const [sortOrder, setSortOrder] = useState<'random' | 'az' | 'difficulty' | 'newest'>('random');
  const [wordCountLimit, setWordCountLimit] = useState<number>(20);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [dailyGoal, setDailyGoal] = useState<number>(10);
  const [isGoalBubbleOpen, setIsGoalBubbleOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddWordModalOpen, setIsAddWordModalOpen] = useState(false);
  const [isCreateDeckModalOpen, setIsCreateDeckModalOpen] = useState(false);
  const [selectedDeckForAdd, setSelectedDeckForAdd] = useState<string | undefined>(undefined);

  // SRS Data State
  const [srsMap, setSrsMap] = useState<Record<string, WordSRSData>>({});
  const [customWords, setCustomWords] = useState<VocabularyWord[]>([]);
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notebookFilter, setNotebookFilter] = useState<'all' | 'custom' | 'bookmarked' | 'mastered' | 'weak'>('all');
  const [historyList, setHistoryList] = useState<VocabHistoryItem[]>([]);

  // Interactive Flashcard Session Modal (SRS fast session)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewWordIndex, setReviewWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quick modals for Shop / Settings / Support
  const [activeModal, setActiveModal] = useState<'shop' | 'settings' | 'support' | null>(null);

  // Load Initial Data
  const refreshData = () => {
    setSrsMap(getSRSMap());
    setCustomWords(getCustomVocab());
    setCustomDecks(getCustomDecks());
    setBookmarkedIds(getBookmarks());
    setDailyGoal(getDailyGoal());
    setHistoryList(getVocabHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const allWords = useMemo(() => {
    return [...VOCABULARY_WORDS, ...customWords];
  }, [customWords]);

  // Filter words according to the 4 Top Controls
  const filteredWords = useMemo(() => {
    let list = [...allWords];

    // 1. Filter by collection / topic
    const customIds = new Set(customWords.map((cw) => cw.id));
    if (selectedTopic === 'custom') {
      list = list.filter((w) => w.collectionId === 'custom' || w.collectionId.startsWith('cdeck-') || customIds.has(w.id));
    } else if (selectedTopic.startsWith('cdeck-')) {
      list = list.filter((w) => w.collectionId === selectedTopic);
    } else if (selectedTopic !== 'all') {
      list = list.filter((w) => w.collectionId === selectedTopic && !customIds.has(w.id));
    }

    // 2. Filter by status
    if (filterStatus === 'unlearned') {
      list = list.filter((w) => {
        const srs = srsMap[w.id];
        return !srs || srs.level <= 2;
      });
    } else if (filterStatus === 'learning') {
      list = list.filter((w) => {
        const srs = srsMap[w.id];
        return srs && (srs.level === 3 || srs.level === 4);
      });
    } else if (filterStatus === 'mastered') {
      list = list.filter((w) => {
        const srs = srsMap[w.id];
        return srs && srs.level === 5;
      });
    } else if (filterStatus === 'starred') {
      list = list.filter((w) => bookmarkedIds.includes(w.id));
    }

    // If filter results in empty, fallback to available list in collection so user can still practice
    if (list.length === 0) {
      if (selectedTopic === 'custom') {
        list = [...customWords];
      } else if (selectedTopic.startsWith('cdeck-')) {
        list = customWords.filter((w) => w.collectionId === selectedTopic);
      } else {
        list = selectedTopic === 'all' ? [...allWords] : allWords.filter((w) => w.collectionId === selectedTopic);
      }
    }

    // 3. Sort order
    if (sortOrder === 'az') {
      list.sort((a, b) => a.lemma.localeCompare(b.lemma));
    } else if (sortOrder === 'difficulty') {
      const levelOrder: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
      list.sort((a, b) => (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0));
    } else if (sortOrder === 'newest') {
      list.reverse();
    } else {
      // Random
      list.sort(() => Math.random() - 0.5);
    }

    // 4. Limit count
    return list.slice(0, wordCountLimit);
  }, [allWords, customWords, selectedTopic, filterStatus, sortOrder, wordCountLimit, srsMap, bookmarkedIds]);

  // Group words by SRS level
  const wordsByLevel = useMemo(() => {
    const groups: Record<number, VocabularyWord[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    allWords.forEach((word) => {
      const srs = srsMap[word.id];
      const lvl = srs ? srs.level : 1;
      if (groups[lvl]) {
        groups[lvl].push(word);
      } else {
        groups[1].push(word);
      }
    });
    return groups;
  }, [allWords, srsMap]);

  // Calculate words due today
  const dueWords = useMemo(() => {
    const now = new Date().getTime();
    return allWords.filter((w) => {
      const srs = srsMap[w.id];
      if (!srs) return true;
      return new Date(srs.nextReviewAt).getTime() <= now;
    });
  }, [allWords, srsMap]);

  // Mastered words (Level 5)
  const masteredWordsCount = wordsByLevel[5]?.length || 0;
  // Total learned words
  const totalLearnedCount = useMemo(() => {
    return Object.values(srsMap).filter((s) => s.reviewCount > 0).length;
  }, [srsMap]);

  // Words for the currently selected level in SRS mode
  const activeLevelWords = useMemo(() => {
    const list = wordsByLevel[selectedLevel] || [];
    return list.filter((w) => {
      const matchSearch =
        w.lemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.senses.some((s) =>
          s.viDefinition.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchTopic = selectedTopic === 'all' || w.collectionId === selectedTopic;
      return matchSearch && matchTopic;
    });
  }, [wordsByLevel, selectedLevel, searchQuery, selectedTopic]);

  // Words for Notebook view
  const notebookWords = useMemo(() => {
    const customIds = new Set(customWords.map((cw) => cw.id));
    return allWords.filter((w) => {
      const matchSearch =
        w.lemma.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.senses.some((s) =>
          s.viDefinition.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchTopic =
        selectedTopic === 'all'
          ? true
          : selectedTopic === 'custom'
          ? (w.collectionId === 'custom' || customIds.has(w.id))
          : (w.collectionId === selectedTopic && !customIds.has(w.id));

      if (!matchSearch || !matchTopic) return false;

      const srs = srsMap[w.id];
      const lvl = srs ? srs.level : 1;
      if (notebookFilter === 'custom') return w.collectionId === 'custom' || customIds.has(w.id);
      if (notebookFilter === 'bookmarked') return bookmarkedIds.includes(w.id);
      if (notebookFilter === 'mastered') return lvl === 5;
      if (notebookFilter === 'weak') return lvl <= 2;
      return true;
    });
  }, [allWords, customWords, searchQuery, selectedTopic, notebookFilter, bookmarkedIds, srsMap]);

  // Update Daily Goal
  const handleSelectGoal = (goal: number) => {
    setDailyGoal(goal);
    persistDailyGoal(goal);
  };

  // SRS Promote / Demote
  const handleSRSAction = (wordId: string, isCorrect: boolean) => {
    const updated = updateWordSRS(wordId, isCorrect);
    setSrsMap((prev) => ({ ...prev, [wordId]: updated }));
    addXP(isCorrect ? 15 : 5);
  };

  // Toggle Bookmark
  const handleToggleBookmark = (wordId: string) => {
    toggleBookmark(wordId);
    setBookmarkedIds(getBookmarks());
  };

  // Record practice history
  const handleRecordHistory = (mode: string, modeName: string, total: number, correct: number, xp: number) => {
    addVocabHistoryItem({
      mode,
      modeName,
      totalWords: total,
      correctCount: correct,
      xpEarned: xp,
    });
    setHistoryList(getVocabHistory());
  };

  // Flashcard review session in SRS modal
  const reviewWordsList = dueWords.length > 0 ? dueWords : activeLevelWords;
  const currentReviewWord = reviewWordsList[reviewWordIndex] || reviewWordsList[0];

  const handleNextFlashcard = (isCorrect: boolean) => {
    if (currentReviewWord) {
      handleSRSAction(currentReviewWord.id, isCorrect);
    }
    setIsFlipped(false);
    if (reviewWordIndex < reviewWordsList.length - 1) {
      setReviewWordIndex((prev) => prev + 1);
    } else {
      setIsReviewModalOpen(false);
      setReviewWordIndex(0);
      handleRecordHistory('srs', 'Ôn tập ngắt quãng (SRS)', reviewWordsList.length, reviewWordsList.length, 25);
    }
  };

  // Switch deck from DecksView - always open the Hub layout for that deck
  const handleSelectDeck = (collectionId: string) => {
    setSelectedTopic(collectionId);
    setLearnMode('hub');
    setActiveTab('learn');
  };

  const activeCollection = useMemo(() => {
    if (selectedTopic === 'custom') {
      return {
        id: 'custom',
        title: 'Bộ từ của tôi (Tất cả)',
        slug: 'my-custom-deck',
        description: 'Kho từ vựng cá nhân do bạn tự thêm và quản lý.',
        icon: 'Sparkles',
        wordsCount: customWords.length,
        category: 'Custom' as const,
      };
    }
    if (selectedTopic.startsWith('cdeck-')) {
      const cd = customDecks.find((d) => d.id === selectedTopic);
      const cWords = customWords.filter((w) => w.collectionId === selectedTopic);
      return {
        id: selectedTopic,
        title: cd ? `${cd.icon} ${cd.title}` : 'Bộ từ cá nhân',
        slug: selectedTopic,
        description: cd?.description || 'Bộ từ vựng cá nhân tự tạo.',
        icon: cd?.icon || '📁',
        wordsCount: cWords.length,
        category: 'Custom' as const,
      };
    }
    return VOCABULARY_COLLECTIONS.find((c) => c.id === selectedTopic);
  }, [selectedTopic, customWords, customDecks]);

  const MODE_TITLES: Record<string, string> = {
    flashcard: 'Thẻ ghi nhớ Flashcard',
    quiz: 'Trắc nghiệm chọn đáp án đúng',
    matching: 'Ghép đôi từ vựng và nghĩa',
    dictation: 'Gõ từ vựng tiếng Anh',
    listening_write: 'Nghe phát âm và viết từ',
    srs: 'Ôn tập ngắt quãng (SRS)',
  };

  return (
    <div className="bg-[#F6F8FB] min-h-[calc(100vh-80px)] flex flex-col md:flex-row text-slate-800">
      
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-200 z-20 flex-shrink-0 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Top Navigation */}
        <div className="p-4 space-y-1">
          {/* 1. HỌC TỪ VỰNG (Active / Primary hub) */}
          <button
            onClick={() => {
              setActiveTab('learn');
              setLearnMode('hub');
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'learn'
                ? 'bg-[#FFF0E7] text-[#FF5C28] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className={`w-5 h-5 flex-shrink-0 ${activeTab === 'learn' ? 'text-[#FF5C28]' : 'text-slate-400'}`} />
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Học Từ Vựng</span>
                <span className="px-2 py-0.5 rounded-full bg-[#FF5C28] text-white text-[10px] font-black">
                  6 dạng
                </span>
              </div>
            )}
          </button>

          {/* 2. BỘ TỪ VỰNG (Decks / Collections) */}
          <button
            onClick={() => {
              setActiveTab('decks');
              setLearnMode('hub');
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'decks'
                ? 'bg-[#FFF0E7] text-[#FF5C28] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className={`w-5 h-5 flex-shrink-0 ${activeTab === 'decks' ? 'text-[#FF5C28]' : 'text-slate-400'}`} />
            {!isSidebarCollapsed && <span>Bộ Từ Vựng</span>}
          </button>

          {/* 3. BỘ TỪ CỦA TÔI (Personal Custom Word Deck) */}
          <button
            onClick={() => {
              setActiveTab('my-deck');
              setLearnMode('hub');
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'my-deck'
                ? 'bg-[#FFF0E7] text-[#FF5C28] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className={`w-5 h-5 flex-shrink-0 ${activeTab === 'my-deck' ? 'text-[#FF5C28]' : 'text-amber-500'}`} />
            {!isSidebarCollapsed && (
              <div className="flex items-center justify-between flex-1">
                <span>Bộ Từ Của Tôi</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5C28] text-[10px] font-black border border-orange-200">
                  {customDecks.length} bộ · {customWords.length} từ
                </span>
              </div>
            )}
          </button>

          {/* 4. SỔ TỪ VỰNG (Notebook & Bookmarks) */}
          <button
            onClick={() => {
              setActiveTab('notebook');
              setLearnMode('hub');
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
              activeTab === 'notebook'
                ? 'bg-[#FFF0E7] text-[#FF5C28] shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookMarked className={`w-5 h-5 flex-shrink-0 ${activeTab === 'notebook' ? 'text-[#FF5C28]' : 'text-slate-400'}`} />
            {!isSidebarCollapsed && <span>Sổ Từ Vựng</span>}
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-dashed border-slate-200 space-y-1">
          {/* Cửa hàng */}
          <button
            onClick={() => setActiveModal('shop')}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Cửa hàng</span>}
          </button>

          {/* Cài đặt */}
          <button
            onClick={() => setActiveModal('settings')}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Cài đặt</span>}
          </button>

          {/* Hỗ trợ LinguaCore */}
          <button
            onClick={() => setActiveModal('support')}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-semibold text-sm transition-colors"
          >
            <Heart className="w-4 h-4 flex-shrink-0 text-rose-500" />
            {!isSidebarCollapsed && <span>Hỗ trợ LinguaCore</span>}
          </button>

          {/* Thu gọn toggle */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 font-semibold text-xs transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 mx-auto" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                <span>Thu gọn</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">

        {/* ========================================================
            TAB 1: HỌC TỪ VỰNG (Learning Hub or Active Game Session)
           ======================================================== */}
        {activeTab === 'learn' && (
          learnMode !== 'hub' ? (
            <div className="space-y-6 animate-in fade-in duration-200">
                {/* Back to Hub Header bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 flex items-center justify-between shadow-sm">
                  <button
                    onClick={() => setLearnMode('hub')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Quay lại danh mục dạng bài</span>
                  </button>

                  <div className="text-right">
                    <span className="text-xs font-black text-[#FF5C28] uppercase tracking-wide block">
                      {MODE_TITLES[learnMode] || 'Luyện tập'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {activeCollection ? activeCollection.title : 'Tất cả bộ từ'} · {filteredWords.length} từ
                    </span>
                  </div>
                </div>

                {/* MODE: FLASHCARD */}
                {learnMode === 'flashcard' && (
                  <FlashcardMode
                    words={filteredWords}
                    bookmarkedIds={bookmarkedIds}
                    onToggleBookmark={handleToggleBookmark}
                    onWordResult={handleSRSAction}
                  />
                )}

                {/* MODE: TRẮC NGHIỆM */}
                {learnMode === 'quiz' && (
                  <QuizMode
                    words={filteredWords}
                    allWords={allWords}
                    onWordResult={handleSRSAction}
                  />
                )}

                {/* MODE: NỐI TỪ VỚI NGHĨA */}
                {learnMode === 'matching' && (
                  <MatchingMode
                    words={filteredWords}
                    onWordResult={handleSRSAction}
                  />
                )}

                {/* MODE: GÕ TỪ VỰNG */}
                {learnMode === 'dictation' && (
                  <DictationMode
                    words={filteredWords}
                    onWordResult={handleSRSAction}
                  />
                )}

                {/* MODE: NGHE VIẾT */}
                {learnMode === 'listening_write' && (
                  <DictationMode
                    words={filteredWords}
                    onWordResult={handleSRSAction}
                  />
                )}

                {/* MODE: ÔN TẬP NGẮT QUÃNG SRS */}
                {learnMode === 'srs' && (
                  <div className="space-y-6">
                    {/* Top Tip Banner matching user screenshot */}
                    <div className="bg-[#FFF0E7] border border-[#FFE4D6] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xs">
                      <div className="w-6 h-6 rounded-full bg-[#FF5C28] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Plus className="w-4 h-4" />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#C4380D] leading-relaxed">
                        Thuật toán sẽ tính toán thời điểm vàng để bạn không bao giờ quên từ vựng.
                      </p>
                    </div>

                    {/* Big Orange Card: "ÔN TẬP HÔM NAY" */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF5C28] via-[#FF7043] to-[#FF8C66] text-white shadow-lg shadow-[#FF5C28]/20">
                      <div className="absolute right-12 top-6 w-72 h-44 pointer-events-none opacity-25 hidden sm:block">
                        <div className="absolute top-2 right-12 w-32 h-20 bg-white/40 rounded-xl transform rotate-12 backdrop-blur-xs border border-white/50" />
                        <div className="absolute top-8 right-24 w-36 h-22 bg-white/50 rounded-xl transform -rotate-6 backdrop-blur-xs border border-white/60" />
                        <div className="absolute bottom-2 right-4 w-14 h-14 rounded-full border-4 border-white/50 flex items-center justify-center">
                          <Clock className="w-7 h-7 text-white" />
                        </div>
                      </div>

                      <div className="p-7 sm:p-9 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Left Content */}
                        <div className="space-y-2 max-w-md">
                          <div className="flex items-center gap-2 text-xs font-black tracking-wider uppercase opacity-90">
                            <span>ÔN TẬP HÔM NAY</span>
                            <TrendingUp className="w-4 h-4" />
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-6xl sm:text-7xl font-black tracking-tight leading-none">
                              {dueWords.length}
                            </span>
                            <span className="text-lg sm:text-xl font-bold opacity-95">
                              từ đang đến hạn
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-orange-50/90 leading-relaxed pt-1">
                            {dueWords.length === 0 ? (
                              <>Hôm nay sạch lịch. Vào danh sách dưới để xem tiến độ từng cấp.</>
                            ) : (
                              <>Có {dueWords.length} từ đã đến thời điểm vàng cần ôn tập lại để củng cố trí nhớ.</>
                            )}
                          </p>

                          {dueWords.length > 0 && (
                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setReviewWordIndex(0);
                                  setIsReviewModalOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#FF5C28] font-black text-xs sm:text-sm hover:bg-[#FFF0E7] shadow-md transition-all transform hover:scale-[1.02]"
                              >
                                <Play className="w-4 h-4 fill-current" />
                                <span>Bắt đầu ôn {dueWords.length} từ ngay</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Right: Circle Badge "X đã vững" */}
                        <div className="flex items-center justify-center md:mr-16">
                          <div className="w-32 h-32 rounded-full border-4 border-white/30 bg-white/15 backdrop-blur-md flex flex-col items-center justify-center text-center shadow-inner relative group hover:scale-105 transition-transform">
                            <span className="text-4xl font-black leading-none">{masteredWordsCount}</span>
                            <span className="text-xs font-bold text-orange-100 mt-1 uppercase tracking-wide">
                              đã vững
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Darker Bottom Stats Bar */}
                      <div className="bg-[#E64A19]/60 px-7 sm:px-9 py-3 border-t border-white/10 flex items-center gap-8 text-xs font-semibold">
                        <div className="flex items-center gap-2 text-orange-100">
                          <MessageSquare className="w-4 h-4" />
                          <span>Đã học: <strong className="text-white font-bold">{totalLearnedCount}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-orange-100">
                          <Layers className="w-4 h-4" />
                          <span>Từ trong cấp: <strong className="text-white font-bold">{wordsByLevel[selectedLevel]?.length || 0}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION: "Tiến độ theo cấp" */}
                    <div className="space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base sm:text-lg font-black text-slate-900">Tiến độ theo cấp</h2>
                        <button
                          onClick={() => setSelectedTopic('all')}
                          className="text-xs font-bold text-slate-500 hover:text-[#FF5C28] transition-colors"
                        >
                          Xem tất cả &rsaquo;
                        </button>
                      </div>

                      {/* 5 SRS Level Cards Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {/* Cấp 1 */}
                        <button
                          onClick={() => setSelectedLevel(1)}
                          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all border text-left ${
                            selectedLevel === 1
                              ? 'bg-[#FF5C28] text-white border-[#FF5C28] shadow-md shadow-[#FF5C28]/25'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                              selectedLevel === 1 ? 'bg-white/20 text-white' : 'bg-[#FFF0E7] text-[#FF5C28]'
                            }`}
                          >
                            Cấp 1
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                              selectedLevel === 1 ? 'bg-white/20 text-white' : 'bg-[#FFF0E7] text-[#FF5C28]'
                            }`}
                          >
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-sm">Làm quen</h3>
                          <span className={`text-[11px] mt-0.5 ${selectedLevel === 1 ? 'text-orange-100' : 'text-slate-400'}`}>
                            Ôn lại sau 10 phút
                          </span>
                          <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${
                            selectedLevel === 1 ? 'bg-white/15' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wordsByLevel[1]?.length || 0} từ
                          </span>
                        </button>

                        {/* Cấp 2 */}
                        <button
                          onClick={() => setSelectedLevel(2)}
                          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all border text-left ${
                            selectedLevel === 2
                              ? 'bg-[#FF5C28] text-white border-[#FF5C28] shadow-md shadow-[#FF5C28]/25'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                              selectedLevel === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Cấp 2
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                              selectedLevel === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Moon className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-sm">Lưu giữ qua đêm</h3>
                          <span className={`text-[11px] mt-0.5 ${selectedLevel === 2 ? 'text-orange-100' : 'text-slate-400'}`}>
                            Ôn lại sau 24 giờ
                          </span>
                          <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${
                            selectedLevel === 2 ? 'bg-white/15' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wordsByLevel[2]?.length || 0} từ
                          </span>
                        </button>

                        {/* Cấp 3 */}
                        <button
                          onClick={() => setSelectedLevel(3)}
                          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all border text-left ${
                            selectedLevel === 3
                              ? 'bg-[#FF5C28] text-white border-[#FF5C28] shadow-md shadow-[#FF5C28]/25'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                              selectedLevel === 3 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Cấp 3
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                              selectedLevel === 3 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Calendar className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-sm">Ghi nhớ lâu dài</h3>
                          <span className={`text-[11px] mt-0.5 ${selectedLevel === 3 ? 'text-orange-100' : 'text-slate-400'}`}>
                            Ôn lại sau 3 ngày
                          </span>
                          <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${
                            selectedLevel === 3 ? 'bg-white/15' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wordsByLevel[3]?.length || 0} từ
                          </span>
                        </button>

                        {/* Cấp 4 */}
                        <button
                          onClick={() => setSelectedLevel(4)}
                          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all border text-left ${
                            selectedLevel === 4
                              ? 'bg-[#FF5C28] text-white border-[#FF5C28] shadow-md shadow-[#FF5C28]/25'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                              selectedLevel === 4 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Cấp 4
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                              selectedLevel === 4 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-sm">Ghi nhớ bền vững</h3>
                          <span className={`text-[11px] mt-0.5 ${selectedLevel === 4 ? 'text-orange-100' : 'text-slate-400'}`}>
                            Ôn lại sau 7 ngày
                          </span>
                          <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${
                            selectedLevel === 4 ? 'bg-white/15' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wordsByLevel[4]?.length || 0} từ
                          </span>
                        </button>

                        {/* Cấp 5 */}
                        <button
                          onClick={() => setSelectedLevel(5)}
                          className={`rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between transition-all border text-left ${
                            selectedLevel === 5
                              ? 'bg-[#FF5C28] text-white border-[#FF5C28] shadow-md shadow-[#FF5C28]/25'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase mb-3 ${
                              selectedLevel === 5 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Cấp 5
                          </span>
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 ${
                              selectedLevel === 5 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Trophy className="w-5 h-5" />
                          </div>
                          <h3 className="font-black text-sm">Bảo trì dài hạn</h3>
                          <span className={`text-[11px] mt-0.5 ${selectedLevel === 5 ? 'text-orange-100' : 'text-slate-400'}`}>
                            Ôn lại sau 30 ngày
                          </span>
                          <span className={`text-[10px] font-bold mt-2 px-2 py-0.5 rounded-md ${
                            selectedLevel === 5 ? 'bg-white/15' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {wordsByLevel[5]?.length || 0} từ
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Level Details Banner */}
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm font-semibold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span>
                          {activeLevelWords.length > 0
                            ? `Hiện đang có ${activeLevelWords.length} từ ở Cấp ${selectedLevel}. Hãy ôn luyện để thăng cấp.`
                            : `Hiện chưa có từ nào ở Cấp ${selectedLevel}. Bạn có thể thêm từ mới ngay bên dưới!`}
                        </span>
                      </div>

                      {activeLevelWords.length > 0 && (
                        <button
                          onClick={() => {
                            setReviewWordIndex(0);
                            setIsReviewModalOpen(true);
                          }}
                          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors whitespace-nowrap ml-2"
                        >
                          Luyện tập cấp này &rsaquo;
                        </button>
                      )}
                    </div>

                    {/* Level Word List Card */}
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div>
                          <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#FF5C28]" />
                            <span>Danh sách từ Cấp {selectedLevel}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {activeLevelWords.length} từ trong danh sách
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Tìm từ vựng..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 w-36 sm:w-48"
                            />
                          </div>

                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Nhập từ</span>
                          </button>

                          {activeLevelWords.length > 0 && (
                            <button
                              onClick={() => {
                                setReviewWordIndex(0);
                                setIsReviewModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF5C28] text-white text-xs font-bold hover:bg-[#ea501e] transition-colors shadow-xs"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Ôn tập ({activeLevelWords.length})</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {activeLevelWords.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-16 h-16 rounded-3xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8" />
                          </div>
                          <h4 className="text-base font-bold text-slate-800">
                            Chưa có từ vựng nào ở Cấp {selectedLevel}
                          </h4>
                          <p className="text-xs text-slate-500 max-w-sm mx-auto">
                            Các từ sẽ tự động thăng cấp khi bạn ôn tập thành công trong các phiên SRS hàng ngày.
                          </p>
                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-4 py-2 rounded-xl bg-[#FF5C28] text-white text-xs font-bold shadow-xs hover:bg-[#ea501e]"
                          >
                            Thêm từ mới vào kho từ
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {activeLevelWords.map((word) => {
                            const isBookmarked = bookmarkedIds.includes(word.id);
                            const sense = word.senses[0];

                            return (
                              <div
                                key={word.id}
                                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2 rounded-2xl transition-colors"
                              >
                                <div className="space-y-1.5 min-w-0 flex-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-base font-black text-slate-900 tracking-tight">
                                      {word.lemma}
                                    </span>
                                    <span className="text-xs font-mono font-medium text-slate-500">
                                      {word.ipa}
                                    </span>
                                    <button
                                      onClick={() => speakText(word.lemma)}
                                      className="p-1 rounded-lg text-slate-400 hover:text-[#FF5C28] hover:bg-[#FFF0E7] transition-colors"
                                      title="Phát âm"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                      {word.level}
                                    </span>
                                  </div>

                                  <p className="text-sm font-bold text-[#FF5C28]">
                                    {sense?.viDefinition}
                                  </p>

                                  {sense?.examples?.[0] && (
                                    <p className="text-xs text-slate-500 italic">
                                      "{sense.examples[0].en}"
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleToggleBookmark(word.id)}
                                    className={`p-2 rounded-xl border transition-colors ${
                                      isBookmarked
                                        ? 'bg-amber-50 border-amber-300 text-amber-500'
                                        : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                                    title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ'}
                                  >
                                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                                  </button>

                                  <button
                                    onClick={() => handleSRSAction(word.id, true)}
                                    className="px-3 py-1.5 rounded-xl bg-[#FFF0E7] hover:bg-[#FFE4D6] text-[#FF5C28] text-xs font-bold transition-colors"
                                  >
                                    Thăng cấp
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
          ) : (
            <LearningHubView
              allWords={allWords}
              customWords={customWords}
              customDecks={customDecks}
              srsMap={srsMap}
              historyList={historyList}
              selectedCollection={selectedTopic}
              onSelectCollection={setSelectedTopic}
              filterStatus={filterStatus}
              onSelectFilterStatus={setFilterStatus}
              sortOrder={sortOrder}
              onSelectSortOrder={setSortOrder}
              wordCountLimit={wordCountLimit}
              onSelectWordCountLimit={setWordCountLimit}
              availableWordsCount={filteredWords.length}
              onStartMode={(mode) => setLearnMode(mode)}
              onStartSRS={() => setLearnMode('srs')}
              onOpenAddWordModal={() => {
                setSelectedDeckForAdd(undefined);
                setIsAddWordModalOpen(true);
              }}
              onOpenImportModal={() => {
                setSelectedDeckForAdd(undefined);
                setIsImportModalOpen(true);
              }}
            />
          )
        )}

            {/* ========================================================
                TAB 2: BỘ TỪ VỰNG (Decks View)
               ======================================================== */}
        {activeTab === 'decks' && (
          <DecksView
            allWords={allWords}
            customWords={customWords}
            srsMap={srsMap}
            onSelectDeck={handleSelectDeck}
            onOpenImportModal={() => {
              setSelectedDeckForAdd(undefined);
              setIsImportModalOpen(true);
            }}
            onOpenAddWordModal={() => {
              setSelectedDeckForAdd(undefined);
              setIsAddWordModalOpen(true);
            }}
          />
        )}

        {/* ========================================================
            TAB 2.5: BỘ TỪ CỦA TÔI (My Custom Deck View)
           ======================================================== */}
        {activeTab === 'my-deck' && (
          <MyDeckView
            customDecks={customDecks}
            customWords={customWords}
            srsMap={srsMap}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onDeleteWord={(id) => {
              deleteCustomWord(id);
              refreshData();
            }}
            onDeleteDeck={(deckId) => {
              deleteCustomDeck(deckId);
              refreshData();
            }}
            onOpenAddWordModal={(deckId) => {
              setSelectedDeckForAdd(deckId);
              setIsAddWordModalOpen(true);
            }}
            onOpenImportModal={(deckId) => {
              setSelectedDeckForAdd(deckId);
              setIsImportModalOpen(true);
            }}
            onOpenCreateDeckModal={() => setIsCreateDeckModalOpen(true)}
            onStartStudyAll={(deckId) => {
              setSelectedTopic(deckId || 'custom');
              setActiveTab('learn');
              setLearnMode('hub');
            }}
            onStartSpecificMode={(mode, deckId) => {
              setSelectedTopic(deckId || 'custom');
              setActiveTab('learn');
              setLearnMode(mode);
            }}
            onRefreshData={refreshData}
          />
        )}

        {/* ========================================================
            TAB 3: SỔ TỪ VỰNG (Notebook & Bookmarks)
           ======================================================== */}
        {activeTab === 'notebook' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Notebook Header */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Sổ Từ Vựng
                </h1>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setFilterStatus('starred');
                    setLearnMode('hub');
                    setActiveTab('learn');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF0E7] hover:bg-[#FFE4D6] text-[#FF5C28] text-xs sm:text-sm font-bold shadow-xs transition-all transform hover:scale-[1.02]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Vào học sổ từ (6 dạng)</span>
                </button>

                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#FF5C28]/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nhập thêm từ mới</span>
                </button>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setNotebookFilter('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    notebookFilter === 'all'
                      ? 'bg-[#FF5C28] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Tất cả ({allWords.length})
                </button>
                <button
                  onClick={() => setNotebookFilter('custom')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                    notebookFilter === 'custom'
                      ? 'bg-[#FF5C28] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>⭐ Bộ từ của tôi ({customWords.length})</span>
                </button>
                <button
                  onClick={() => setNotebookFilter('bookmarked')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    notebookFilter === 'bookmarked'
                      ? 'bg-[#FF5C28] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Đã đánh dấu ({bookmarkedIds.length})
                </button>
                <button
                  onClick={() => setNotebookFilter('weak')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    notebookFilter === 'weak'
                      ? 'bg-[#FF5C28] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Cần củng cố ({(wordsByLevel[1]?.length || 0) + (wordsByLevel[2]?.length || 0)})
                </button>
                <button
                  onClick={() => setNotebookFilter('mastered')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                    notebookFilter === 'mastered'
                      ? 'bg-[#FF5C28] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Đã vững Cấp 5 ({wordsByLevel[5]?.length || 0})
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm từ hoặc nghĩa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 w-full sm:w-60 shadow-xs"
                />
              </div>
            </div>

            {/* Notebook Words List */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
              {notebookWords.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">Không tìm thấy từ vựng nào</h4>
                  <p className="text-xs text-slate-500">
                    Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notebookWords.map((word) => {
                    const isBookmarked = bookmarkedIds.includes(word.id);
                    const srs = srsMap[word.id];
                    const level = srs ? srs.level : 1;
                    const sense = word.senses[0];

                    return (
                      <div
                        key={word.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-2.5 rounded-2xl transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-black text-slate-900 tracking-tight">
                              {word.lemma}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              {word.ipa}
                            </span>
                            <button
                              onClick={() => speakText(word.lemma)}
                              className="p-1 rounded-lg text-slate-400 hover:text-[#FF5C28] hover:bg-[#FFF0E7] transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <span className="px-2 py-0.5 rounded-md bg-[#FFF0E7] text-[#FF5C28] text-[10px] font-black uppercase">
                              Cấp {level}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-[#FF5C28]">
                            {sense?.viDefinition}
                          </p>

                          {sense?.examples?.[0] && (
                            <p className="text-xs text-slate-500 italic">
                              "{sense.examples[0].en}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {customWords.some((cw) => cw.id === word.id) && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xóa từ "${word.lemma}" khỏi Bộ từ của tôi?`)) {
                                  deleteCustomWord(word.id);
                                  refreshData();
                                }
                              }}
                              className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                              title="Xóa khỏi Bộ từ của tôi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleBookmark(word.id)}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              isBookmarked
                                ? 'bg-amber-50 border-amber-300 text-amber-500'
                                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                            title={isBookmarked ? 'Bỏ lưu' : 'Lưu từ'}
                          >
                            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
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

      </main>

      {/* FLASHCARD INTERACTIVE REVIEW MODAL (SRS QUICK SESSION) */}
      {isReviewModalOpen && currentReviewWord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                <Layers className="w-4 h-4 text-[#FF5C28]" />
                <span>Phiên Ôn Tập SRS · Thẻ {reviewWordIndex + 1}/{reviewWordsList.length}</span>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer min-h-[220px] rounded-2xl bg-gradient-to-b from-[#FFF7F2] to-white border-2 border-[#FFE4D6] p-6 flex flex-col items-center justify-center text-center space-y-3 relative group transition-all hover:border-[#FF5C28]"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {isFlipped ? 'Nghĩa & Ví dụ' : 'Từ vựng (Bấm để lật thẻ)'}
              </span>

              {!isFlipped ? (
                <>
                  <h3 className="text-3xl font-black text-slate-900">
                    {currentReviewWord.lemma}
                  </h3>
                  <span className="text-sm font-mono text-slate-500">
                    {currentReviewWord.ipa}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentReviewWord.lemma);
                    }}
                    className="p-2 rounded-full bg-[#FFF0E7] text-[#FF5C28] hover:bg-[#FFE4D6] transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-[#FF5C28]">
                    {currentReviewWord.senses[0]?.viDefinition}
                  </h4>
                  <p className="text-xs text-slate-500 italic max-w-sm">
                    "{currentReviewWord.senses[0]?.examples[0]?.en}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {currentReviewWord.senses[0]?.examples[0]?.vi}
                  </p>
                </div>
              )}
            </div>

            {/* Review Decision Buttons: 4 Leitner SRS Ratings */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => handleNextFlashcard(false)}
                className="py-3 px-2 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all text-center"
              >
                Chưa nhớ (Cấp 1)
              </button>
              <button
                onClick={() => handleNextFlashcard(true)}
                className="py-3 px-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-all text-center"
              >
                Khó (Cấp 2)
              </button>
              <button
                onClick={() => handleNextFlashcard(true)}
                className="py-3 px-2 rounded-xl border border-[#FFD8C7] bg-[#FFF0E7] hover:bg-[#FFE4D6] text-[#FF5C28] font-bold text-xs transition-all text-center"
              >
                Tốt (Cấp 3)
              </button>
              <button
                onClick={() => handleNextFlashcard(true)}
                className="py-3 px-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs transition-all text-center shadow-xs"
              >
                Dễ (+15 Xu)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODALS FOR SHOP / SETTINGS / SUPPORT */}
      {activeModal === 'shop' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                <span>Cửa Hàng Phần Thưởng</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Đổi Xu thưởng lấy các đặc quyền học tập:</p>
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Đóng Băng Chuỗi Ngày (Streak Freeze)</h4>
                  <span className="text-[11px] text-slate-400">Bảo vệ chuỗi ngày nếu lỡ quên học 1 hôm.</span>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs">
                  200 Xu
                </button>
              </div>
              <div className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Gói Giọng Đọc Bản Xứ Premium</h4>
                  <span className="text-[11px] text-slate-400">Giọng đọc Anh - Mỹ tự nhiên độ nét cao.</span>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-[#FF5C28] text-white font-bold text-xs">
                  500 Xu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'settings' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#FF5C28]" />
                <span>Cài Đặt Học Tập</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-2">Mục tiêu từ mới mỗi ngày:</label>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleSelectGoal(g)}
                      className={`flex-1 py-2 rounded-xl font-bold border transition-colors ${
                        dailyGoal === g
                          ? 'bg-[#FF5C28] text-white border-[#FF5C28]'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {g} từ
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Thuật toán lặp lại ngắt quãng:</label>
                <span className="text-[11px] text-slate-400">SuperMemo SM-2 chuẩn hóa theo chu kỳ 10p, 24h, 3 ngày, 7 ngày, 30 ngày.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Hỗ Trợ Học Viên LinguaCore</span>
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có góp ý hoặc gặp khó khăn khi học từ vựng? Đội ngũ giáo viên và kỹ thuật luôn sẵn sàng hỗ trợ bạn 24/7.
            </p>
            <div className="p-3 bg-[#FFF0E7] rounded-2xl text-xs text-[#C4380D] font-medium">
              Email hỗ trợ: <strong>support@linguacore.edu.vn</strong>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT VOCABULARY MODAL */}
      <ImportVocabularyModal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          refreshData();
        }}
        onImportSuccess={() => refreshData()}
        defaultDeckId={selectedDeckForAdd}
      />

      {/* ADD CUSTOM WORD MODAL */}
      <AddCustomWordModal
        isOpen={isAddWordModalOpen}
        onClose={() => {
          setIsAddWordModalOpen(false);
          refreshData();
        }}
        onSuccess={() => refreshData()}
        defaultDeckId={selectedDeckForAdd}
      />

      {/* CREATE CUSTOM DECK MODAL */}
      <CreateCustomDeckModal
        isOpen={isCreateDeckModalOpen}
        onClose={() => {
          setIsCreateDeckModalOpen(false);
          refreshData();
        }}
        onSuccess={() => refreshData()}
      />

      {/* 6. FLOATING CORNER ROBOT MASCOT & DAILY GOAL WIDGET */}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 select-none pointer-events-auto filter drop-shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
        {isGoalBubbleOpen && (
          <div className="bg-white rounded-[24px] p-4 sm:p-5 border border-slate-200/90 shadow-2xl max-w-[320px] space-y-3 relative transition-all">
            <button
              onClick={() => setIsGoalBubbleOpen(false)}
              className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Đóng hộp thoại"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <p className="text-xs sm:text-sm font-bold text-slate-900 pr-5 leading-snug">
              Mỗi ngày bạn muốn học bao nhiêu từ mới?
            </p>

            <div className="flex items-center gap-1.5 pt-0.5">
              {[5, 10, 15, 20].map((goal) => {
                const isSelected = dailyGoal === goal;
                return (
                  <button
                    key={goal}
                    onClick={() => handleSelectGoal(goal)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-[#FF5C28] text-white shadow-md shadow-[#FF5C28]/30 scale-105'
                        : 'bg-[#F0F4F8] text-slate-700 hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {goal} từ
                  </button>
                );
              })}
            </div>

            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-b border-r border-slate-200/90 transform rotate-45" />
          </div>
        )}

        <button
          onClick={() => setIsGoalBubbleOpen((prev) => !prev)}
          className="group relative cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          title="Linh vật LinguaCore - Bấm để đặt mục tiêu học từ vựng"
        >
          <VocaRobotMascot size={92} expression="happy" />
        </button>
      </div>

    </div>
  );
}
