// Types based on the English Learning Platform Architecture & DB Specification

export type ModuleType =
  | 'grammar'
  | 'vocabulary'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'writing'
  | 'toeic';

export interface ModuleItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tone: 'blue' | 'orange' | 'purple' | 'cyan' | 'green' | 'pink' | 'warm';
  status: 'active' | 'beta' | 'coming_soon';
  itemCount: number;
  progressPercent: number;
}

// Grammar hierarchy
export interface GrammarCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  topics: GrammarTopic[];
}

export interface GrammarTopic {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  summary: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty: 'A1-A2' | 'B1-B2' | 'C1';
  estimatedMinutes: number;
  lessonsCount: number;
  completedCount: number;
  progressPercent: number;
  lessons?: GrammarLesson[];
}

export interface GrammarLesson {
  id: string;
  topicId: string;
  title: string;
  slug: string;
  order: number;
  level: string;
  readTime: string;
  isCompleted?: boolean;
  content: {
    introduction: string;
    rules: {
      formula?: string;
      explanation: string;
      conditions?: string[];
    }[];
    theory: string[];
    examples: {
      en: string;
      vi: string;
      note?: string;
    }[];
    commonMistakes: {
      wrong: string;
      correct: string;
      reason: string;
    }[];
    quickCheck?: {
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    };
  };
}

// Question & Practice Engine
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'fill_blank'
  | 'sentence_ordering'
  | 'matching'
  | 'sentence_correction';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  moduleId: ModuleType;
  topicId?: string;
  lessonId?: string;
  type: QuestionType;
  prompt: string;
  instruction?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: QuestionOption[];
  correctAnswer?: string | string[]; // Option ID or correct text string/array
  scrambledWords?: string[]; // For sentence_ordering
  correctOrder?: string[]; // For sentence_ordering
  matchingPairs?: { left: string; right: string }[]; // For matching
  underlinedWord?: string; // For correction
  explanation: string;
  ruleReference?: string;
  audioPrompt?: string;
}

export interface PracticeSession {
  id: string;
  title: string;
  moduleId: ModuleType;
  topicName?: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, {
    givenAnswer: any;
    isCorrect: boolean;
    timeSpentSeconds: number;
  }>;
  startedAt: string;
  completedAt?: string;
  score?: number;
  totalQuestions: number;
  xpEarned?: number;
}

// Vocabulary
export interface VocabularySense {
  id: string;
  definition: string;
  viDefinition: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'idiom';
  examples: { en: string; vi: string }[];
}

export interface VocabularyWord {
  id: string;
  lemma: string;
  ipa: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  audioUrl?: string;
  senses: VocabularySense[];
  collocations: string[];
  collectionId: string;
  isMastered?: boolean;
  isBookmarked?: boolean;
  reviewCount?: number;
}

export interface VocabularyCollection {
  id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  wordsCount: number;
  category: 'General' | 'Business' | 'TOEIC' | 'Academic' | 'Custom';
}

// Exams
export interface Exam {
  id: string;
  title: string;
  slug: string;
  type: 'grammar_mastery' | 'toeic_part5' | 'placement_test';
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  passingScore: number;
  questions: Question[];
}

export interface ExamAttempt {
  id: string;
  examId: string;
  startedAt: string;
  submittedAt?: string;
  score: number;
  totalQuestions: number;
  passed: boolean;
  userAnswers: Record<string, any>;
  correctCount: number;
}

// User Mistakes & Notebook
export interface MistakeRecord {
  id: string;
  question: Question;
  givenAnswer: any;
  correctAnswerText: string;
  failedCount: number;
  correctedCount: number;
  lastAttemptedAt: string;
  status: 'needs_review' | 'mastered';
}

// User Progress & Stats
export interface UserProgressStats {
  streakDays: number;
  xp: number;
  level: number;
  masteryPercent: number;
  lessonsCompleted: number;
  questionsAnswered: number;
  grammarMastery: number;
  vocabularyMastery: number;
  activeMistakesCount: number;
  savedBookmarksCount: number;
}

// User & Authentication
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  streakDays: number;
  totalXP: number;
  level: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Re-export Grammar System 21 Topics Architecture
export * from './grammarSystem';
