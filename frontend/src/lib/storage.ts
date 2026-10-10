'use client';

import { MistakeRecord, UserProgressStats, VocabularyWord, Question } from '@/types';
import { VOCABULARY_WORDS, PRACTICE_QUESTIONS } from './data/mockData';

const STATS_KEY = 'elp_user_stats';
const COMPLETED_LESSONS_KEY = 'elp_completed_lessons';
const MISTAKES_KEY = 'elp_mistakes';
const BOOKMARKS_KEY = 'elp_bookmarks';
const CUSTOM_VOCAB_KEY = 'elp_custom_vocab';

const DEFAULT_STATS: UserProgressStats = {
  streakDays: 5,
  xp: 1420,
  level: 4,
  masteryPercent: 62,
  lessonsCompleted: 12,
  questionsAnswered: 84,
  grammarMastery: 70,
  vocabularyMastery: 55,
  activeMistakesCount: 3,
  savedBookmarksCount: 4,
};

export function getUserStats(): UserProgressStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_STATS;
  } catch {
    return DEFAULT_STATS;
  }
}

export function updateUserStats(updates: Partial<UserProgressStats>): UserProgressStats {
  const current = getUserStats();
  const next = { ...current, ...updates };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STATS_KEY, JSON.stringify(next));
  }
  return next;
}

export function addXP(amount: number) {
  const stats = getUserStats();
  const newXP = stats.xp + amount;
  const newLevel = Math.floor(newXP / 400) + 1;
  return updateUserStats({ xp: newXP, level: newLevel });
}

export function getCompletedLessons(): string[] {
  if (typeof window === 'undefined') return ['present-simple-1'];
  try {
    const raw = localStorage.getItem(COMPLETED_LESSONS_KEY);
    return raw ? JSON.parse(raw) : ['present-simple-1'];
  } catch {
    return ['present-simple-1'];
  }
}

export function markLessonCompleted(lessonId: string): string[] {
  const current = getCompletedLessons();
  if (!current.includes(lessonId)) {
    const next = [...current, lessonId];
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(next));
    }
    addXP(50);
    return next;
  }
  return current;
}

// Mistakes Notebook
export function getMistakes(): MistakeRecord[] {
  if (typeof window === 'undefined') {
    return [
      {
        id: 'mistake-1',
        question: PRACTICE_QUESTIONS[0],
        givenAnswer: 'b',
        correctAnswerText: 'leaves',
        failedCount: 2,
        correctedCount: 0,
        lastAttemptedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        status: 'needs_review',
      },
      {
        id: 'mistake-2',
        question: PRACTICE_QUESTIONS[3],
        givenAnswer: 'd',
        correctAnswerText: 'arrive',
        failedCount: 1,
        correctedCount: 0,
        lastAttemptedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        status: 'needs_review',
      },
    ];
  }

  try {
    const raw = localStorage.getItem(MISTAKES_KEY);
    if (!raw) {
      const initial: MistakeRecord[] = [
        {
          id: 'mistake-1',
          question: PRACTICE_QUESTIONS[0],
          givenAnswer: 'b',
          correctAnswerText: 'leaves',
          failedCount: 2,
          correctedCount: 0,
          lastAttemptedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          status: 'needs_review',
        },
        {
          id: 'mistake-2',
          question: PRACTICE_QUESTIONS[3],
          givenAnswer: 'd',
          correctAnswerText: 'arrive',
          failedCount: 1,
          correctedCount: 0,
          lastAttemptedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          status: 'needs_review',
        },
      ];
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordMistake(question: Question, givenAnswer: any, correctAnswerText: string) {
  const mistakes = getMistakes();
  const existingIndex = mistakes.findIndex((m) => m.question.id === question.id);

  if (existingIndex >= 0) {
    mistakes[existingIndex].failedCount += 1;
    mistakes[existingIndex].lastAttemptedAt = new Date().toISOString();
    mistakes[existingIndex].status = 'needs_review';
  } else {
    mistakes.unshift({
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question,
      givenAnswer,
      correctAnswerText,
      failedCount: 1,
      correctedCount: 0,
      lastAttemptedAt: new Date().toISOString(),
      status: 'needs_review',
    });
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
  }
  updateUserStats({ activeMistakesCount: mistakes.filter((m) => m.status === 'needs_review').length });
}

export function markMistakeCorrected(mistakeId: string) {
  const mistakes = getMistakes();
  const index = mistakes.findIndex((m) => m.id === mistakeId);
  if (index >= 0) {
    mistakes[index].correctedCount += 1;
    if (mistakes[index].correctedCount >= 2) {
      mistakes[index].status = 'mastered';
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
    }
    updateUserStats({ activeMistakesCount: mistakes.filter((m) => m.status === 'needs_review').length });
  }
}

// Bookmarks
export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return ['q-sc-1', 'w-1', 'w-4'];
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : ['q-sc-1', 'w-1', 'w-4'];
  } catch {
    return ['q-sc-1', 'w-1', 'w-4'];
  }
}

export function toggleBookmark(id: string): boolean {
  const bookmarks = getBookmarks();
  let next: string[];
  let isBookmarked: boolean;

  if (bookmarks.includes(id)) {
    next = bookmarks.filter((b) => b !== id);
    isBookmarked = false;
  } else {
    next = [...bookmarks, id];
    isBookmarked = true;
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(next));
  }
  updateUserStats({ savedBookmarksCount: next.length });
  return isBookmarked;
}

