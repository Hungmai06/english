'use client';

import { VocabularyWord, Question, VocabularyCollection } from '@/types';
import { VOCABULARY_WORDS, PRACTICE_QUESTIONS, VOCABULARY_COLLECTIONS } from './data/mockData';
import { GRAMMAR_21_TOPICS, GrammarTopic21 } from './data/grammar21Data';

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  level: number;
  streakDays: number;
  totalXP: number; // represents Coins
  status: 'ACTIVE' | 'BANNED' | 'PENDING';
  createdAt: string;
}

export interface AdminActivityLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  target: string;
  detail: string;
  timestamp: string;
  performedBy: string;
}

export interface LessonFormulaItem {
  type: string;
  pattern: string;
  note: string;
}

export interface LessonUsageItem {
  title: string;
  detail?: string;
  signals?: string[];
}

export interface LessonPitfallItem {
  wrong: string;
  correct: string;
  explanation: string;
}

export interface LessonTheorySection {
  overview: string;
  diagramRoot?: string;
  formulas: LessonFormulaItem[];
  usages: LessonUsageItem[];
  notes?: string[];
  pitfalls: LessonPitfallItem[];
}

export interface LessonExampleItem {
  id: string;
  en: string;
  vi: string;
  context?: string;
  breakdown?: {
    subject: string;
    verb: string;
    objectAndOthers: string;
  };
}

export interface LessonExerciseItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  hint?: string;
}

export interface LessonExamConfig {
  durationMinutes: number;
  totalQuestions?: number;
  passScore: number;
  questions: LessonExerciseItem[];
}

export interface AdminGrammarLessonItem {
  id: string;
  title: string;
  enTitle?: string;
  topicId: string;
  topicTitle: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  readTime: string;
  order: number;
  status: 'PUBLISHED' | 'DRAFT';
  summary?: string;

  // 4 mục học tập theo trang user
  theory: LessonTheorySection;
  examples: LessonExampleItem[];
  exercises: LessonExerciseItem[];
  subExercises?: any[];
  exam: LessonExamConfig;
}

const STORAGE_KEYS = {
  VOCAB: 'elp_admin_vocab_list_v2',
  COLLECTIONS: 'elp_admin_collections_list_v2',
  QUESTIONS: 'elp_admin_questions_list_v2',
  USERS: 'elp_admin_users_list_v2',
  LESSONS: 'elp_admin_lessons_list_v2',
  LOGS: 'elp_admin_activity_logs_v2',
};

// Default seed users
const INITIAL_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'usr-admin-1',
    email: 'admin@linguacore.com',
    displayName: 'Quản Trị Viên Hệ Thống',
    role: 'ADMIN',
    level: 10,
    streakDays: 45,
    totalXP: 9500,
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'usr-teacher-1',
    email: 'teacher.sarah@linguacore.com',
    displayName: 'Giảng viên Sarah Jenkins',
    role: 'TEACHER',
    level: 8,
    streakDays: 28,
    totalXP: 5400,
    status: 'ACTIVE',
    createdAt: '2026-02-01T09:30:00Z',
  },
  {
    id: 'usr-1001',
    email: 'learner@linguacore.com',
    displayName: 'English Learner (Demo)',
    role: 'STUDENT',
    level: 4,
    streakDays: 5,
    totalXP: 1420,
    status: 'ACTIVE',
    createdAt: '2026-03-10T14:20:00Z',
  },
  {
    id: 'usr-1002',
    email: 'minh.tri@gmail.com',
    displayName: 'Trần Minh Trí',
    role: 'STUDENT',
    level: 6,
    streakDays: 22,
    totalXP: 2850,
    status: 'ACTIVE',
    createdAt: '2026-04-12T10:15:00Z',
  },
  {
    id: 'usr-1003',
    email: 'linh.dan@outlook.com',
    displayName: 'Vũ Linh Đan',
    role: 'STUDENT',
    level: 5,
    streakDays: 14,
    totalXP: 1980,
    status: 'ACTIVE',
    createdAt: '2026-05-18T16:45:00Z',
  },
  {
    id: 'usr-1004',
    email: 'hoang.nam@techcorp.vn',
    displayName: 'Nguyễn Hoàng Nam',
    role: 'STUDENT',
    level: 3,
    streakDays: 0,
    totalXP: 720,
    status: 'BANNED',
    createdAt: '2026-06-02T11:00:00Z',
  },
  {
    id: 'usr-1005',
    email: 'ha.my@university.edu.vn',
    displayName: 'Phạm Hà My',
    role: 'STUDENT',
    level: 7,
    streakDays: 31,
    totalXP: 3650,
    status: 'ACTIVE',
    createdAt: '2026-06-20T08:30:00Z',
  },
];

