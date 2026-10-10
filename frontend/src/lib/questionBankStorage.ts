'use client';

import { BankQuestion, QuestionUsageTag, CefrLevel, QuestionDifficulty } from '@/types/grammarSystem';

const BANK_STORAGE_KEY = 'elp_grammar_question_bank_v2';

/**
 * Normalizes prompt text to detect duplicates reliably:
 * - Lowercases text
 * - Strips punctuation marks (?, !, ., ,, _, -, ", ')
 * - Collapses consecutive spaces
 */
export function computeNormalizedHash(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[?!.,_"'`~;:()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Seed questions representing a rich shared question bank
export const INITIAL_QUESTION_BANK: BankQuestion[] = [
  {
    id: 'qb-ps-1',
    prompt: 'Water ________ at 100 degrees Celsius under standard atmospheric pressure.',
    options: ['boil', 'boils', 'is boiling', 'has boiled'],
    correctAnswer: 1,
    explanation: 'Diễn tả chân lý khoa học, sự thật hiển nhiên luôn dùng thì Hiện tại đơn (boils).',
    topicId: 'topic-1-tenses',
    lessonId: 'ps-1-present-simple',
    difficulty: 'easy',
    cefr: 'A1',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('Water boils at 100 degrees Celsius under standard atmospheric pressure.'),
  },
  {
    id: 'qb-ps-2',
    prompt: 'She ________ to the gym on weekdays because she prefers exercising outdoors.',
    options: ["doesn't go", "don't go", "isn't go", "not goes"],
    correctAnswer: 0,
    explanation: 'Chủ ngữ ngôi thứ 3 số ít "She" đi với trợ động từ phủ định "doesn\'t" và V nguyên mẫu.',
    topicId: 'topic-1-tenses',
    lessonId: 'ps-1-present-simple',
    difficulty: 'easy',
    cefr: 'A1',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam'],
    normalizedHash: computeNormalizedHash("She doesn't go to the gym on weekdays because she prefers exercising outdoors."),
  },
  {
    id: 'qb-pc-1',
    prompt: 'Listen! Someone ________ to break into the administrative office.',
    options: ['tries', 'is trying', 'tried', 'has tried'],
    correctAnswer: 1,
    explanation: 'Có mệnh lệnh thức "Listen!" báo hiệu hành động đang diễn ra tại thời điểm nói -> Hiện tại tiếp diễn (is trying).',
    topicId: 'topic-1-tenses',
    lessonId: 'ps-2-present-continuous',
    difficulty: 'easy',
    cefr: 'A2',
    usageTags: ['lesson_exercise', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('Listen! Someone is trying to break into the administrative office.'),
  },
  {
    id: 'qb-perf-1',
    prompt: 'The research team ________ three crucial trials since the new project began.',
    options: ['conducted', 'has conducted', 'have conducted', 'is conducting'],
    correctAnswer: 1,
    explanation: 'Cụm "since..." kết hợp chủ ngữ số ít "The research team" -> Hiện tại hoàn thành "has conducted".',
    topicId: 'topic-1-tenses',
    lessonId: 'ps-3-present-perfect',
    difficulty: 'medium',
    cefr: 'B1',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('The research team has conducted three crucial trials since the new project began.'),
  },
  {
    id: 'qb-inf-1',
    prompt: 'The board of directors agreed ________ the budget for AI training programs.',
    options: ['to increase', 'increasing', 'increase', 'increased'],
    correctAnswer: 0,
    explanation: 'Động từ "agree" bắt buộc đi kèm "to-infinitive" (agree to do something).',
    topicId: 'topic-2-infinitives',
    lessonId: 'inf-1-to-infinitive',
    difficulty: 'easy',
    cefr: 'A2',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('The board of directors agreed to increase the budget for AI training programs.'),
  },
  {
    id: 'qb-inf-2',
    prompt: 'Our team leader made everyone ________ overtime to meet the client launch deadline.',
    options: ['work', 'to work', 'working', 'worked'],
    correctAnswer: 0,
    explanation: 'Cấu trúc sai khiến chủ động: make someone + V(bare infinitive) - không có to.',
    topicId: 'topic-2-infinitives',
    lessonId: 'inf-2-bare-infinitive',
    difficulty: 'medium',
    cefr: 'B1',
    usageTags: ['lesson_exercise', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('Our team leader made everyone work overtime to meet the client launch deadline.'),
  },
  {
    id: 'qb-pas-1',
    prompt: 'The newly constructed suspension bridge ________ by international engineers last week.',
    options: ['inspected', 'was inspected', 'is inspected', 'were inspected'],
    correctAnswer: 1,
    explanation: 'Chủ ngữ chịu tác động (cầu được kiểm tra) kèm mốc thời gian "last week" -> Quá khứ đơn bị động: was inspected.',
    topicId: 'topic-4-passive',
    lessonId: 'pas-1-passive-basic',
    difficulty: 'medium',
    cefr: 'B1',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('The newly constructed suspension bridge was inspected by international engineers last week.'),
  },
  {
    id: 'qb-cond-1',
    prompt: 'If our company ________ more capital into automation last year, we would be leading the market today.',
    options: ['invested', 'had invested', 'invests', 'would invest'],
    correctAnswer: 1,
    explanation: 'Câu điều kiện hỗn hợp: Giả định quá khứ (last year) dùng had + V3 dẫn đến kết quả ở hiện tại (today: would be).',
    topicId: 'topic-5-conditionals',
    lessonId: 'cond-3-mixed',
    difficulty: 'hard',
    cefr: 'B2',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('If our company had invested more capital into automation last year we would be leading the market today.'),
  },
  {
    id: 'qb-rel-1',
    prompt: 'Dr. Nguyen, ________ pioneering research won the global award, delivered the keynote address.',
    options: ['who', 'whom', 'whose', 'that'],
    correctAnswer: 2,
    explanation: 'Đại từ quan hệ chỉ sự sở hữu trước danh từ "pioneering research" -> dùng "whose".',
    topicId: 'topic-6-relative',
    lessonId: 'rel-1-relative-pronouns',
    difficulty: 'medium',
    cefr: 'B2',
    usageTags: ['lesson_exercise', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('Dr Nguyen whose pioneering research won the global award delivered the keynote address.'),
  },
  {
    id: 'qb-inv-1',
    prompt: 'Seldom ________ such an exceptional combination of creativity and analytical precision.',
    options: ['we have seen', 'have we seen', 'we saw', 'did we saw'],
    correctAnswer: 1,
    explanation: 'Đảo ngữ với trạng từ phủ định "Seldom" đứng đầu câu: đảo trợ động từ "have" lên trước chủ ngữ "we".',
    topicId: 'topic-15-inversion',
    lessonId: 'inv-1-negative-inversion',
    difficulty: 'hard',
    cefr: 'C1',
    usageTags: ['lesson_exercise', 'lesson_exam', 'topic_exam', 'course_exam'],
    normalizedHash: computeNormalizedHash('Seldom have we seen such an exceptional combination of creativity and analytical precision.'),
  },
];

/**
 * Get all questions currently in the central Question Bank
 */
export function getQuestionBank(): BankQuestion[] {
  if (typeof window === 'undefined') return INITIAL_QUESTION_BANK;
  try {
    const raw = localStorage.getItem(BANK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(INITIAL_QUESTION_BANK));
      return INITIAL_QUESTION_BANK;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading Question Bank:', err);
    return INITIAL_QUESTION_BANK;
  }
}

/**
 * Save bank questions to storage
 */
function saveQuestionBank(questions: BankQuestion[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Error saving Question Bank:', err);
  }
}

/**
 * Check if a question already exists based on normalized prompt
 */
export function findDuplicateInBank(prompt: string, bank?: BankQuestion[]): BankQuestion | undefined {
  const currentBank = bank || getQuestionBank();
  const hash = computeNormalizedHash(prompt);
  return currentBank.find((q) => q.normalizedHash === hash);
}

/**
 * Add a single question to the Question Bank with deduplication enforcement.
 * If already exists: returns the existing question (with updated usage tags) instead of creating duplicate.
 */
export function addQuestionToBank(
  questionData: Omit<BankQuestion, 'id' | 'normalizedHash'> & { id?: string }
): { question: BankQuestion; isDuplicate: boolean } {
  const bank = getQuestionBank();
  const hash = computeNormalizedHash(questionData.prompt);
  const existing = bank.find((q) => q.normalizedHash === hash);

  if (existing) {
    // Merge usage tags to prevent duplicates while expanding reuse
    const mergedTags = Array.from(new Set([...existing.usageTags, ...(questionData.usageTags || [])]));
    const updatedExisting: BankQuestion = {
      ...existing,
      usageTags: mergedTags as QuestionUsageTag[],
    };
    const updatedBank = bank.map((q) => (q.id === existing.id ? updatedExisting : q));
    saveQuestionBank(updatedBank);
    return { question: updatedExisting, isDuplicate: true };
  }

  // Create new question
  const newQuestion: BankQuestion = {
    ...questionData,
    id: questionData.id || `qb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    normalizedHash: hash,
    createdAt: new Date().toISOString(),
  };

  const updatedBank = [newQuestion, ...bank];
  saveQuestionBank(updatedBank);
  return { question: newQuestion, isDuplicate: false };
}

/**
 * Bulk add questions with deduplication
 */
export function addQuestionsBulkToBank(
  questions: (Omit<BankQuestion, 'id' | 'normalizedHash'> & { id?: string })[]
): { addedCount: number; reusedCount: number; resultQuestions: BankQuestion[] } {
  const bank = getQuestionBank();
  let addedCount = 0;
  let reusedCount = 0;
  const resultQuestions: BankQuestion[] = [];
  let currentBank = [...bank];

  for (const q of questions) {
    const hash = computeNormalizedHash(q.prompt);
    const existing = currentBank.find((item) => item.normalizedHash === hash);

    if (existing) {
      reusedCount++;
      const mergedTags = Array.from(new Set([...existing.usageTags, ...(q.usageTags || [])])) as QuestionUsageTag[];
      existing.usageTags = mergedTags;
      resultQuestions.push(existing);
    } else {
      addedCount++;
      const newQuestion: BankQuestion = {
        ...q,
        id: q.id || `qb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        normalizedHash: hash,
        createdAt: new Date().toISOString(),
      };
      currentBank = [newQuestion, ...currentBank];
      resultQuestions.push(newQuestion);
    }
  }

  saveQuestionBank(currentBank);
  return { addedCount, reusedCount, resultQuestions };
}

/**
 * Filter questions for a specific Lesson
 */
export function getQuestionsForLesson(topicId: string, lessonId?: string): BankQuestion[] {
  const bank = getQuestionBank();
  return bank.filter((q) => {
    if (lessonId && q.lessonId === lessonId) return true;
    return q.topicId === topicId;
  });
}

/**
 * Filter questions for a Topic Exam (shuffles and selects up to limit)
 */
export function getQuestionsForTopic(topicId: string, limit = 10): BankQuestion[] {
  const bank = getQuestionBank();
  const filtered = bank.filter((q) => q.topicId === topicId);
  return shuffleArray(filtered).slice(0, limit);
}

/**
 * Filter questions for Multi-topic Exam
 */
export function getQuestionsForMultiTopics(topicIds: string[], limit = 20): BankQuestion[] {
  const bank = getQuestionBank();
  const filtered = bank.filter((q) => topicIds.includes(q.topicId));
  return shuffleArray(filtered).slice(0, limit);
}

/**
 * Filter questions for Full Course Exam (covers questions across all topics)
 */
export function getQuestionsForCourse(limit = 25): BankQuestion[] {
  const bank = getQuestionBank();
  return shuffleArray(bank).slice(0, limit);
}

/**
 * Delete a question from the bank
 */
export function deleteQuestionFromBank(id: string): BankQuestion[] {
  const bank = getQuestionBank();
  const updated = bank.filter((q) => q.id !== id);
  saveQuestionBank(updated);
  return updated;
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