// Custom Deck Interface & Key
export interface CustomDeck {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
  createdAt: string;
}

const CUSTOM_DECKS_KEY = 'elp_custom_decks';

export const DEFAULT_STARTER_CUSTOM_DECKS: CustomDeck[] = [
  {
    id: 'cdeck-academic',
    title: 'Từ Vựng Học Thuật & Du Học',
    description: 'Các từ vựng nâng cao chuyên dùng cho bài luận học thuật và phỏng vấn du học.',
    icon: '🎓',
    color: '#7548CE',
    createdAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'cdeck-tech',
    title: 'Từ Vựng Công Nghệ & IT',
    description: 'Thuật ngữ ngành lập trình, phát triển phần mềm và tư duy giải pháp công nghệ.',
    icon: '💻',
    color: '#00A3C4',
    createdAt: '2026-09-05T00:00:00Z',
  },
  {
    id: 'cdeck-daily',
    title: 'Từ Vựng Giao Tiếp Tự Nhiên',
    description: 'Từ vựng và cụm diễn đạt đời thường giúp nói tiếng Anh tự nhiên như người bản xứ.',
    icon: '☕',
    color: '#FF5C28',
    createdAt: '2026-09-10T00:00:00Z',
  },
];

// Starter Custom Vocabulary Words for new users
export const DEFAULT_STARTER_CUSTOM_WORDS: VocabularyWord[] = [
  {
    id: 'custom-word-1',
    lemma: 'Perseverance',
    ipa: '/ˌpɜː.sɪˈvɪə.rəns/',
    level: 'B2',
    collectionId: 'cdeck-academic',
    senses: [
      {
        id: 's-custom-1',
        partOfSpeech: 'noun',
        definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
        viDefinition: 'Sự kiên trì, bền chí không nản lòng',
        examples: [
          {
            en: 'Through hard work and perseverance, she excelled in her English studies.',
            vi: 'Bằng sự chăm chỉ và lòng kiên trì, cô ấy đã xuất sắc trong việc học tiếng Anh.',
          },
        ],
      },
    ],
    collocations: ['great perseverance', 'show perseverance', 'with perseverance'],
    isMastered: false,
    isBookmarked: true,
  },
  {
    id: 'custom-word-2',
    lemma: 'Resilience',
    ipa: '/rɪˈzɪl.jəns/',
    level: 'B2',
    collectionId: 'cdeck-academic',
    senses: [
      {
        id: 's-custom-2',
        partOfSpeech: 'noun',
        definition: 'The capacity to recover quickly from difficulties; toughness.',
        viDefinition: 'Khả năng phục hồi, kiên cường vượt qua thử thách',
        examples: [
          {
            en: 'Courage and resilience helped him overcome the toughest challenges.',
            vi: 'Lòng dũng cảm và sự kiên cường đã giúp anh ấy vượt qua những thử thách khó khăn nhất.',
          },
        ],
      },
    ],
    collocations: ['mental resilience', 'build resilience', 'remarkable resilience'],
    isMastered: false,
    isBookmarked: false,
  },
  {
    id: 'custom-word-3',
    lemma: 'Eloquent',
    ipa: '/ˈel.ə.kwənt/',
    level: 'C1',
    collectionId: 'cdeck-academic',
    senses: [
      {
        id: 's-custom-3',
        partOfSpeech: 'adjective',
        definition: 'Fluent or persuasive in speaking or writing.',
        viDefinition: 'Lưu loát, hùng biện, truyền cảm',
        examples: [
          {
            en: 'An eloquent speaker can inspire thousands of listeners.',
            vi: 'Một diễn giả lưu loát có thể truyền cảm hứng cho hàng ngàn người nghe.',
          },
        ],
      },
    ],
    collocations: ['eloquent speech', 'eloquent speaker', 'highly eloquent'],
    isMastered: false,
    isBookmarked: true,
  },
  {
    id: 'custom-word-4',
    lemma: 'Serendipity',
    ipa: '/ˌser.ənˈdɪp.ə.ti/',
    level: 'C1',
    collectionId: 'cdeck-daily',
    senses: [
      {
        id: 's-custom-4',
        partOfSpeech: 'noun',
        definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
        viDefinition: 'Sự tình cờ may mắn, duyên may bất ngờ',
        examples: [
          {
            en: 'Finding this wonderful language app was pure serendipity.',
            vi: 'Tìm thấy ứng dụng học ngoại ngữ tuyệt vời này hoàn toàn là một duyên may bất ngờ.',
          },
        ],
      },
    ],
    collocations: ['pure serendipity', 'happy serendipity', 'moment of serendipity'],
    isMastered: false,
    isBookmarked: false,
  },
  {
    id: 'custom-word-5',
    lemma: 'Innovative',
    ipa: '/ˈɪn.ə.veɪ.tɪv/',
    level: 'B1',
    collectionId: 'cdeck-tech',
    senses: [
      {
        id: 's-custom-5',
        partOfSpeech: 'adjective',
        definition: 'Featuring new methods; advanced and original.',
        viDefinition: 'Đổi mới, sáng tạo, tiên tiến',
        examples: [
          {
            en: 'They developed innovative approaches to vocabulary learning.',
            vi: 'Họ đã phát triển các phương pháp tiếp cận đổi mới để học từ vựng.',
          },
        ],
      },
    ],
    collocations: ['innovative ideas', 'innovative approach', 'innovative design'],
    isMastered: false,
    isBookmarked: false,
  },
  {
    id: 'custom-word-6',
    lemma: 'Grit',
    ipa: '/ɡrɪt/',
    level: 'B2',
    collectionId: 'cdeck-tech',
    senses: [
      {
        id: 's-custom-6',
        partOfSpeech: 'noun',
        definition: 'Courage and resolve; strength of character.',
        viDefinition: 'Ý chí kiên cường, bản lĩnh bền bỉ',
        examples: [
          {
            en: 'True mastery in English requires consistent grit and curiosity.',
            vi: 'Thành thạo tiếng Anh thực sự đòi hỏi ý chí kiên cường và lòng hiếu học bền bỉ.',
          },
        ],
      },
    ],
    collocations: ['show grit', 'true grit', 'grit and determination'],
    isMastered: false,
    isBookmarked: false,
  },
];