// Template helpers for creating lessons with 4 sections matching the user page
export function createEmptyLessonDraft(order = 1): AdminGrammarLessonItem {
  const now = Date.now();
  return {
    id: `lesson-${now}`,
    title: '',
    enTitle: '',
    topicId: 'custom-topic',
    topicTitle: 'Chuyên Đề Mới',
    level: 'B1',
    readTime: '8 phút',
    order,
    status: 'PUBLISHED',
    summary: '',
    theory: {
      overview: '',
      diagramRoot: '',
      formulas: [
        { type: 'Khẳng định (+)', pattern: '', note: '' },
      ],
      usages: [
        { title: '', detail: '', signals: [] },
      ],
      pitfalls: [
        { wrong: '', correct: '', explanation: '' },
      ],
    },
    examples: [
      {
        id: `ex-${now}-1`,
        en: '',
        vi: '',
        context: '',
        breakdown: { subject: '', verb: '', objectAndOthers: '' },
      },
    ],
    exercises: [
      {
        id: `q-${now}-1`,
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      },
    ],
    exam: {
      durationMinutes: 10,
      passScore: 1,
      questions: [
        {
          id: `exam-${now}-1`,
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          explanation: '',
        },
      ],
    },
  };
}

export function createSampleLessonTemplate(order = 1): AdminGrammarLessonItem {
  const now = Date.now();
  return {
    id: `lesson-${now}`,
    title: 'Câu Gián Tiếp (Reported Speech): Lời kể & Tường thuật',
    enTitle: 'Reported Speech',
    topicId: 'reported-speech',
    topicTitle: 'Câu Gián Tiếp',
    level: 'B1',
    readTime: '8 phút',
    order,
    status: 'PUBLISHED',
    summary: 'Tường thuật lại lời nói của người khác mà không dùng dấu ngoặc kép, cần lùi thì và đổi đại từ.',
    theory: {
      overview: 'Câu gián tiếp (Reported Speech / Indirect Speech) được dùng để thuật lại ý của người nói. Khi động từ tường thuật ở thì quá khứ (said, told), mệnh đề gián tiếp thường phải lùi một thì và thay đổi các đại từ, trạng từ chỉ thời gian/nơi chốn.',
      diagramRoot: 'Câu Gián Tiếp (Reported Speech)',
      formulas: [
        {
          type: 'Câu trần thuật (Statements)',
          pattern: 'S + said (that) + S + V(lùi thì)... / S + told + O + (that)...',
          note: 'Hiện tại đơn -> Quá khứ đơn; Hiện tại tiếp diễn -> Quá khứ tiếp diễn; Will -> Would; Can -> Could.',
        },
        {
          type: 'Câu hỏi Yes/No (Yes/No Questions)',
          pattern: 'S + asked + (O) + if / whether + S + V(lùi thì)',
          note: 'Không đảo trợ động từ lên trước chủ ngữ nữa, câu trở thành trật tự câu khẳng định.',
        },
        {
          type: 'Câu mệnh lệnh (Commands/Requests)',
          pattern: 'S + told/asked + O + to V(inf) / not to V(inf)',
          note: 'Khuyên bảo, yêu cầu ai làm hoặc không làm việc gì.',
        },
      ],
      usages: [
        {
          title: 'Tường thuật lại một cuộc hội thoại trong quá khứ',
          detail: 'Dùng khi kể lại cho người thứ ba nghe những gì ai đó đã nói trước đây.',
          signals: ['said that', 'told me that', 'asked if', 'the day before'],
        },
        {
          title: 'Tường thuật lại chỉ thị hoặc lời đề nghị của cấp trên/giáo viên',
          detail: 'Ví dụ: The manager told us to submit the report before 5 PM.',
          signals: ['asked to', 'ordered to', 'advised to'],
        },
      ],
      pitfalls: [
        {
          wrong: 'He told that he was tired.',
          correct: 'He said that he was tired. / He told me that he was tired.',
          explanation: 'Động từ "tell" bắt buộc phải có tân ngữ chỉ người nghe (tell + someone), còn "say" thì không cần (say that).',
        },
        {
          wrong: 'She asked me where did I live.',
          correct: 'She asked me where I lived.',
          explanation: 'Trong câu hỏi gián tiếp, không dùng trợ động từ "did/do", đưa về trật tự khẳng định S + V.',
        },
      ],
    },
    examples: [
      {
        id: `ex-${now}-1`,
        en: 'He said that he was working on an urgent project.',
        vi: 'Anh ấy nói rằng anh ấy đang làm việc cho một dự án khẩn cấp.',
        context: 'Lùi thì từ Present Continuous sang Past Continuous',
        breakdown: { subject: 'He', verb: 'said', objectAndOthers: 'that he was working on an urgent project' },
      },
      {
        id: `ex-${now}-2`,
        en: 'My manager asked me if I could finish the financial analysis by noon.',
        vi: 'Quản lý của tôi hỏi tôi liệu tôi có thể hoàn thành bản phân tích tài chính trước buổi trưa không.',
        context: 'Câu hỏi Yes/No với "if/whether"',
        breakdown: { subject: 'My manager', verb: 'asked', objectAndOthers: 'me if I could finish the analysis' },
      },
    ],
    exercises: [
      {
        id: `q-${now}-1`,
        question: '“I am leaving for London tomorrow,” John said. -> John said that he ________ for London the next day.',
        options: ['is leaving', 'was leaving', 'left', 'leaves'],
        correctAnswer: 1,
        explanation: 'Động từ "am leaving" (Hiện tại tiếp diễn) phải lùi thì thành "was leaving" (Quá khứ tiếp diễn).',
      },
      {
        id: `q-${now}-2`,
        question: 'She asked him ________ he had seen her keys anywhere.',
        options: ['that', 'if', 'what', 'did'],
        correctAnswer: 1,
        explanation: 'Câu hỏi Yes/No tường thuật dùng từ nối "if" hoặc "whether".',
      },
    ],
    exam: {
      durationMinutes: 10,
      passScore: 1,
      questions: [
        {
          id: `exam-${now}-1`,
          question: 'The teacher told the students ________ quiet during the exam.',
          options: ['be', 'to be', 'being', 'are'],
          correctAnswer: 1,
          explanation: 'Cấu trúc câu mệnh lệnh gián tiếp: tell someone + to V(inf). Đáp án là "to be".',
        },
      ],
    },
  };
}

