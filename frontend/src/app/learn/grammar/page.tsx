'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  ArrowRight,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Volume2,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Timer,
  Flame,
  Zap,
  Bookmark,
  Layers,
  Check,
  ArrowLeft,
  Filter,
  CheckCircle,
  Eye,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  GrammarTopic,
  GrammarLesson,
  TheoryBlock,
  LessonExample,
  BankQuestion,
  CefrLevel,
} from '@/types/grammarSystem';
import {
  getGrammarTopics,
  saveGrammarTopics,
  normalizeLessonExerciseGroups,
  normalizeLessonOnlineExams,
} from '@/lib/grammarCourseStorage';
import { SEED_GRAMMAR_21_TOPICS } from '@/lib/data/grammar21Architecture';
import { GRAMMAR_21_TOPICS } from '@/lib/data/grammar21Data';
import { speakText } from '@/lib/tts';
import { addXP } from '@/lib/storage';
import { VocaRobotMascot } from '@/components/VocaRobotMascot';
import { ExamCenterModal } from '@/components/admin/grammar/ExamCenterModal';

// Helper: Enrich any lesson that might have empty theoryBlocks, examples, or questions with seed data
function enrichLessonData(topic: GrammarTopic, lesson: GrammarLesson): GrammarLesson {
  // Find fallback topic from GRAMMAR_21_TOPICS by order
  const fallback = GRAMMAR_21_TOPICS.find(
    (t) => t.number === topic.order || t.id === `t-${topic.order}`
  );

  let theoryBlocks = lesson.theoryBlocks ? [...lesson.theoryBlocks] : [];
  if (theoryBlocks.length === 0 && fallback) {
    theoryBlocks.push({
      id: `tb-${lesson.id}-1`,
      type: 'heading',
      content: `1. Bản Chất & Khái Niệm Ngữ Pháp`,
      data: { level: 2 },
      order: 1,
    });
    theoryBlocks.push({
      id: `tb-${lesson.id}-2`,
      type: 'paragraph',
      content: fallback.theory.overview,
      order: 2,
    });

    // Formulas
    fallback.theory.formulas?.forEach((f, idx) => {
      theoryBlocks.push({
        id: `tb-${lesson.id}-f-${idx}`,
        type: 'formula',
        title: f.type,
        content: f.pattern,
        data: {
          pattern: f.pattern,
          note: f.note,
          formulaType: f.type,
        },
        order: 3 + idx,
      });
    });

    // Usages
    fallback.theory.usages?.forEach((u, idx) => {
      theoryBlocks.push({
        id: `tb-${lesson.id}-u-${idx}`,
        type: 'callout',
        title: u.title,
        content: `${u.detail || ''}${u.signals && u.signals.length > 0 ? `\n• Dấu hiệu nhận biết: ${u.signals.join(', ')}` : ''}`,
        data: { calloutVariant: 'tip' },
        order: 10 + idx,
      });
    });

    // Pitfalls
    fallback.theory.pitfalls?.forEach((p, idx) => {
      theoryBlocks.push({
        id: `tb-${lesson.id}-p-${idx}`,
        type: 'pitfall',
        title: 'Bẫy lỗi sai cần tránh trong đề thi',
        data: {
          wrong: p.wrong,
          correct: p.correct,
          explanation: p.explanation,
        },
        order: 20 + idx,
      });
    });
  }

  // Fallback examples
  const examples: LessonExample[] =
    lesson.examples && lesson.examples.length > 0
      ? lesson.examples
      : (fallback?.examples as LessonExample[]) || [];

  // Fallback questions
  const questions: BankQuestion[] =
    lesson.questions && lesson.questions.length > 0
      ? lesson.questions
      : (fallback?.exercises || []).map((ex) => ({
          id: ex.id,
          prompt: ex.question,
          options: ex.options,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
          hint: ex.hint,
          topicId: topic.id,
          lessonId: lesson.id,
          difficulty: 'medium',
          cefr: lesson.cefr || topic.cefr,
          usageTags: ['lesson_exercise'],
          normalizedHash: ex.id,
        }));

  return {
    ...lesson,
    theoryBlocks,
    examples,
    questions,
    examSettings:
      lesson.examSettings?.status === 'READY'
        ? lesson.examSettings
        : {
            status: 'READY',
            durationMinutes: 10,
            passScore: Math.max(1, Math.floor((questions.length || 2) * 0.7)),
            totalQuestions: questions.length || 2,
            questionIds: questions.map((q) => q.id),
          },
  };
}

// Helper: Trích xuất 2 phần văn bản duy nhất (Khung trên: Tài liệu, Khung dưới: Ví dụ)
// Toàn bộ là text, không chia khối nhỏ hơn nữa
function getLessonTheoryAndExamples(lesson: GrammarLesson): { theory: string; examples: string } {
  let theory = '';
  let examples = '';

  if (lesson.examples && lesson.examples.length > 0) {
    examples = lesson.examples
      .map((ex) => `• ${ex.en}${ex.vi ? `\n  (${ex.vi})` : ''}`)
      .join('\n\n');
  }

  if (lesson.theoryBlocks && lesson.theoryBlocks.length > 0) {
    const docParts: string[] = [];
    const exParts: string[] = [];
    let isUnderExample = false;

    lesson.theoryBlocks.forEach((b) => {
      let content = b.content || b.data?.pattern || '';
      if (b.type === 'formula') {
        const note = b.data?.note ? ` (${b.data.note})` : '';
        content = `${b.title ? `${b.title}: ` : ''}${b.data?.pattern || content}${note}`;
      } else if (b.type === 'pitfall') {
        const wrong = b.data?.wrong ? `Sai: ${b.data.wrong}\n` : '';
        const correct = b.data?.correct ? `Đúng: ${b.data.correct}\n` : '';
        const exp = b.data?.explanation ? `Giải thích: ${b.data.explanation}` : '';
        content = `${b.title ? `${b.title}\n` : ''}${wrong}${correct}${exp}`.trim() || content;
      } else if (b.title && b.content && !b.content.includes(b.title)) {
        content = `${b.title}\n${b.content}`;
      }

      if (!content.trim()) return;

      if (b.type === 'heading' && /ví dụ/i.test(content)) {
        isUnderExample = true;
        return;
      }

      if (isUnderExample) {
        exParts.push(content);
      } else {
        docParts.push(content);
      }
    });

    const parsedDoc = docParts.join('\n\n').trim();
    if (parsedDoc) theory = parsedDoc;

    if (exParts.length > 0) {
      const extraEx = exParts.join('\n\n').trim();
      examples = examples ? `${examples}\n\n${extraEx}` : extraEx;
    }
  }

  return { theory, examples };
}