// Custom Decks CRUD
export function getCustomDecks(): CustomDeck[] {
  if (typeof window === 'undefined') return DEFAULT_STARTER_CUSTOM_DECKS;
  try {
    const raw = localStorage.getItem(CUSTOM_DECKS_KEY);
    if (raw === null) {
      localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(DEFAULT_STARTER_CUSTOM_DECKS));
      return DEFAULT_STARTER_CUSTOM_DECKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STARTER_CUSTOM_DECKS;
  } catch {
    return DEFAULT_STARTER_CUSTOM_DECKS;
  }
}

export function saveCustomDecks(decks: CustomDeck[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_DECKS_KEY, JSON.stringify(decks));
}

export function createCustomDeck(data: {
  title: string;
  description?: string;
  icon?: string;
  color?: string;
}): CustomDeck {
  const current = getCustomDecks();
  const newDeck: CustomDeck = {
    id: `cdeck-${Date.now()}`,
    title: data.title.trim(),
    description: data.description?.trim() || 'Bộ từ vựng cá nhân tự tạo.',
    icon: data.icon || '📁',
    color: data.color || '#FF5C28',
    createdAt: new Date().toISOString(),
  };
  const updated = [newDeck, ...current];
  saveCustomDecks(updated);
  return newDeck;
}

