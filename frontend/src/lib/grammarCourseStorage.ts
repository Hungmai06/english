'use client';

import {
  GrammarTopic,
  GrammarLesson,
  GrammarCourse,
  TheoryBlock,
  LessonExample,
  BankQuestion,
  ExamSettings,
  CefrLevel,
  ExerciseGroup,
  OnlineExamSection,
  OnlineExamItem,
} from '@/types/grammarSystem';
import { SEED_GRAMMAR_21_TOPICS, GRAMMAR_MASTER_COURSE } from './data/grammar21Architecture';
import { addQuestionsBulkToBank, getQuestionBank } from './questionBankStorage';

const TOPICS_STORAGE_KEY = 'elp_grammar_topics_hierarchy_v2';

/**
 * Chuẩn hóa danh sách bài tập (Exercise Groups) cho bài học:
 * - Nếu đã có exerciseGroups -> dùng nó
 * - Nếu chưa có, nhưng có questions -> bọc vào 1 nhóm mặc định "Bài 1"
 * - Nếu trống -> tạo 1 nhóm rỗng "Bài 1"
 */
export function normalizeLessonExerciseGroups(lesson: GrammarLesson): ExerciseGroup[] {
  if (lesson.exerciseGroups && lesson.exerciseGroups.length > 0) {
    return lesson.exerciseGroups;
  }
  if (lesson.questions && lesson.questions.length > 0) {
    return [
      {
        id: `eg-${lesson.id}-1`,
        title: 'Bài 1',
        description: '',
        questions: [...lesson.questions],
      },
    ];
  }
  return [
    {
      id: `eg-${lesson.id}-1`,
      title: 'Bài 1',
      description: '',
      questions: [],
    },
  ];
}

/**
 * Chuẩn hóa danh sách bài thi online (Online Exams) cho bài học:
 * - Nếu đã có onlineExams -> dùng nó
 * - Nếu có examSettings READY -> bọc vào "Bài Online 1" với phần thi đầu tiên
 * - Nếu chưa có -> tạo 1 bài online mẫu ở trạng thái DRAFT
 */
export function normalizeLessonOnlineExams(lesson: GrammarLesson): OnlineExamItem[] {
  if (lesson.onlineExams && lesson.onlineExams.length > 0) {
    return lesson.onlineExams;
  }

  const allQuestions = lesson.questions || [];
  const qIds = lesson.examSettings?.questionIds || [];
  const matched = allQuestions.filter((q) => qIds.includes(q.id));
  const examQuestions = matched.length > 0 ? matched : allQuestions;

  if (lesson.examSettings?.status === 'READY') {
    return [
      {
        id: `oe-${lesson.id}-1`,
        title: 'Bài Online 1',
        durationMinutes: lesson.examSettings.durationMinutes || 10,
        passScore: lesson.examSettings.passScore || 1,
        status: 'READY',
        sections: [
          {
            id: `oes-${lesson.id}-1`,
            title: 'Bài 1',
            description: '',
            questions: [...examQuestions],
          },
        ],
      },
    ];
  }

  return [
    {
      id: `oe-${lesson.id}-1`,
      title: 'Bài Online 1',
      durationMinutes: 10,
      passScore: 1,
      status: 'DRAFT',
      sections: [
        {
          id: `oes-${lesson.id}-1`,
          title: 'Bài 1',
          description: '',
          questions: [],
        },
      ],
    },
  ];
}

export function getGrammarTopics(): GrammarTopic[] {
  if (typeof window === 'undefined') return SEED_GRAMMAR_21_TOPICS;
  try {
    const raw = localStorage.getItem(TOPICS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(SEED_GRAMMAR_21_TOPICS));
      return SEED_GRAMMAR_21_TOPICS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 21) {
      return parsed;
    }
    // If somehow less than 21, seed missing topics
    return SEED_GRAMMAR_21_TOPICS;
  } catch (err) {
    console.error('Error reading Grammar Topics from storage:', err);
    return SEED_GRAMMAR_21_TOPICS;
  }
}

export function saveGrammarTopics(topics: GrammarTopic[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topics));
  } catch (err) {
    console.error('Error saving Grammar Topics to storage:', err);
  }
}