// 7 seed grammar lessons fully populated with 4 sections
const tPresentSimple = GRAMMAR_21_TOPICS[0];
const tPresentCont = GRAMMAR_21_TOPICS[1];
const tPastSimple = GRAMMAR_21_TOPICS[4];
const tConditionals = GRAMMAR_21_TOPICS[9];
const tPassive = GRAMMAR_21_TOPICS[10];
const tRelative = GRAMMAR_21_TOPICS[12];

const INITIAL_ADMIN_LESSONS: AdminGrammarLessonItem[] = [
  {
    id: 'present-simple-1',
    title: 'Hiện Tại Đơn (Present Simple): Chân lý & Thói quen',
    enTitle: tPresentSimple?.enTitle || 'Present Simple',
    topicId: 'present-simple',
    topicTitle: 'Các Thì Hiện Tại',
    level: 'A1',
    readTime: '6 phút',
    order: 1,
    status: 'PUBLISHED',
    summary: tPresentSimple?.summary || 'Diễn tả thói quen, chân lý khoa học và các sự thật hiển nhiên.',
    theory: tPresentSimple?.theory || createEmptyLessonDraft().theory,
    examples: tPresentSimple?.examples || [],
    exercises: tPresentSimple?.exercises || [],
    subExercises: tPresentSimple?.subExercises || [],
    exam: tPresentSimple?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
  {
    id: 'present-continuous-1',
    title: 'Hiện Tại Tiếp Diễn (Present Continuous): Đang xảy ra',
    enTitle: tPresentCont?.enTitle || 'Present Continuous',
    topicId: 'present-simple',
    topicTitle: 'Các Thì Hiện Tại',
    level: 'A2',
    readTime: '7 phút',
    order: 2,
    status: 'PUBLISHED',
    summary: tPresentCont?.summary || 'Diễn tả hành động đang xảy ra tại thời điểm nói hoặc xu hướng tạm thời.',
    theory: tPresentCont?.theory || createEmptyLessonDraft().theory,
    examples: tPresentCont?.examples || [],
    exercises: tPresentCont?.exercises || [],
    subExercises: tPresentCont?.subExercises || [],
    exam: tPresentCont?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
  {
    id: 'past-simple-1',
    title: 'Quá Khứ Đơn (Past Simple): Sự kiện chấm dứt',
    enTitle: tPastSimple?.enTitle || 'Past Simple',
    topicId: 'past-simple',
    topicTitle: 'Các Thì Quá Khứ',
    level: 'A2',
    readTime: '8 phút',
    order: 1,
    status: 'PUBLISHED',
    summary: tPastSimple?.summary || 'Diễn tả hành động đã xảy ra và kết thúc hoàn toàn trong quá khứ có thời gian xác định.',
    theory: tPastSimple?.theory || createEmptyLessonDraft().theory,
    examples: tPastSimple?.examples || [],
    exercises: tPastSimple?.exercises || [],
    subExercises: tPastSimple?.subExercises || [],
    exam: tPastSimple?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
  {
    id: 'conditionals-1',
    title: 'Câu Điều Kiện Loại 1 & 2: Khả năng & Giả định',
    enTitle: tConditionals?.enTitle || 'Conditionals',
    topicId: 'conditionals',
    topicTitle: 'Câu Điều Kiện',
    level: 'B1',
    readTime: '8 phút',
    order: 1,
    status: 'PUBLISHED',
    summary: tConditionals?.summary || 'Diễn tả điều kiện có thể xảy ra ở hiện tại hoặc giả định trái với thực tế.',
    theory: tConditionals?.theory || createEmptyLessonDraft().theory,
    examples: tConditionals?.examples || [],
    exercises: tConditionals?.exercises || [],
    subExercises: tConditionals?.subExercises || [],
    exam: tConditionals?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
  {
    id: 'mixed-conditionals-1',
    title: 'Câu Điều Kiện Hỗn Hợp (Mixed Conditionals)',
    enTitle: 'Mixed Conditionals',
    topicId: 'conditionals',
    topicTitle: 'Câu Điều Kiện',
    level: 'B2',
    readTime: '10 phút',
    order: 2,
    status: 'PUBLISHED',
    summary: 'Kết hợp mệnh đề If và mệnh đề chính ở các mốc thời gian khác nhau (quá khứ và hiện tại).',
    theory: {
      overview: 'Câu điều kiện hỗn hợp (Mixed Conditionals) dùng khi thời gian ở mệnh đề điều kiện (If-clause) và mệnh đề kết quả (Main clause) không đồng nhất. Phổ biến nhất là: Giả định quá khứ dẫn đến kết quả ở hiện tại (Type 3 + Type 2).',
      diagramRoot: 'Câu Điều Kiện Hỗn Hợp',
      formulas: [
        { type: 'Loại Hỗn Hợp 1 (Quá khứ -> Hiện tại)', pattern: 'If + S + had + V3/ed, S + would + V(inf)', note: 'Nếu quá khứ xảy ra khác đi thì hiện tại kết quả đã khác.' },
        { type: 'Loại Hỗn Hợp 2 (Hiện tại -> Quá khứ)', pattern: 'If + S + V2/ed (were), S + would have + V3/ed', note: 'Bản chất thực tế hiện tại dẫn đến việc quá khứ đã làm khác đi.' },
      ],
      usages: [
        { title: 'Hối tiếc về hành động trong quá khứ ảnh hưởng đến bây giờ', detail: 'Ví dụ nếu tối qua ngủ sớm thì sáng nay đã không mệt mỏi.', signals: ['yesterday', 'now', 'today', 'if only'] },
      ],
      pitfalls: [
        { wrong: 'If I had taken the job last year, I would have been rich now.', correct: 'If I had taken the job last year, I would be rich now.', explanation: 'Kết quả có từ "now" (hiện tại) nên dùng would + V(inf), không dùng would have + V3.' },
      ],
    },
    examples: [
      { id: 'ex-mc-1', en: 'If I had gone to bed earlier last night, I wouldn\'t feel so exhausted right now.', vi: 'Nếu tối qua tôi đi ngủ sớm hơn thì bây giờ tôi đã không kiệt sức thế này.', context: 'Quá khứ ảnh hưởng tới hiện tại', breakdown: { subject: 'I', verb: 'wouldn\'t feel', objectAndOthers: 'so exhausted right now' } },
      { id: 'ex-mc-2', en: 'If she were a fluent French speaker, she would have gotten the Paris transfer last month.', vi: 'Nếu cô ấy nói tiếng Pháp lưu loát, cô ấy đã được chuyển công tác đến Paris vào tháng trước.', context: 'Năng lực hiện tại ảnh hưởng quá khứ', breakdown: { subject: 'she', verb: 'would have gotten', objectAndOthers: 'the Paris transfer last month' } },
    ],
    exercises: [
      { id: 'q-mc-1', question: 'If she ________ the medicine yesterday, she would feel much better today.', options: ['took', 'had taken', 'takes', 'has taken'], correctAnswer: 1, explanation: 'Hành động xảy ra trong quá khứ ("yesterday") giả định lùi về thì quá khứ hoàn thành "had taken".' },
      { id: 'q-mc-2', question: 'If he weren\'t so afraid of flying, he ________ us to Tokyo last summer.', options: ['would accompany', 'would have accompanied', 'will accompany', 'had accompanied'], correctAnswer: 1, explanation: 'Giả định bản chất hiện tại (sợ máy bay) ảnh hưởng đến chuyến đi mùa hè trước (quá khứ) -> dùng would have + V3.' },
    ],
    exam: {
      durationMinutes: 10,
      passScore: 1,
      questions: [
        { id: 'exam-mc-1', question: 'If you had listened to my advice, you ________ in this difficult situation now.', options: ['wouldn\'t be', 'wouldn\'t have been', 'won\'t be', 'weren\'t'], correctAnswer: 0, explanation: 'Có trạng từ "now" ở vế kết quả nên dùng would + V(inf).' },
      ],
    },
  },
  {
    id: 'passive-voice-1',
    title: 'Thể Bị Động (Passive Voice): Nhấn mạnh đối tượng',
    enTitle: tPassive?.enTitle || 'Passive Voice',
    topicId: 'passive-voice',
    topicTitle: 'Thể Bị Động',
    level: 'B1',
    readTime: '9 phút',
    order: 1,
    status: 'DRAFT',
    summary: tPassive?.summary || 'Nhấn mạnh vào đối tượng chịu tác động của hành động thay vì người thực hiện.',
    theory: tPassive?.theory || createEmptyLessonDraft().theory,
    examples: tPassive?.examples || [],
    exercises: tPassive?.exercises || [],
    subExercises: tPassive?.subExercises || [],
    exam: tPassive?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
  {
    id: 'relative-clauses-1',
    title: 'Mệnh Đề Quan Hệ Xác Định & Không Xác Định',
    enTitle: tRelative?.enTitle || 'Relative Clauses',
    topicId: 'relative-clauses',
    topicTitle: 'Mệnh Đề Quan Hệ',
    level: 'B2',
    readTime: '11 phút',
    order: 1,
    status: 'PUBLISHED',
    summary: tRelative?.summary || 'Bổ nghĩa cho danh từ đứng trước bằng các đại từ quan hệ Who, Whom, Which, That, Whose.',
    theory: tRelative?.theory || createEmptyLessonDraft().theory,
    examples: tRelative?.examples || [],
    exercises: tRelative?.exercises || [],
    subExercises: tRelative?.subExercises || [],
    exam: tRelative?.exam || { durationMinutes: 10, passScore: 1, questions: [] },
  },
];

// Helper to safe parse
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// ==========================================
// 1. ACTIVITY LOGS
// ==========================================
export function getAdminActivityLogs(): AdminActivityLog[] {
  return getFromStorage<AdminActivityLog[]>(STORAGE_KEYS.LOGS, [
    {
      id: 'log-1',
      action: 'UPDATE',
      target: 'Từ vựng',
      detail: 'Cập nhật phiên âm IPA từ "meticulous"',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      performedBy: 'admin@linguacore.com',
    },
    {
      id: 'log-2',
      action: 'CREATE',
      target: 'Câu hỏi',
      detail: 'Thêm mới câu hỏi trắc nghiệm TOEIC Part 5 #q-toeic-2',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      performedBy: 'teacher.sarah@linguacore.com',
    },
    {
      id: 'log-3',
      action: 'STATUS_CHANGE',
      target: 'Học viên',
      detail: 'Khóa tạm thời tài khoản nguyen.nam@techcorp.vn',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      performedBy: 'admin@linguacore.com',
    },
  ]);
}

export function logAdminAction(
  action: AdminActivityLog['action'],
  target: string,
  detail: string
): void {
  const current = getAdminActivityLogs();
  const newLog: AdminActivityLog = {
    id: `log-${Date.now()}`,
    action,
    target,
    detail,
    timestamp: new Date().toISOString(),
    performedBy: 'admin@linguacore.com',
  };
  setToStorage(STORAGE_KEYS.LOGS, [newLog, ...current].slice(0, 50));
}

// ==========================================
// 2. VOCABULARY CRUD
// ==========================================
export function getAdminVocabWords(): VocabularyWord[] {
  return getFromStorage<VocabularyWord[]>(STORAGE_KEYS.VOCAB, VOCABULARY_WORDS);
}

export function saveAdminVocabWord(word: VocabularyWord): VocabularyWord[] {
  const words = getAdminVocabWords();
  const existingIndex = words.findIndex((w) => w.id === word.id);
  let updated: VocabularyWord[];

  if (existingIndex >= 0) {
    updated = [...words];
    updated[existingIndex] = word;
    logAdminAction('UPDATE', 'Từ vựng', `Đã cập nhật từ vựng "${word.lemma}" (${word.level})`);
  } else {
    updated = [word, ...words];
    logAdminAction('CREATE', 'Từ vựng', `Đã thêm từ vựng mới "${word.lemma}" (${word.level})`);
  }

  setToStorage(STORAGE_KEYS.VOCAB, updated);
  return updated;
}

export function saveAdminVocabWordsBulk(newWords: VocabularyWord[]): VocabularyWord[] {
  const words = getAdminVocabWords();
  const updated = [...newWords, ...words];
  setToStorage(STORAGE_KEYS.VOCAB, updated);
  logAdminAction('CREATE', 'Từ vựng', `Đã thêm hàng loạt ${newWords.length} từ vựng mới vào kho`);
  return updated;
}

export function deleteAdminVocabWord(id: string): VocabularyWord[] {
  const words = getAdminVocabWords();
  const target = words.find((w) => w.id === id);
  const updated = words.filter((w) => w.id !== id);
  setToStorage(STORAGE_KEYS.VOCAB, updated);
  logAdminAction('DELETE', 'Từ vựng', `Đã xóa từ vựng "${target?.lemma || id}"`);
  return updated;
}

// ==========================================
// 2B. VOCABULARY COLLECTIONS CRUD
// ==========================================
export function getAdminCollections(): VocabularyCollection[] {
  return getFromStorage<VocabularyCollection[]>(STORAGE_KEYS.COLLECTIONS, VOCABULARY_COLLECTIONS);
}

export function saveAdminCollection(collection: VocabularyCollection): VocabularyCollection[] {
  const collections = getAdminCollections();
  const existingIdx = collections.findIndex((c) => c.id === collection.id);
  let updated: VocabularyCollection[];
  if (existingIdx >= 0) {
    updated = [...collections];
    updated[existingIdx] = collection;
    logAdminAction('UPDATE', 'Bộ từ vựng', `Cập nhật thông tin bộ từ "${collection.title}"`);
  } else {
    updated = [collection, ...collections];
    logAdminAction('CREATE', 'Bộ từ vựng', `Đã tạo bộ sưu tập từ vựng mới "${collection.title}"`);
  }
  setToStorage(STORAGE_KEYS.COLLECTIONS, updated);
  return updated;
}

// ==========================================
// 3. QUESTIONS CRUD
// ==========================================
export function getAdminQuestions(): Question[] {
  return getFromStorage<Question[]>(STORAGE_KEYS.QUESTIONS, PRACTICE_QUESTIONS);
}

export function saveAdminQuestion(question: Question): Question[] {
  const questions = getAdminQuestions();
  const existingIndex = questions.findIndex((q) => q.id === question.id);
  let updated: Question[];

  if (existingIndex >= 0) {
    updated = [...questions];
    updated[existingIndex] = question;
    logAdminAction('UPDATE', 'Câu hỏi', `Đã cập nhật câu hỏi #${question.id} (${question.moduleId})`);
  } else {
    updated = [question, ...questions];
    logAdminAction('CREATE', 'Câu hỏi', `Đã thêm câu hỏi mới #${question.id} (${question.moduleId})`);
  }

  setToStorage(STORAGE_KEYS.QUESTIONS, updated);
  return updated;
}

export function deleteAdminQuestion(id: string): Question[] {
  const questions = getAdminQuestions();
  const target = questions.find((q) => q.id === id);
  const updated = questions.filter((q) => q.id !== id);
  setToStorage(STORAGE_KEYS.QUESTIONS, updated);
  logAdminAction('DELETE', 'Câu hỏi', `Đã xóa câu hỏi #${id} (${target?.moduleId || ''})`);
  return updated;
}

// ==========================================
// 4. USERS CRUD
// ==========================================
export function getAdminUsers(): AdminUserItem[] {
  return getFromStorage<AdminUserItem[]>(STORAGE_KEYS.USERS, INITIAL_ADMIN_USERS);
}

export function saveAdminUser(user: AdminUserItem): AdminUserItem[] {
  const users = getAdminUsers();
  const existingIndex = users.findIndex((u) => u.id === user.id);
  let updated: AdminUserItem[];

  if (existingIndex >= 0) {
    updated = [...users];
    updated[existingIndex] = user;
    logAdminAction('UPDATE', 'Người dùng', `Cập nhật thông tin tài khoản ${user.email} (${user.role})`);
  } else {
    updated = [user, ...users];
    logAdminAction('CREATE', 'Người dùng', `Tạo tài khoản mới ${user.email} với vai trò ${user.role}`);
  }

  setToStorage(STORAGE_KEYS.USERS, updated);
  return updated;
}

export function deleteAdminUser(id: string): AdminUserItem[] {
  const users = getAdminUsers();
  const target = users.find((u) => u.id === id);
  const updated = users.filter((u) => u.id !== id);
  setToStorage(STORAGE_KEYS.USERS, updated);
  logAdminAction('DELETE', 'Người dùng', `Đã xóa tài khoản ${target?.email || id}`);
  return updated;
}

export function toggleAdminUserStatus(id: string): AdminUserItem[] {
  const users = getAdminUsers();
  const updated = users.map((u) => {
    if (u.id === id) {
      const nextStatus: AdminUserItem['status'] = u.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
      logAdminAction('STATUS_CHANGE', 'Người dùng', `Đổi trạng thái tài khoản ${u.email} sang ${nextStatus}`);
      return { ...u, status: nextStatus };
    }
    return u;
  });
  setToStorage(STORAGE_KEYS.USERS, updated);
  return updated;
}

// ==========================================
// 5. GRAMMAR LESSONS CRUD (4 SECTIONS STANDARD)
// ==========================================

export function hydrateLessonItem(item: any): AdminGrammarLessonItem {
  if (!item) return createEmptyLessonDraft();

  // If already fully has 4 sections
  const hasTheory = item.theory && Array.isArray(item.theory.formulas);
  const hasExamples = Array.isArray(item.examples) && item.examples.length > 0;
  const hasExercises = Array.isArray(item.exercises) && item.exercises.length > 0;
  const hasExam = item.exam && Array.isArray(item.exam.questions) && item.exam.questions.length > 0;

  if (hasTheory && hasExamples && hasExercises && hasExam) {
    return {
      ...item,
      enTitle: item.enTitle || item.title,
      summary: item.summary || item.title,
      theory: {
        overview: item.theory.overview || '',
        diagramRoot: item.theory.diagramRoot || item.title,
        formulas: item.theory.formulas || [],
        usages: item.theory.usages || [],
        notes: item.theory.notes || [],
        pitfalls: item.theory.pitfalls || [],
      },
      examples: item.examples || [],
      exercises: item.exercises || [],
      subExercises: item.subExercises || [],
      exam: {
        durationMinutes: item.exam.durationMinutes || 10,
        passScore: item.exam.passScore || 1,
        questions: item.exam.questions || [],
      },
    };
  }

  // Look for match in seed INITIAL_ADMIN_LESSONS
  const match = INITIAL_ADMIN_LESSONS.find(
    (init) => init.id === item.id || init.topicId === item.topicId
  );
  if (match) {
    return {
      ...match,
      ...item,
      theory: item.theory && item.theory.formulas ? item.theory : match.theory,
      examples: item.examples && item.examples.length ? item.examples : match.examples,
      exercises: item.exercises && item.exercises.length ? item.exercises : match.exercises,
      subExercises: item.subExercises || match.subExercises,
      exam: item.exam && item.exam.questions ? item.exam : match.exam,
    };
  }

  // Fallback to sample template
  const sample = createSampleLessonTemplate(item.order || 1);
  return {
    ...sample,
    ...item,
    theory: item.theory || sample.theory,
    examples: item.examples || sample.examples,
    exercises: item.exercises || sample.exercises,
    exam: item.exam || sample.exam,
  };
}

export function getAdminLessons(): AdminGrammarLessonItem[] {
  const raw = getFromStorage<any[]>(STORAGE_KEYS.LESSONS, INITIAL_ADMIN_LESSONS);
  return raw.map((l) => hydrateLessonItem(l));
}

export function saveAdminLesson(lesson: AdminGrammarLessonItem): AdminGrammarLessonItem[] {
  const lessons = getAdminLessons();
  const existingIndex = lessons.findIndex((l) => l.id === lesson.id);
  let updated: AdminGrammarLessonItem[];

  if (existingIndex >= 0) {
    updated = [...lessons];
    updated[existingIndex] = lesson;
    logAdminAction('UPDATE', 'Bài học', `Đã cập nhật bài học 4 mục "${lesson.title}"`);
  } else {
    updated = [lesson, ...lessons];
    logAdminAction('CREATE', 'Bài học', `Đã tạo bài học 4 mục mới "${lesson.title}"`);
  }

  setToStorage(STORAGE_KEYS.LESSONS, updated);
  return updated;
}

export function deleteAdminLesson(id: string): AdminGrammarLessonItem[] {
  const lessons = getAdminLessons();
  const target = lessons.find((l) => l.id === id);
  const updated = lessons.filter((l) => l.id !== id);
  setToStorage(STORAGE_KEYS.LESSONS, updated);
  logAdminAction('DELETE', 'Bài học', `Đã xóa bài học "${target?.title || id}"`);
  return updated;
}

// Convert & merge admin lessons into GrammarTopic21 for the learner page (/learn/grammar)
export function getCombinedGrammarTopics(): GrammarTopic21[] {
  if (typeof window === 'undefined') return GRAMMAR_21_TOPICS;
  try {
    const adminLessons = getAdminLessons();
    const published = adminLessons.filter((l) => l.status === 'PUBLISHED');

    const result: GrammarTopic21[] = [...GRAMMAR_21_TOPICS];

    published.forEach((lesson) => {
      const matchIndex = result.findIndex(
        (t) => t.id === lesson.id || t.slug === lesson.topicId || t.id === lesson.topicId
      );

      const convertedTopic: GrammarTopic21 = {
        id: lesson.id,
        number: lesson.order || (result.length + 1),
        title: lesson.title,
        enTitle: lesson.enTitle || lesson.title,
        slug: lesson.topicId || `topic-${lesson.id}`,
        summary: lesson.summary || lesson.title,
        level:
          lesson.level === 'A1' || lesson.level === 'A2'
            ? 'Beginner'
            : lesson.level === 'B1' || lesson.level === 'B2'
            ? 'Intermediate'
            : 'Advanced',
        difficulty:
          lesson.level === 'A1' || lesson.level === 'A2'
            ? 'A1-A2'
            : lesson.level === 'B1' || lesson.level === 'B2'
            ? 'B1-B2'
            : 'C1',
        estimatedMinutes: parseInt(lesson.readTime) || 15,
        completedPercent: 0,
        theory: {
          overview: lesson.theory.overview,
          diagramRoot: lesson.theory.diagramRoot,
          formulas: lesson.theory.formulas,
          usages: lesson.theory.usages,
          notes: lesson.theory.notes || [],
          pitfalls: lesson.theory.pitfalls,
        },
        examples: lesson.examples as any,
        exercises: lesson.exercises,
        subExercises: lesson.subExercises,
        exam: {
          durationMinutes: lesson.exam.durationMinutes,
          totalQuestions: lesson.exam.questions.length,
          passScore: lesson.exam.passScore,
          questions: lesson.exam.questions,
        },
      };

      if (matchIndex >= 0) {
        result[matchIndex] = {
          ...result[matchIndex],
          ...convertedTopic,
          id: result[matchIndex].id,
          number: result[matchIndex].number,
        };
      } else {
        result.push(convertedTopic);
      }
    });

    // Also bridge rich freestyle lessons from the 21 Topics Architecture
    try {
      // Lazy load to prevent potential circular reference issues
      const { getGrammarTopics } = require('./grammarCourseStorage');
      const courseTopics = getGrammarTopics();
      if (Array.isArray(courseTopics)) {
        courseTopics.forEach((ct: any) => {
          const topicIdx = ct.order - 1;
          if (topicIdx >= 0 && topicIdx < result.length && ct.lessons && ct.lessons.length > 0) {
            const firstLesson = ct.lessons[0];
            if (firstLesson && firstLesson.theoryBlocks && firstLesson.theoryBlocks.length > 0) {
              const formulas = firstLesson.theoryBlocks
                .filter((b: any) => b.type === 'formula')
                .map((b: any) => ({
                  type: b.title || 'Công thức',
                  pattern: b.data?.pattern || b.content || '',
                  note: b.data?.note || '',
                }));
              const pitfalls = firstLesson.theoryBlocks
                .filter((b: any) => b.type === 'pitfall')
                .map((b: any) => ({
                  wrong: b.data?.wrong || '',
                  correct: b.data?.correct || '',
                  explanation: b.data?.explanation || '',
                }));
              const overview = firstLesson.theoryBlocks
                .filter((b: any) => b.type === 'paragraph')
                .map((b: any) => b.content)
                .join('\n\n') || result[topicIdx].theory.overview;

              result[topicIdx] = {
                ...result[topicIdx],
                theory: {
                  ...result[topicIdx].theory,
                  overview,
                  formulas: formulas.length > 0 ? formulas : result[topicIdx].theory.formulas,
                  pitfalls: pitfalls.length > 0 ? pitfalls : result[topicIdx].theory.pitfalls,
                },
                examples: firstLesson.examples && firstLesson.examples.length > 0
                  ? (firstLesson.examples as any)
                  : result[topicIdx].examples,
              };
            }
          }
        });
      }
    } catch (e) {
      // Ignore fallback if course storage not initialized
    }

    return result;
  } catch (err) {
    console.error('Error combining grammar topics:', err);
    return GRAMMAR_21_TOPICS;
  }
}

// ==========================================
// 6. DASHBOARD SUMMARY STATS
// ==========================================
export function getAdminDashboardStats() {
  const words = getAdminVocabWords();
  const questions = getAdminQuestions();
  const users = getAdminUsers();
  const lessons = getAdminLessons();

  const totalCoins = users.reduce((acc, u) => acc + (u.totalXP || 0), 0);
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;

  return {
    totalWords: words.length,
    totalQuestions: questions.length,
    totalUsers: users.length,
    activeUsers,
    totalLessons: lessons.length,
    totalCoinsInCirculation: totalCoins,
    levelsBreakdown: {
      A1: words.filter((w) => w.level === 'A1').length,
      A2: words.filter((w) => w.level === 'A2').length,
      B1: words.filter((w) => w.level === 'B1').length,
      B2: words.filter((w) => w.level === 'B2').length,
      C1: words.filter((w) => w.level === 'C1').length,
      C2: words.filter((w) => w.level === 'C2').length,
    },
  };
}

// Reset all admin data to seed state
export function resetAdminDataToDefaults(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.VOCAB);
  localStorage.removeItem(STORAGE_KEYS.COLLECTIONS);
  localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.LESSONS);
  localStorage.removeItem(STORAGE_KEYS.LOGS);
}