export function updateCustomDeck(
  deckId: string,
  updates: Partial<Omit<CustomDeck, 'id' | 'createdAt'>>
): CustomDeck[] {
  const current = getCustomDecks();
  const updated = current.map((d) => (d.id === deckId ? { ...d, ...updates } : d));
  saveCustomDecks(updated);
  return updated;
}

export function deleteCustomDeck(deckId: string): { decks: CustomDeck[]; words: VocabularyWord[] } {
  const currentDecks = getCustomDecks();
  const updatedDecks = currentDecks.filter((d) => d.id !== deckId);
  saveCustomDecks(updatedDecks);

  // Also remove words associated with this deck
  const currentWords = getCustomVocab();
  const updatedWords = currentWords.filter((w) => w.collectionId !== deckId);
  saveCustomVocab(updatedWords);

  return { decks: updatedDecks, words: updatedWords };
}

// Custom Imported Vocabulary
export function getCustomVocab(): VocabularyWord[] {
  if (typeof window === 'undefined') return DEFAULT_STARTER_CUSTOM_WORDS;
  try {
    const raw = localStorage.getItem(CUSTOM_VOCAB_KEY);
    if (raw === null) {
      localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(DEFAULT_STARTER_CUSTOM_WORDS));
      return DEFAULT_STARTER_CUSTOM_WORDS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STARTER_CUSTOM_WORDS;
  }
}

export function saveCustomVocab(words: VocabularyWord[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(words));
}