export function getGrammarCourse(): GrammarCourse {
  const topics = getGrammarTopics();
  const bank = getQuestionBank();
  const totalLessons = topics.reduce((acc, t) => acc + (t.lessons?.length || 0), 0);
  const avgProgress = Math.round(
    topics.reduce((acc, t) => acc + (t.progress || 0), 0) / (topics.length || 1)
  );

  return {
    ...GRAMMAR_MASTER_COURSE,
    totalTopics: topics.length,
    totalLessons,
    totalQuestions: bank.length,
    progress: avgProgress,
    topics,
  };
}

export function getTopicById(topicId: string): GrammarTopic | undefined {
  const topics = getGrammarTopics();
  return topics.find((t) => t.id === topicId || t.name.toLowerCase().includes(topicId.toLowerCase()));
}

export function getLessonById(topicId: string, lessonId: string): GrammarLesson | undefined {
  const topic = getTopicById(topicId);
  return topic?.lessons.find((l) => l.id === lessonId);
}

export function createEmptyLessonDraft(topicId: string, order = 1): GrammarLesson {
  const now = Date.now();
  return {
    id: `lesson-${now}`,
    topic_id: topicId,
    title: 'Bài học mới',
    subtitle: 'Nội dung lý thuyết, ví dụ & bài tập',
    description: 'Mô tả chi tiết nội dung bài học ngữ pháp...',
    cefr: 'B1',
    order,
    estimated_time: '20 phút',
    status: 'DRAFT',
    isCompleted: false,
    theoryBlocks: [
      {
        id: `tb-${now}-1`,
        type: 'heading',
        content: '1. Khái Niệm & Định Nghĩa',
        data: { level: 2 },
        order: 1,
      },
      {
        id: `tb-${now}-2`,
        type: 'paragraph',
        content: 'Nội dung giải thích chi tiết cấu trúc ngữ pháp tại đây...',
        order: 2,
      },
    ],
    examples: [],
    questions: [],
    exerciseGroups: [
      {
        id: `eg-${now}-1`,
        title: 'Bài 1',
        description: 'Bài tập trắc nghiệm củng cố kiến thức ngữ pháp',
        questions: [],
      },
    ],
    onlineExams: [
      {
        id: `oe-${now}-1`,
        title: 'Bài Online 1',
        durationMinutes: 10,
        passScore: 1,
        status: 'DRAFT',
        sections: [
          {
            id: `oes-${now}-1`,
            title: 'Bài 1',
            description: '',
            questions: [],
          },
        ],
      },
    ],
    examSettings: {
      status: 'NOT_CREATED',
      durationMinutes: 10,
      passScore: 1,
      totalQuestions: 0,
      questionIds: [],
    },
  };
}

/**
 * Save or update a Lesson within its Topic.
 * Automatically synchronizes any new questions with the central Question Bank without duplicating!
 */
