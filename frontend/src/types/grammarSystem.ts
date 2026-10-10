// Grammar System Architecture Types (Course -> 21 Topics -> Lessons -> 4 Tabs)

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type TheoryBlockType =
  | 'heading'
  | 'paragraph'
  | 'formula'
  | 'callout'
  | 'pitfall'
  | 'table'
  | 'key_takeaway';

export interface TheoryBlock {
  id: string;
  type: TheoryBlockType;
  title?: string;
  content?: string;
  data?: {
    level?: 2 | 3;
    pattern?: string;
    note?: string;
    formulaType?: string;
    calloutVariant?: 'info' | 'tip' | 'warning' | 'success';
    wrong?: string;
    correct?: string;
    explanation?: string;
    tableHeaders?: string[];
    tableRows?: string[][];
    bullets?: string[];
  };
  order: number;
  isHidden?: boolean;
}

export interface LessonExample {
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

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionUsageTag =
  | 'lesson_exercise'
  | 'mini_test'
  | 'lesson_exam'
  | 'topic_exam'
  | 'course_exam';

export interface BankQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  hint?: string;
  topicId: string;
  lessonId?: string;
  difficulty: QuestionDifficulty;
  cefr: CefrLevel;
  usageTags: QuestionUsageTag[];
  normalizedHash: string; // Used to prevent duplicates
  createdAt?: string;
}

export interface ExamSettings {
  status: 'NOT_CREATED' | 'READY';
  durationMinutes: number;
  passScore: number;
  totalQuestions: number;
  questionIds: string[];
}

// Multi-exercise Architecture (Một bài học có thể có nhiều bài tập nhỏ: Bài 1, Bài 2, ...)
export interface ExerciseGroup {
  id: string;
  title: string; // "Bài 1", "Bài 2" hoặc tên tùy chỉnh như "Bài 1: Trắc nghiệm nhận biết"
  description?: string;
  questions: BankQuestion[];
}

// Multi-online Exam Section (Nhiều bài nhỏ trong 1 bài online)
export interface OnlineExamSection {
  id: string;
  title: string; // "Bài 1 trong đề", "Phần 1: Nhận biết", ...
  description?: string;
  questions: BankQuestion[];
}

// Multi-online Exam Item (Nhiều bài thi online trong 1 bài học)
export interface OnlineExamItem {
  id: string;
  title: string; // "Bài Online 1", "Bài Online 2", "Đề kiểm tra 15p", ...
  durationMinutes: number;
  passScore: number;
  status: 'READY' | 'DRAFT';
  sections: OnlineExamSection[]; // Nhiều bài trong 1 bài online
}

export interface GrammarLesson {
  id: string;
  topic_id: string;
  title: string;
  subtitle: string;
  description: string;
  cefr: CefrLevel;
  order: number;
  estimated_time: string;
  status: 'PUBLISHED' | 'DRAFT';
  isCompleted?: boolean;
  
  // 4 khu vực bắt buộc:
  theoryBlocks: TheoryBlock[];
  examples: LessonExample[];
  questions: BankQuestion[];
  examSettings: ExamSettings;

  // Cấu trúc nâng cao: Nhiều bài tập & Nhiều bài online (mỗi bài online có nhiều bài nhỏ)
  exerciseGroups?: ExerciseGroup[];
  onlineExams?: OnlineExamItem[];
}

export interface GrammarTopic {
  id: string;
  order: number; // 1 to 21
  name: string;
  nameEn: string;
  description: string;
  cefr: CefrLevel;
  image?: string;
  icon: string;
  objectives: string[];
  status: 'PUBLISHED' | 'DRAFT';
  lessonsCount: number;
  progress: number;
  lessons: GrammarLesson[];
}

export interface GrammarCourse {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  totalTopics: number;
  totalLessons: number;
  totalQuestions: number;
  progress: number;
  topics: GrammarTopic[];
}

export type ExamMode = 'lesson' | 'topic' | 'multi_topic' | 'full_course';