export function addCustomVocabWords(newWords: VocabularyWord[]): VocabularyWord[] {
  const current = getCustomVocab();
  // Duplicate check on normalized lemma
  const existingLemmas = new Set(
    [...VOCABULARY_WORDS, ...current].map((w) => w.lemma.toLowerCase().trim())
  );

  const defaultDeckId = getCustomDecks()[0]?.id || 'cdeck-academic';

  const normalizedNewWords = newWords.map((w) => ({
    ...w,
    collectionId: w.collectionId && w.collectionId !== 'custom' ? w.collectionId : defaultDeckId,
  }));

  const filtered = normalizedNewWords.filter((w) => !existingLemmas.has(w.lemma.toLowerCase().trim()));
  const updated = [...current, ...filtered];

  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_VOCAB_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteCustomWord(wordId: string): VocabularyWord[] {
  const current = getCustomVocab();
  const updated = current.filter((w) => w.id !== wordId);
  saveCustomVocab(updated);
  return updated;
}

export function addSingleCustomWord(data: {
  lemma: string;
  ipa?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  partOfSpeech?: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'idiom';
  definition?: string;
  viDefinition: string;
  exampleEn?: string;
  exampleVi?: string;
  collocation?: string;
  collectionId?: string;
}): VocabularyWord[] {
  const defaultDeckId = getCustomDecks()[0]?.id || 'cdeck-academic';
  const wordId = `custom-w-${Date.now()}`;
  const newWord: VocabularyWord = {
    id: wordId,
    lemma: data.lemma.trim(),
    ipa: data.ipa?.trim() || `/${data.lemma.trim().toLowerCase()}/`,
    level: data.level || 'B1',
    collectionId: data.collectionId || defaultDeckId,
    senses: [
      {
        id: `s-${wordId}`,
        partOfSpeech: data.partOfSpeech || 'noun',
        definition: data.definition?.trim() || data.viDefinition.trim(),
        viDefinition: data.viDefinition.trim(),
        examples: data.exampleEn
          ? [{ en: data.exampleEn.trim(), vi: data.exampleVi?.trim() || '' }]
          : [],
      },
    ],
    collocations: data.collocation
      ? data.collocation.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
    isMastered: false,
    isBookmarked: false,
  };

  return addCustomVocabWords([newWord]);
}

// Spaced Repetition System (SRS) Storage
export interface WordSRSData {
  wordId: string;
  level: number; // 1 - 5
  nextReviewAt: string;
  lastReviewedAt: string;
  reviewCount: number;
}

const SRS_STORAGE_KEY = 'elp_srs_state';
const DAILY_GOAL_KEY = 'elp_daily_goal';

const SRS_INTERVALS_MS = {
  1: 10 * 60 * 1000, // 10 minutes
  2: 24 * 60 * 60 * 1000, // 24 hours
  3: 3 * 24 * 60 * 60 * 1000, // 3 days
  4: 7 * 24 * 60 * 60 * 1000, // 7 days
  5: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export function getSRSMap(): Record<string, WordSRSData> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    
    // Seed default SRS distribution for initial state
    const initial: Record<string, WordSRSData> = {};
    const now = Date.now();
    VOCABULARY_WORDS.forEach((word, idx) => {
      // Level 1: 0, Level 2: 1-2, Level 3: 3-5, Level 4: 6-8, Level 5: 9+
      let level = 1;
      if (idx === 1 || idx === 2) level = 2;
      else if (idx >= 3 && idx <= 5) level = 3;
      else if (idx >= 6 && idx <= 8) level = 4;
      else if (idx >= 9) level = 5;

      const interval = SRS_INTERVALS_MS[level as keyof typeof SRS_INTERVALS_MS];
      initial[word.id] = {
        wordId: word.id,
        level,
        nextReviewAt: new Date(now + interval).toISOString(),
        lastReviewedAt: new Date(now - 3600000).toISOString(),
        reviewCount: level,
      };
    });
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    return {};
  }
}

export function updateWordSRS(wordId: string, isCorrect: boolean): WordSRSData {
  const map = getSRSMap();
  const current = map[wordId] || {
    wordId,
    level: 1,
    nextReviewAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString(),
    reviewCount: 0,
  };

  let newLevel = current.level;
  if (isCorrect) {
    newLevel = Math.min(5, current.level + 1);
  } else {
    newLevel = 1; // Drop back to level 1 for review
  }

  const interval = SRS_INTERVALS_MS[newLevel as keyof typeof SRS_INTERVALS_MS];
  const updated: WordSRSData = {
    wordId,
    level: newLevel,
    nextReviewAt: new Date(Date.now() + interval).toISOString(),
    lastReviewedAt: new Date().toISOString(),
    reviewCount: current.reviewCount + 1,
  };

  map[wordId] = updated;
  if (typeof window !== 'undefined') {
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(map));
  }
  return updated;
}

export function getDailyGoal(): number {
  if (typeof window === 'undefined') return 10;
  try {
    const raw = localStorage.getItem(DAILY_GOAL_KEY);
    return raw ? parseInt(raw, 10) : 10;
  } catch {
    return 10;
  }
}

export function setDailyGoal(goal: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DAILY_GOAL_KEY, goal.toString());
  }
}

// Vocab Practice History ("Lịch sử đấu")
export interface VocabHistoryItem {
  id: string;
  mode: string;
  modeName: string;
  totalWords: number;
  correctCount: number;
  xpEarned: number;
  timestamp: string;
}

const VOCAB_HISTORY_KEY = 'elp_vocab_history';

export function getVocabHistory(): VocabHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOCAB_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addVocabHistoryItem(item: Omit<VocabHistoryItem, 'id' | 'timestamp'>): VocabHistoryItem {
  const current = getVocabHistory();
  const newItem: VocabHistoryItem = {
    ...item,
    id: `vh-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newItem, ...current].slice(0, 20); // Keep latest 20 items
  if (typeof window !== 'undefined') {
    localStorage.setItem(VOCAB_HISTORY_KEY, JSON.stringify(updated));
  }
  return newItem;
}