export default function GrammarLandingPage() {
  // 1. Data state: 21 Topics with full sub-lessons
  const [topics, setTopics] = useState<GrammarTopic[]>(SEED_GRAMMAR_21_TOPICS);

  useEffect(() => {
    const loaded = getGrammarTopics();
    if (loaded && loaded.length >= 21) {
      setTopics(loaded);
    }
  }, []);

  // 2. Selection states:
  // When selectedTopicId and selectedLessonId are null -> Overview Row-by-Row List
  // When selected -> Study Workspace
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // 3 Core Tabs in Lesson: 'theory' (Lí thuyết & Ví dụ gộp) | 'exercises' | 'exam'
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises' | 'exam'>('theory');

  // Overview Accordion: which topic rows are expanded to show lessons
  // Default: first 3 topics expanded
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(
    () => new Set(['topic-1-tenses', 'topic-2-infinitives', 'topic-3-modals'])
  );

  // Search in Overview
  const [searchQuery, setSearchQuery] = useState('');

  // Study Workspace: toggle left vertical sidebar for lesson roadmap
  const [isLessonSidebarOpen, setIsLessonSidebarOpen] = useState(true);

  // Exam Center Modal (Global modal for Topic, Multi-topic or Full Course exams)
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examModalConfig, setExamModalConfig] = useState<{
    mode: 'lesson' | 'topic' | 'multi_topic' | 'full_course';
    topicId?: string;
    lessonId?: string;
    topicName?: string;
    lessonTitle?: string;
  }>({ mode: 'full_course' });

  // In-lesson Exercise Practice interactive state (Tab 3)
  const [selectedExerciseGroupIndex, setSelectedExerciseGroupIndex] = useState(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, number>>({});
  const [exerciseChecked, setExerciseChecked] = useState<Record<string, boolean>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});

  // In-lesson Exam interactive state (Tab 4)
  const [selectedOnlineExamIndex, setSelectedOnlineExamIndex] = useState(0);
  const [lessonExamActive, setLessonExamActive] = useState(false);
  const [lessonExamAnswers, setLessonExamAnswers] = useState<Record<string, number>>({});
  const [lessonExamTimeLeft, setLessonExamTimeLeft] = useState<number>(600); // 10 minutes
  const [lessonExamSubmitted, setLessonExamSubmitted] = useState(false);
  const [lessonExamScore, setLessonExamScore] = useState<number | null>(null);
  const [isRobotBubbleOpen, setIsRobotBubbleOpen] = useState(true);

  // Sync state with URL query parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const topicParam = params.get('topic');
      const lessonParam = params.get('lesson');
      const tabParam = params.get('tab');

      if (topicParam) {
        // Resolve topic ID
        const matched = topics.find(
          (t) =>
            t.id === topicParam ||
            t.id === `topic-${topicParam}` ||
            (topicParam.startsWith('t-') && t.order === parseInt(topicParam.replace('t-', ''), 10))
        );
        if (matched) {
          setSelectedTopicId(matched.id);
          if (lessonParam && matched.lessons.some((l) => l.id === lessonParam)) {
            setSelectedLessonId(lessonParam);
          } else if (matched.lessons && matched.lessons.length > 0) {
            setSelectedLessonId(matched.lessons[0].id);
          }
          if (tabParam) {
            if (tabParam === 'examples' || tabParam === 'theory') {
              setActiveTab('theory');
            } else if (tabParam === 'exercises' || tabParam === 'exam') {
              setActiveTab(tabParam as any);
            }
          }
        }
      } else {
        setSelectedTopicId(null);
        setSelectedLessonId(null);
      }
    };

    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    window.addEventListener('reset-grammar-view', syncFromUrl);

    return () => {
      window.removeEventListener('popstate', syncFromUrl);
      window.removeEventListener('reset-grammar-view', syncFromUrl);
    };
  }, [topics]);

  // Derived current topic & current lesson
  const currentTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return topics.find((t) => t.id === selectedTopicId) || null;
  }, [selectedTopicId, topics]);

  const currentLesson = useMemo(() => {
    if (!currentTopic) return null;
    let target = currentTopic.lessons.find((l) => l.id === selectedLessonId);
    if (!target && currentTopic.lessons.length > 0) {
      target = currentTopic.lessons[0];
    }
    return target ? enrichLessonData(currentTopic, target) : null;
  }, [currentTopic, selectedLessonId]);

  // Current lesson index in topic
  const currentLessonIndex = useMemo(() => {
    if (!currentTopic || !currentLesson) return 0;
    return currentTopic.lessons.findIndex((l) => l.id === currentLesson.id);
  }, [currentTopic, currentLesson]);

  // Normalized Exercise Groups and Online Exams
  const exerciseGroups = useMemo(() => {
    if (!currentLesson) return [];
    return normalizeLessonExerciseGroups(currentLesson);
  }, [currentLesson]);

  const onlineExams = useMemo(() => {
    if (!currentLesson) return [];
    return normalizeLessonOnlineExams(currentLesson);
  }, [currentLesson]);

  const activeExerciseGroup = exerciseGroups[selectedExerciseGroupIndex] || exerciseGroups[0] || null;
  const questionsList = activeExerciseGroup?.questions || currentLesson?.questions || [];

  const activeOnlineExam = onlineExams[selectedOnlineExamIndex] || onlineExams[0] || null;
  const activeExamQuestions = useMemo(() => {
    if (!activeOnlineExam) return currentLesson?.questions || [];
    return activeOnlineExam.sections.flatMap((s) => s.questions);
  }, [activeOnlineExam, currentLesson]);

  // Filter topics based on Search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase().trim();
    return topics.filter((t) => {
      const matchTopic =
        t.name.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);
      const matchLesson = (t.lessons || []).some(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.subtitle.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
      return matchTopic || matchLesson;
    });
  }, [topics, searchQuery]);

  // Automatically expand topics that match search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const matchingIds = new Set(filteredTopics.map((t) => t.id));
      setExpandedTopicIds(matchingIds);
    }
  }, [searchQuery, filteredTopics]);

  // Expand / Collapse helper
  const toggleTopicExpand = (topicId: string) => {
    setExpandedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const isAllExpanded = useMemo(() => {
    return filteredTopics.every((t) => expandedTopicIds.has(t.id));
  }, [filteredTopics, expandedTopicIds]);

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedTopicIds(new Set());
    } else {
      setExpandedTopicIds(new Set(filteredTopics.map((t) => t.id)));
    }
  };

  // Navigate to study a specific lesson with a specific active tab
  const handleSelectLesson = (
    topicId: string,
    lessonId: string,
    tab: 'theory' | 'exercises' | 'exam' = 'theory'
  ) => {
    setSelectedTopicId(topicId);
    setSelectedLessonId(lessonId);
    setActiveTab(tab === ('examples' as any) ? 'theory' : tab);

    // Reset interactive states
    setSelectedExerciseGroupIndex(0);
    setSelectedOnlineExamIndex(0);
    setActiveExerciseIndex(0);
    setExerciseAnswers({});
    setExerciseChecked({});
    setShowHint({});
    setLessonExamActive(false);
    setLessonExamSubmitted(false);
    setLessonExamScore(null);

    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?topic=${topicId}&lesson=${lessonId}&tab=${tab}`;
      window.history.pushState({ topic: topicId, lesson: lessonId, tab }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Back to 21 Topics row list overview
  const handleBackToOverview = () => {
    setSelectedTopicId(null);
    setSelectedLessonId(null);
    setSelectedExerciseGroupIndex(0);
    setSelectedOnlineExamIndex(0);
    setLessonExamActive(false);
    setLessonExamSubmitted(false);

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Next / Previous lesson handlers
  const handleNextLesson = () => {
    if (!currentTopic || !currentLesson) return;
    if (currentLessonIndex < currentTopic.lessons.length - 1) {
      const next = currentTopic.lessons[currentLessonIndex + 1];
      handleSelectLesson(currentTopic.id, next.id, 'theory');
    } else {
      // Jump to next topic's first lesson if exists
      const topicIdx = topics.findIndex((t) => t.id === currentTopic.id);
      if (topicIdx < topics.length - 1) {
        const nextTopic = topics[topicIdx + 1];
        if (nextTopic.lessons && nextTopic.lessons.length > 0) {
          handleSelectLesson(nextTopic.id, nextTopic.lessons[0].id, 'theory');
        }
      }
    }
  };

  const handlePrevLesson = () => {
    if (!currentTopic || !currentLesson) return;
    if (currentLessonIndex > 0) {
      const prev = currentTopic.lessons[currentLessonIndex - 1];
      handleSelectLesson(currentTopic.id, prev.id, 'theory');
    }
  };

  // In-lesson Exam Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lessonExamActive && !lessonExamSubmitted && lessonExamTimeLeft > 0) {
      timer = setInterval(() => {
        setLessonExamTimeLeft((prev) => {
          if (prev <= 1) {
            handleLessonExamSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lessonExamActive, lessonExamSubmitted, lessonExamTimeLeft]);

  const handleLessonExamStart = () => {
    const durationSeconds = (activeOnlineExam?.durationMinutes || 10) * 60;
    setLessonExamActive(true);
    setLessonExamSubmitted(false);
    setLessonExamScore(null);
    setLessonExamAnswers({});
    setLessonExamTimeLeft(durationSeconds);
  };

  const handleLessonExamSubmit = () => {
    if (!currentLesson || lessonExamSubmitted) return;
    setLessonExamSubmitted(true);
    setLessonExamActive(false);

    const questions = activeExamQuestions;
    let correctCount = 0;
    questions.forEach((q) => {
      if (lessonExamAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    setLessonExamScore(correctCount);
    addXP(correctCount * 15);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Open Global Exam Center for Topic
  const handleOpenTopicExam = (topic: GrammarTopic) => {
    setExamModalConfig({
      mode: 'topic',
      topicId: topic.id,
      topicName: topic.name,
    });
    setIsExamModalOpen(true);
  };

  // Calculate overall stats
  const totalLessonsCount = useMemo(() => {
    return topics.reduce((acc, t) => acc + (t.lessons?.length || 0), 0);
  }, [topics]);

  // =========================================================================
  // VIEW A: 21 CHUYÊN ĐỀ NGỮ PHÁP (LIỆT KÊ THEO HÀNG / ROW-BY-ROW ACCORDION LIST)
  // =========================================================================
  if (!currentTopic || !currentLesson) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen pb-24 text-slate-800">
        {/* Header Hero Section */}
        <section className="bg-white border-b border-slate-200/80 py-8 md:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#FFF0E7] text-[#FF5C28] text-xs font-black uppercase tracking-wider">
                    21 CHUYÊN ĐỀ NGỮ PHÁP
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    Chuẩn CEFR A1 - C1 · Lộ trình bài bản & tinh gọn
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                  Làm Chủ Ngữ Pháp Tiếng Anh Bài Bản
                </h1>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Hệ thống 21 chuyên đề cốt lõi được sắp xếp trực quan theo từng hàng giúp bạn dễ dàng theo dõi và chọn bài học.
                </p>
              </div>

              {/* Overall Progress Stats */}
              <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-slate-200/90 flex items-center gap-5 sm:gap-6 shadow-2xs self-start md:self-auto">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#FF5C28]">68%</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Thành thạo</div>
                </div>
                <div className="h-9 w-[1px] bg-slate-200" />
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800">21</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Chuyên đề</div>
                </div>
                <div className="h-9 w-[1px] bg-slate-200" />
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-800">{totalLessonsCount}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Bài học</div>
                </div>
              </div>
            </div>

            {/* Search Bar (Full-width, đã bỏ thanh lọc trình độ) */}
            <div className="pt-2">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm chuyên đề, bài học ngữ pháp (ví dụ: 'Hiện tại đơn', 'Câu bị động', 'Conditionals')..."
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28] transition-all font-medium text-slate-800 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-5 h-5 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-xs font-bold transition-colors"
                    title="Xóa tìm kiếm"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 21 TOPIC ROWS SECTION */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-5">
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>21 Chuyên Đề Ngữ Pháp</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Mở từng chuyên đề để xem các bài học và bắt đầu luyện tập
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={toggleExpandAll}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span>{isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả bài học'}</span>
              </button>

              <span className="text-xs font-bold px-3 py-1.5 bg-[#FFF0E7] text-[#FF5C28] rounded-xl border border-[#FFE4D6]">
                {filteredTopics.length} / 21 Chuyên đề
              </span>
            </div>
          </div>

          {/* No results */}
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy chuyên đề nào</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Không có chuyên đề hoặc bài học nào khớp với từ khóa &quot;{searchQuery}&quot;. Vui lòng thử từ khóa khác.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-[#FF5C28] hover:bg-[#ea501e] text-white rounded-xl font-bold text-xs transition-colors shadow-xs"
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          ) : (
            /* ROW BY ROW LIST OF 21 TOPICS */
            <div className="space-y-4">
              {filteredTopics.map((topic) => {
                const isExpanded = expandedTopicIds.has(topic.id);
                const lessons = topic.lessons || [];

                return (
                  <div
                    key={topic.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* TOPIC ROW HEADER (HORIZONTAL FULL WIDTH BAR) */}
                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Number + Badge + Title + Summary */}
                      <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                        {/* Number Badge */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF0E7] to-[#FFE4D6] border border-[#FFD2BC] text-[#FF5C28] flex flex-col items-center justify-center font-black flex-shrink-0 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-bold uppercase leading-none">
                            KHỐI
                          </span>
                          <span className="text-base font-black leading-none mt-1">
                            #{topic.order < 10 ? `0${topic.order}` : topic.order}
                          </span>
                        </div>

                        {/* Title and Description */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              onClick={() => toggleTopicExpand(topic.id)}
                              className="text-base sm:text-lg font-black text-slate-900 hover:text-[#FF5C28] transition-colors cursor-pointer tracking-tight"
                            >
                              {topic.name}
                            </h3>
                            <span className="text-xs font-semibold text-slate-400">
                              • {topic.nameEn}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                topic.cefr === 'A1' || topic.cefr === 'A2'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : topic.cefr === 'B1' || topic.cefr === 'B2'
                                  ? 'bg-[#FFF0E7] text-[#FF5C28] border border-[#FFE4D6]'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}
                            >
                              {topic.cefr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Meta Badges + Actions */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 lg:self-center">
                        {/* Lessons Count */}
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-[#FF5C28]" />
                          <span>{lessons.length} bài học</span>
                        </span>

                        {/* Progress Bar */}
                        <div className="w-24 sm:w-28 flex flex-col gap-1 flex-shrink-0">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Tiến độ</span>
                            <span className="text-[#FF5C28]">{topic.progress || 60}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#FF5C28] to-[#FF8C66] rounded-full"
                              style={{ width: `${topic.progress || 60}%` }}
                            />
                          </div>
                        </div>

                        {/* Accordion Toggle Button */}
                        <button
                          onClick={() => toggleTopicExpand(topic.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                            isExpanded
                              ? 'bg-[#FFF0E7] text-[#FF5C28] border border-[#FFE4D6]'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{isExpanded ? 'Thu gọn bài' : `Xem bài học (${lessons.length})`}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED SUB-LESSONS LIST (ROW BY ROW) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-[#FAF8F5]/70 p-3 sm:p-5 space-y-2.5 animate-in fade-in duration-150">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                          <span>Các bài học trong chuyên đề #{topic.order}</span>
                          <span className="text-slate-400 font-semibold lowercase">
                            {lessons.length} bài học
                          </span>
                        </div>

                        <div className="space-y-2">
                          {lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id}
                              className="bg-white rounded-xl border border-slate-200/80 hover:border-[#FF5C28]/60 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all"
                            >
                              {/* Left: Lesson Index, Title, Subtitle, Time */}
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {lIdx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4
                                      onClick={() => handleSelectLesson(topic.id, lesson.id, 'theory')}
                                      className="text-sm font-black text-slate-900 hover:text-[#FF5C28] transition-colors cursor-pointer"
                                    >
                                      {lesson.title}
                                    </h4>
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                      {lesson.cefr || topic.cefr}
                                    </span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                      <Clock className="w-3 h-3" />
                                      <span>{lesson.estimated_time || '20 phút'}</span>
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right: Clean Action Button */}
                              <div className="flex items-center self-end sm:self-center flex-shrink-0">
                                <button
                                  onClick={() => handleSelectLesson(topic.id, lesson.id, 'theory')}
                                  className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
                                >
                                  <span>Vào học</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Exam Center Modal */}
        {isExamModalOpen && (
          <ExamCenterModal
            isOpen={isExamModalOpen}
            onClose={() => setIsExamModalOpen(false)}
            initialMode={examModalConfig.mode}
            topicId={examModalConfig.topicId}
            topicName={examModalConfig.topicName}
          />
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW B: SELECTED LESSON STUDY WORKSPACE
  // (Left topic/lesson navigator + 4 Tabs: 1. Lí thuyết, 2. Ví dụ, 3. Bài tập, 4. Thi online)
  // =========================================================================
  const currentQuestion = questionsList[activeExerciseIndex] || null;

  return (
    <div className="bg-[#FAF8F5] min-h-[calc(100vh-64px)] flex flex-col text-slate-800">
      {/* Top Bar: Breadcrumb + Navigation + Toggle Sidebar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setIsLessonSidebarOpen(!isLessonSidebarOpen)}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isLessonSidebarOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-800'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
              title={isLessonSidebarOpen ? 'Thu gọn danh mục bài học' : 'Mở danh mục bài học'}
            >
              <Layers className="w-4 h-4 text-[#FF5C28]" />
              <span className="hidden sm:inline">
                {isLessonSidebarOpen ? 'Ẩn mục lục' : 'Hiện mục lục bài'}
              </span>
            </button>

            <span className="text-slate-300">|</span>

            {/* Back to 21 Topics overview */}
            <button
              onClick={handleBackToOverview}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#FF5C28] transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>21 Chuyên đề</span>
            </button>

            <span className="text-slate-300 hidden md:inline">›</span>

            {/* Topic & Lesson breadcrumb */}
            <span className="text-xs font-bold text-slate-500 hidden md:inline truncate max-w-xs">
              {currentTopic.name}
            </span>

            <span className="text-slate-300 hidden lg:inline">›</span>

            <span className="text-xs font-extrabold text-[#FF5C28] hidden lg:inline truncate max-w-xs">
              {currentLesson.title}
            </span>
          </div>

          {/* Quick Prev / Next Lesson Navigation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400 font-bold hidden sm:inline">
              Bài {currentLessonIndex + 1}/{currentTopic.lessons.length}
            </span>
            <button
              onClick={handlePrevLesson}
              disabled={currentLessonIndex === 0}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
              title="Bài học trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trước</span>
            </button>
            <button
              onClick={handleNextLesson}
              disabled={currentLessonIndex === currentTopic.lessons.length - 1}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-700 transition-colors flex items-center gap-1"
              title="Bài học sau"
            >
              <span className="hidden sm:inline">Sau</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: 2 Dimension Layout (Dọc bên trái + Ngang bên phải) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
        {/* ===================================================================
            1. CỘT DỌC (LEFT SIDEBAR): DANH MỤC BÀI HỌC TRONG CHUYÊN ĐỀ
            Giúp bao quát lộ trình và không bị lạc
        =================================================================== */}
        <aside
          className={`${
            isLessonSidebarOpen ? 'w-72 sm:w-80 border-r' : 'w-0 border-r-0'
          } border-slate-200 bg-white flex flex-col flex-shrink-0 transition-all duration-200 sticky top-[105px] h-[calc(100vh-105px)] overflow-hidden z-20`}
        >
          {/* Sidebar Header: Current Topic Overview */}
          <div className="p-4 border-b border-slate-100 bg-[#FFF7F2]/50 flex-shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FF5C28] text-white font-black text-[10px] uppercase">
                CHUYÊN ĐỀ #{currentTopic.order < 10 ? `0${currentTopic.order}` : currentTopic.order}
              </span>
              <span className="text-[11px] font-bold text-[#FF5C28]">
                {currentLessonIndex + 1}/{currentTopic.lessons.length} bài
              </span>
            </div>

            <h3 className="text-sm font-black text-slate-900 mt-2 leading-snug line-clamp-2">
              {currentTopic.name}
            </h3>
            <span className="text-[11px] text-slate-500 font-semibold block mt-0.5 truncate">
              {currentTopic.nameEn}
            </span>

            {/* Topic Progress Bar */}
            <div className="mt-3">
              <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5C28] to-[#FF8C66] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      ((currentLessonIndex + 1) / (currentTopic.lessons.length || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Lessons Vertical List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1">
              Danh mục bài học
            </div>
            {currentTopic.lessons.map((lesson, idx) => {
              const isActive = lesson.id === currentLesson.id;
              return (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(currentTopic.id, lesson.id, activeTab)}
                  className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-[#FF5C28] text-white shadow-md shadow-[#FF5C28]/25 font-bold'
                      : 'hover:bg-slate-100 text-slate-700 font-semibold'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        isActive ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {lesson.title}
                    </div>
                    <div
                      className={`text-[11px] flex items-center gap-1.5 mt-1 ${
                        isActive ? 'text-orange-100' : 'text-slate-400'
                      }`}
                    >
                      <span>⏱️ {lesson.estimated_time || '20p'}</span>
                      <span>•</span>
                      <span className="uppercase">{lesson.cefr || currentTopic.cefr}</span>
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-white flex-shrink-0 self-center" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer: Quick Topic Switcher */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">
              Chuyển sang chuyên đề khác:
            </label>
            <select
              value={currentTopic.id}
              onChange={(e) => {
                const nextTop = topics.find((t) => t.id === e.target.value);
                if (nextTop && nextTop.lessons.length > 0) {
                  handleSelectLesson(nextTop.id, nextTop.lessons[0].id, 'theory');
                }
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-[#FF5C28]"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.order < 10 ? `0${t.order}` : t.order}. {t.name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* ===================================================================
            2. KHU VỰC NỘI DUNG (RIGHT WORKSPACE): NGANG
            Gồm tiêu đề tinh gọn và 4 Tab chuyển đổi ngang hiện đại
        =================================================================== */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Clean Lesson Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFF0E7] text-[#FF5C28] text-xs font-black uppercase">
                  Bài #{currentLessonIndex + 1}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                  {currentLesson.cefr || currentTopic.cefr}
                </span>
                <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentLesson.estimated_time || '20 phút'}</span>
                </span>
              </div>

              {/* Prev / Next Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex === 0}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Bài trước
                </button>
                <button
                  onClick={handleNextLesson}
                  disabled={currentLessonIndex === currentTopic.lessons.length - 1}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Bài sau →
                </button>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {currentLesson.title}
              </h1>
            </div>

            {/* HORIZONTAL 3 TABS SELECTOR (LÍ THUYẾT & VÍ DỤ GỘP VÀO 1 MỤC) */}
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'theory', label: '1. Lí Thuyết & Ví Dụ', icon: BookOpen, color: 'text-blue-600' },
                { id: 'exercises', label: '2. Bài Tập Thực Hành', icon: HelpCircle, color: 'text-emerald-600' },
                { id: 'exam', label: '3. Thi Online Đánh Giá', icon: Timer, color: 'text-purple-600' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        {/* =====================================================================
            TAB 1: LÍ THUYẾT & VÍ DỤ (2 KHUNG TEXT: TRÊN LÀ TÀI LIỆU, DƯỚI LÀ VÍ DỤ)
            TOÀN BỘ LÀ TEXT, KHÔNG CHIA KHỐI NHỎ HƠN NỮA
        ===================================================================== */}
        {activeTab === 'theory' && (() => {
          const { theory: theoryContent, examples: examplesContent } = getLessonTheoryAndExamples(currentLesson);

          return (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
              {/* KHUNG TRÊN: TÀI LIỆU LÝ THUYẾT */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">1. Tài Liệu Lý Thuyết</h2>
                    <span className="text-xs text-slate-400">
                      Bản chất, quy tắc và kiến thức trọng tâm bài học
                    </span>
                  </div>
                </div>

                <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-slate-200/80 whitespace-pre-line break-words">
                  {theoryContent || 'Chưa có nội dung tài liệu lý thuyết.'}
                </div>
              </div>

              {/* KHUNG DƯỚI: VÍ DỤ MINH HỌA */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">2. Ví Dụ Minh Họa</h2>
                    <span className="text-xs text-slate-400">
                      Các câu ví dụ thực tế minh họa cho kiến thức trên
                    </span>
                  </div>
                </div>

                <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium bg-[#FAF8F5] p-5 sm:p-6 rounded-2xl border border-slate-200/80 whitespace-pre-line break-words">
                  {examplesContent || 'Chưa có ví dụ minh họa.'}
                </div>
              </div>

              {/* Bottom Next Tab Action: Chuyển sang 2. Bài tập thực hành */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('exercises')}
                  className="px-5 py-2.5 bg-[#FF5C28] hover:bg-[#ea501e] text-white rounded-xl font-bold text-xs shadow-2xs flex items-center gap-2"
                >
                  <span>Chuyển sang 2. Bài tập thực hành</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* =====================================================================
            TAB 3: BÀI TẬP THỰC HÀNH (INTERACTIVE MULTIPLE CHOICE WITH EXPLANATIONS)
        ===================================================================== */}
        {activeTab === 'exercises' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
            {/* Multi-exercise tabs if >= 2 groups */}
            {exerciseGroups.length >= 2 && (
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Phần bài tập:
                </span>
                {exerciseGroups.map((grp, gIdx) => {
                  const isGrpActive = gIdx === selectedExerciseGroupIndex;
                  return (
                    <button
                      key={grp.id || gIdx}
                      onClick={() => {
                        setSelectedExerciseGroupIndex(gIdx);
                        setActiveExerciseIndex(0);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                        isGrpActive
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Bài {gIdx + 1}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                          isGrpActive ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {grp.questions.length} câu
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {exerciseGroups.length >= 2
                      ? `Bài Tập ${selectedExerciseGroupIndex + 1}: ${activeExerciseGroup?.title || ''}`
                      : 'Bài Tập Thực Hành Tương Tác'}
                  </h2>
                  <span className="text-xs text-slate-400">
                    {activeExerciseGroup?.description || 'Chọn đáp án, kiểm tra ngay và đọc giải thích ngữ pháp chi tiết'}
                  </span>
                </div>
              </div>

              {questionsList.length > 0 && (
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Câu {activeExerciseIndex + 1} / {questionsList.length}
                </span>
              )}
            </div>

            {questionsList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">Chưa có bài tập cho bài học này.</div>
            ) : currentQuestion ? (
              <div className="space-y-5">
                {/* Question Prompt */}
                <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 block mb-1">
                    Câu hỏi #{activeExerciseIndex + 1}
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {currentQuestion.prompt}
                  </p>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, oIdx) => {
                    const isSelected = exerciseAnswers[currentQuestion.id] === oIdx;
                    const isChecked = !!exerciseChecked[currentQuestion.id];
                    const isCorrect = oIdx === currentQuestion.correctAnswer;

                    let btnClass = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                    if (isSelected && !isChecked) {
                      btnClass = 'bg-[#FFF0E7] border-[#FF5C28] text-[#FF5C28] font-bold shadow-2xs';
                    } else if (isChecked) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnClass = 'bg-rose-50 border-rose-300 text-rose-700 font-bold';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={isChecked}
                        onClick={() =>
                          setExerciseAnswers((prev) => ({
                            ...prev,
                            [currentQuestion.id]: oIdx,
                          }))
                        }
                        className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isChecked && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        )}
                        {isChecked && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* MỤC GIẢI THÍCH ĐÁP ÁN */}
                {exerciseChecked[currentQuestion.id] && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Mục Giải Thích Đáp Án:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6 font-medium">
                      {currentQuestion.explanation || 'Chưa có lời giải thích chi tiết cho câu hỏi này.'}
                    </p>
                  </div>
                )}

                {/* Bottom Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {/* Check Answer Button */}
                    {!exerciseChecked[currentQuestion.id] ? (
                      <button
                        disabled={exerciseAnswers[currentQuestion.id] === undefined}
                        onClick={() => {
                          setExerciseChecked((prev) => ({
                            ...prev,
                            [currentQuestion.id]: true,
                          }));
                          if (exerciseAnswers[currentQuestion.id] === currentQuestion.correctAnswer) {
                            addXP(10);
                          }
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-2xs transition-colors"
                      >
                        Kiểm tra kết quả
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        <span>Đã hoàn thành câu này</span>
                      </span>
                    )}

                    {currentQuestion.hint && (
                      <button
                        onClick={() =>
                          setShowHint((prev) => ({
                            ...prev,
                            [currentQuestion.id]: !prev[currentQuestion.id],
                          }))
                        }
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        {showHint[currentQuestion.id] ? 'Ẩn gợi ý' : 'Xem gợi ý'}
                      </button>
                    )}
                  </div>

                  {/* Question Navigator */}
                  <div className="flex items-center gap-2">
                    <button
                      disabled={activeExerciseIndex === 0}
                      onClick={() => setActiveExerciseIndex((prev) => prev - 1)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Câu trước
                    </button>
                    {activeExerciseIndex < questionsList.length - 1 ? (
                      <button
                        onClick={() => setActiveExerciseIndex((prev) => prev + 1)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-2xs"
                      >
                        Câu tiếp theo →
                      </button>
                    ) : selectedExerciseGroupIndex < exerciseGroups.length - 1 ? (
                      <button
                        onClick={() => {
                          setSelectedExerciseGroupIndex((prev) => prev + 1);
                          setActiveExerciseIndex(0);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <span>Sang Bài {selectedExerciseGroupIndex + 2}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('exam')}
                        className="px-4 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5"
                      >
                        <span>Chuyển sang 3. Thi online</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {showHint[currentQuestion.id] && currentQuestion.hint && (
                  <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    💡 <strong>Gợi ý:</strong> {currentQuestion.hint}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* =====================================================================
            TAB 4: THI ONLINE (TIMED EXAM FOR THE LESSON)
        ===================================================================== */}
        {/* =====================================================================
            TAB 3: THI ONLINE (TIMED EXAM FOR THE LESSON)
        ===================================================================== */}
        {activeTab === 'exam' && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-150">
            {/* Multi-exam tabs if >= 2 exams */}
            {onlineExams.length >= 2 && (
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Đề thi:
                </span>
                {onlineExams.map((ex, eIdx) => {
                  const isExActive = eIdx === selectedOnlineExamIndex;
                  const totalQ = ex.sections.reduce((acc, s) => acc + s.questions.length, 0);
                  return (
                    <button
                      key={ex.id || eIdx}
                      onClick={() => {
                        setSelectedOnlineExamIndex(eIdx);
                        setLessonExamActive(false);
                        setLessonExamSubmitted(false);
                        setLessonExamScore(null);
                        setLessonExamAnswers({});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                        isExActive
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>Bài Online {eIdx + 1}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                          isExActive ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {totalQ} câu · {ex.durationMinutes}p
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {onlineExams.length >= 2
                      ? `Bài Online ${selectedOnlineExamIndex + 1}: ${activeOnlineExam?.title || ''}`
                      : (activeOnlineExam?.title || 'Thi Online Đánh Giá Bài Học')}
                  </h2>
                  <span className="text-xs text-slate-400">
                    Làm bài kiểm tra trắc nghiệm bấm giờ để kiểm tra mức độ hiểu sâu kiến thức
                  </span>
                </div>
              </div>

              {lessonExamActive && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-mono font-bold text-sm">
                  <Timer className="w-4 h-4 animate-spin" />
                  <span>{formatTimer(lessonExamTimeLeft)}</span>
                </div>
              )}
            </div>

            {/* State A: Before starting exam */}
            {!lessonExamActive && !lessonExamSubmitted && (
              <div className="py-8 text-center max-w-lg mx-auto space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-xs">
                  <Award className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900">
                    {activeOnlineExam?.title || 'Sẵn sàng cho bài kiểm tra bài học?'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Đề thi gồm <strong className="text-slate-800">{activeExamQuestions.length} câu hỏi</strong> trắc nghiệm, thời gian <strong className="text-slate-800">{activeOnlineExam?.durationMinutes || 10} phút</strong>. Đạt từ <strong className="text-purple-700">{activeOnlineExam?.passScore || Math.ceil((activeExamQuestions.length || 1) * 0.7)} câu</strong> trở lên để nhận huy hiệu hoàn thành bài học và XP!
                  </p>
                </div>

                {/* Sub-exercises / sections breakdown if >= 2 sections */}
                {activeOnlineExam && activeOnlineExam.sections.length >= 2 && (
                  <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-left text-xs space-y-2">
                    <div className="font-bold text-purple-900">
                      Cấu trúc đề thi gồm {activeOnlineExam.sections.length} phần bài tập:
                    </div>
                    <div className="space-y-1.5">
                      {activeOnlineExam.sections.map((sec, sIdx) => (
                        <div
                          key={sec.id || sIdx}
                          className="flex items-center justify-between text-slate-700 bg-white/90 px-3 py-2 rounded-xl border border-purple-100/70 shadow-2xs"
                        >
                          <div>
                            <span className="font-black text-purple-700 mr-2">Bài {sIdx + 1}:</span>
                            <span className="font-bold text-slate-800">{sec.title || `Phần ${sIdx + 1}`}</span>
                            {sec.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{sec.description}</p>
                            )}
                          </div>
                          <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 text-[11px] flex-shrink-0">
                            {sec.questions.length} câu
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLessonExamStart}
                  disabled={activeExamQuestions.length === 0}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-md transition-all transform hover:scale-[1.02]"
                >
                  Bắt Đầu Làm Bài Thi Ngay
                </button>
              </div>
            )}

            {/* State B: Exam in progress */}
            {lessonExamActive && (
              <div className="space-y-6">
                <div className="space-y-6">
                  {activeOnlineExam &&
                    activeOnlineExam.sections.map((sec, sIdx) => (
                      <div key={sec.id || sIdx} className="space-y-4">
                        {activeOnlineExam.sections.length >= 2 && (
                          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                            <span className="px-2.5 py-0.5 rounded-lg bg-purple-600 text-white text-xs font-black">
                              Bài {sIdx + 1} trong đề
                            </span>
                            <div>
                              <h4 className="text-xs sm:text-sm font-black text-purple-950">
                                {sec.title || `Phần ${sIdx + 1}`}
                              </h4>
                              {sec.description && (
                                <p className="text-[11px] text-purple-800">{sec.description}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {sec.questions.map((q, qIdx) => {
                          const globalIdx = activeExamQuestions.findIndex((item) => item.id === q.id);
                          const displayIdx = globalIdx >= 0 ? globalIdx + 1 : qIdx + 1;
                          return (
                            <div
                              key={q.id}
                              className="p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                                  Câu {displayIdx}
                                </span>
                              </div>
                              <p className="text-sm sm:text-base font-bold text-slate-900">{q.prompt}</p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = lessonExamAnswers[q.id] === oIdx;
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() =>
                                        setLessonExamAnswers((prev) => ({
                                          ...prev,
                                          [q.id]: oIdx,
                                        }))
                                      }
                                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                                        isSelected
                                          ? 'bg-purple-600 border-purple-600 text-white font-bold shadow-2xs'
                                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Đã trả lời {Object.keys(lessonExamAnswers).length}/{activeExamQuestions.length} câu
                  </span>
                  <button
                    onClick={handleLessonExamSubmit}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Nộp Bài Thi
                  </button>
                </div>
              </div>
            )}

            {/* State C: Exam results */}
            {lessonExamSubmitted && lessonExamScore !== null && (() => {
              const passTarget = activeOnlineExam?.passScore || Math.ceil((activeExamQuestions.length || 1) * 0.7);
              const isPassed = lessonExamScore >= passTarget;
              return (
                <div className="py-8 space-y-6 text-center max-w-xl mx-auto">
                  <div
                    className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xs ${
                      isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {isPassed ? 'Chúc Mừng! Bạn Đã Đạt Bài Thi' : 'Chưa Đạt Yêu Cầu Bài Thi'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Bạn đã trả lời đúng <strong className="text-slate-800">{lessonExamScore}</strong> / {activeExamQuestions.length} câu hỏi (Mục tiêu đạt: {passTarget} câu)
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-slate-200 flex items-center justify-center gap-6">
                    <div>
                      <div
                        className={`text-2xl font-black ${
                          isPassed ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {Math.round((lessonExamScore / (activeExamQuestions.length || 1)) * 100)}%
                      </div>
                      <div className="text-xs text-slate-500 font-bold">Điểm số</div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-200" />
                    <div>
                      <div className="text-2xl font-black text-amber-500">+{lessonExamScore * 15} XP</div>
                      <div className="text-xs text-slate-500 font-bold">Kinh nghiệm</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={handleLessonExamStart}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
                    >
                      Làm lại bài thi
                    </button>
                    <button
                      onClick={handleNextLesson}
                      className="px-5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white text-xs font-bold shadow-2xs"
                    >
                      Chuyển sang bài tiếp theo →
                    </button>
                  </div>

                  {/* Chi tiết bài thi & Mục Giải Thích Đáp Án từng câu */}
                  <div className="pt-6 border-t border-slate-200 text-left space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <span>Xem Lại Bài Thi & Giải Thích Đáp Án Từng Câu:</span>
                      </h4>
                      <span className="text-xs font-bold text-slate-500">
                        {activeExamQuestions.length} câu hỏi
                      </span>
                    </div>

                    <div className="space-y-4">
                      {activeExamQuestions.map((q, qIdx) => {
                        const userChoice = lessonExamAnswers[q.id];
                        const isCorrect = userChoice === q.correctAnswer;
                        return (
                          <div
                            key={q.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isCorrect
                                ? 'bg-emerald-50/30 border-emerald-200'
                                : 'bg-rose-50/30 border-rose-200'
                            }`}
                          >
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-xs font-black text-slate-600 bg-white border border-slate-200">
                                  Câu {qIdx + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase ${
                                    isCorrect
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isCorrect ? '✓ Trả lời đúng' : '✗ Trả lời sai'}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm font-bold text-slate-900 mt-2">{q.prompt}</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                              {q.options.map((opt, oIdx) => {
                                const isThisCorrect = oIdx === q.correctAnswer;
                                const isThisUser = oIdx === userChoice;
                                let btnStyle = 'bg-white border-slate-200 text-slate-700';
                                if (isThisCorrect) {
                                  btnStyle = 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900 shadow-2xs';
                                } else if (isThisUser && !isThisCorrect) {
                                  btnStyle = 'bg-rose-50 border-rose-300 font-bold text-rose-800';
                                }
                                return (
                                  <div
                                    key={oIdx}
                                    className={`px-3 py-2 rounded-xl border flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>
                                      {String.fromCharCode(65 + oIdx)}. {opt}
                                    </span>
                                    {isThisCorrect && (
                                      <span className="text-[11px] font-bold text-emerald-700">✓ Đáp án đúng</span>
                                    )}
                                    {isThisUser && !isThisCorrect && (
                                      <span className="text-[11px] font-bold text-rose-600">✗ Bạn chọn</span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* MỤC GIẢI THÍCH ĐÁP ÁN */}
                            <div className="mt-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-1">
                              <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>Mục Giải Thích Đáp Án:</span>
                              </div>
                              <p className="text-slate-700 pl-5 leading-relaxed font-medium">
                                {q.explanation?.trim()
                                  ? q.explanation
                                  : 'Đáp án được xác định theo quy tắc ngữ pháp bài học.'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

          {/* Bottom Pagination Strip */}
          <div className="pt-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-600">
            <button
              onClick={handlePrevLesson}
              disabled={currentLessonIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bài trước</span>
            </button>

            <span className="text-slate-400">
              Bài {currentLessonIndex + 1} / {currentTopic.lessons.length} • {currentTopic.name}
            </span>

            <button
              onClick={handleNextLesson}
              disabled={currentLessonIndex === currentTopic.lessons.length - 1}
              className="px-4 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span>Bài tiếp theo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>

      {/* Floating Robot Mascot Tip */}
      <div className="fixed bottom-6 right-6 z-30 flex items-end gap-3">
        {isRobotBubbleOpen && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-lg max-w-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#FF5C28]">
                💡 Mẹo học: {currentLesson.title}
              </span>
              <button
                onClick={() => setIsRobotBubbleOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Nắm chắc lý thuyết và xem ví dụ trước khi làm bài tập để ghi nhớ bản chất ngữ pháp sâu hơn nhé!
            </p>
          </div>
        )}
        <button
          onClick={() => setIsRobotBubbleOpen(!isRobotBubbleOpen)}
          className="cursor-pointer hover:scale-105 transition-transform"
          title="Bật/tắt lời khuyên học tập"
        >
          <VocaRobotMascot size={70} expression="happy" />
        </button>
      </div>
    </div>
  );
}