export function saveLessonToTopic(topicId: string, lesson: GrammarLesson): GrammarTopic[] {
  const topics = getGrammarTopics();
  const topicIndex = topics.findIndex((t) => t.id === topicId);
  if (topicIndex < 0) return topics;

  const currentTopic = topics[topicIndex];
  const lessonIndex = currentTopic.lessons.findIndex((l) => l.id === lesson.id);

  // Flatten exercise questions into lesson.questions for backward compatibility
  let allExerciseQuestions: BankQuestion[] = lesson.questions || [];
  if (lesson.exerciseGroups && lesson.exerciseGroups.length > 0) {
    allExerciseQuestions = lesson.exerciseGroups.flatMap((g) => g.questions);
  }

  // Collect all online exam questions
  const allOnlineQuestions: BankQuestion[] =
    lesson.onlineExams?.flatMap((e) => e.sections.flatMap((s) => s.questions)) || [];

  const combinedQuestionsToSync = [...allExerciseQuestions, ...allOnlineQuestions];

  // Sync questions with unified Question Bank
  if (combinedQuestionsToSync.length > 0) {
    addQuestionsBulkToBank(
      combinedQuestionsToSync.map((q) => ({
        ...q,
        topicId,
        lessonId: lesson.id,
      }))
    );
  }

  // Sync backward compatible examSettings from onlineExams if present
  let syncedExamSettings = lesson.examSettings;
  if (lesson.onlineExams && lesson.onlineExams.length > 0) {
    const primaryExam = lesson.onlineExams[0];
    const totalQ = primaryExam.sections.reduce((acc, s) => acc + s.questions.length, 0);
    const qIds = primaryExam.sections.flatMap((s) => s.questions.map((q) => q.id));
    syncedExamSettings = {
      status: primaryExam.status === 'READY' ? 'READY' : 'NOT_CREATED',
      durationMinutes: primaryExam.durationMinutes,
      passScore: primaryExam.passScore,
      totalQuestions: totalQ,
      questionIds: qIds,
    };
  }

  const synchronizedLesson: GrammarLesson = {
    ...lesson,
    questions: allExerciseQuestions,
    examSettings: syncedExamSettings,
  };

  let updatedLessons: GrammarLesson[];
  if (lessonIndex >= 0) {
    updatedLessons = [...currentTopic.lessons];
    updatedLessons[lessonIndex] = synchronizedLesson;
  } else {
    updatedLessons = [...currentTopic.lessons, synchronizedLesson];
  }

  // Sort lessons by order
  updatedLessons.sort((a, b) => a.order - b.order);

  const updatedTopic: GrammarTopic = {
    ...currentTopic,
    lessonsCount: updatedLessons.length,
    lessons: updatedLessons,
  };

  const updatedTopics = [...topics];
  updatedTopics[topicIndex] = updatedTopic;
  saveGrammarTopics(updatedTopics);
  return updatedTopics;
}

/**
 * Delete a Lesson from a Topic
 */
export function deleteLessonFromTopic(topicId: string, lessonId: string): GrammarTopic[] {
  const topics = getGrammarTopics();
  const topicIndex = topics.findIndex((t) => t.id === topicId);
  if (topicIndex < 0) return topics;

  const currentTopic = topics[topicIndex];
  const updatedLessons = currentTopic.lessons.filter((l) => l.id !== lessonId);

  const updatedTopic: GrammarTopic = {
    ...currentTopic,
    lessonsCount: updatedLessons.length,
    lessons: updatedLessons,
  };

  const updatedTopics = [...topics];
  updatedTopics[topicIndex] = updatedTopic;
  saveGrammarTopics(updatedTopics);
  return updatedTopics;
}

/**
 * Update Topic metadata (name, description, CEFR, status, objectives)
 */
export function saveTopicMetadata(updatedTopic: GrammarTopic): GrammarTopic[] {
  const topics = getGrammarTopics();
  const index = topics.findIndex((t) => t.id === updatedTopic.id);
  if (index < 0) return topics;

  const updatedTopics = [...topics];
  updatedTopics[index] = updatedTopic;
  saveGrammarTopics(updatedTopics);
  return updatedTopics;
}

/**
 * Create a new Topic
 */
export function createTopic(
  name: string,
  nameEn = '',
  cefr: CefrLevel = 'B1',
  description = ''
): GrammarTopic {
  const topics = getGrammarTopics();
  const nextOrder = topics.length + 1;
  const newTopic: GrammarTopic = {
    id: `topic-${Date.now()}`,
    order: nextOrder,
    name,
    nameEn: nameEn || name,
    cefr,
    description: description || `Chuyên đề ngữ pháp #${nextOrder}: ${name}`,
    icon: 'BookOpen',
    status: 'DRAFT',
    progress: 0,
    lessonsCount: 0,
    lessons: [],
    objectives: [],
  };

  const updatedTopics = [...topics, newTopic];
  saveGrammarTopics(updatedTopics);
  return newTopic;
}

/**
 * Delete a Topic completely
 */
export function deleteTopic(topicId: string): GrammarTopic[] {
  const topics = getGrammarTopics();
  const updatedTopics = topics.filter((t) => t.id !== topicId);
  // Re-index orders
  updatedTopics.forEach((t, i) => {
    t.order = i + 1;
  });
  saveGrammarTopics(updatedTopics);
  return updatedTopics;
}

/**
 * Reset all grammar data to seeds
 */
export function resetGrammarToSeeds(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOPICS_STORAGE_KEY);
  localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(SEED_GRAMMAR_21_TOPICS));
}

