'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Copy,
  EyeOff,
  MoveUp,
  MoveDown,
  Sparkles,
  Volume2,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  Award,
  AlertTriangle,
  FileText,
  Table,
  Check,
  PanelLeftClose,
  PanelLeft,
  Folder,
  FolderOpen,
  Edit2,
  RotateCcw,
  Layers,
  Settings,
  Play,
  CheckCircle,
  Split,
  ListOrdered,
  Tag,
  Timer,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ListFilter,
  CheckSquare,
  Lightbulb,
} from 'lucide-react';
import {
  GrammarLesson,
  TheoryBlock,
  TheoryBlockType,
  LessonExample,
  BankQuestion,
  ExamSettings,
  CefrLevel,
  GrammarTopic,
  ExerciseGroup,
  OnlineExamSection,
  OnlineExamItem,
} from '@/types/grammarSystem';
import { speakText } from '@/lib/tts';
import { QuestionBankModal } from './QuestionBankModal';
import { ExamCenterModal } from './ExamCenterModal';
import { AiImportModal } from './AiImportModal';
import { addQuestionToBank } from '@/lib/questionBankStorage';
import {
  createEmptyLessonDraft,
  deleteLessonFromTopic,
  saveLessonToTopic,
  normalizeLessonExerciseGroups,
  normalizeLessonOnlineExams,
} from '@/lib/grammarCourseStorage';

interface LessonEditorViewProps {
  topicId: string;
  topicName: string;
  lesson: GrammarLesson;
  allLessonsInTopic?: GrammarLesson[];
  allTopics?: GrammarTopic[];
  onBackToTopic: () => void;
  onSaveLesson: (updated: GrammarLesson) => void;
  onSwitchLesson?: (lessonId: string) => void;
  onSwitchTopic?: (topicId: string) => void;
  onRefresh?: () => void;
}

export const LessonEditorView: React.FC<LessonEditorViewProps> = ({
  topicId,
  topicName,
  lesson,
  allLessonsInTopic,
  allTopics,
  onBackToTopic,
  onSaveLesson,
  onSwitchLesson,
  onSwitchTopic,
  onRefresh,
}) => {
  // 3 TABS ENFORCEMENT PER SPEC (THEORY & EXAMPLES MERGED):
  // 1. Lí Thuyết & Ví Dụ
  // 2. Bài Tập Thực Hành
  // 3. Thi Online Đánh Giá
  const [activeTab, setActiveTab] = useState<'theory' | 'exercises' | 'exam'>('theory');

  // Left sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Working copy of the lesson
  const [formData, setFormData] = useState<GrammarLesson>(() => JSON.parse(JSON.stringify(lesson)));
  const [hasChanges, setHasChanges] = useState(false);

  // Modals
  const [isQuestionBankPickerOpen, setIsQuestionBankPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<
    | { type: 'exercise'; groupId: string }
    | { type: 'exam'; examId: string; sectionId: string }
    | null
  >(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [testingExam, setTestingExam] = useState<OnlineExamItem | null>(null);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);

  // Multi-exercise states
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroup[]>(() =>
    normalizeLessonExerciseGroups(lesson)
  );
  const [activeExerciseGroupIndex, setActiveExerciseGroupIndex] = useState<number>(0);
  const [editingExerciseQuestionState, setEditingExerciseQuestionState] = useState<{
    groupId: string;
    questionId: string;
  } | null>(null);

  // Multi-online exam states
  const [onlineExams, setOnlineExams] = useState<OnlineExamItem[]>(() =>
    normalizeLessonOnlineExams(lesson)
  );
  const [activeExamIndex, setActiveExamIndex] = useState<number>(0);
  const [activeExamSectionIndex, setActiveExamSectionIndex] = useState<number>(0);
  const [editingExamQuestionState, setEditingExamQuestionState] = useState<{
    examId: string;
    sectionId: string;
    questionId: string;
  } | null>(null);

  // Collapsed states for compact layout: Questions, Exercise Groups, Online Exams & Sub-sections
  const [collapsedQuestionIds, setCollapsedQuestionIds] = useState<Record<string, boolean>>({});
  const [collapsedGroupMeta, setCollapsedGroupMeta] = useState<Record<string, boolean>>({});
  const [collapsedExamConfig, setCollapsedExamConfig] = useState<Record<string, boolean>>({});
  const [collapsedSectionMeta, setCollapsedSectionMeta] = useState<Record<string, boolean>>({});

  const toggleQuestionCollapse = (id: string) => {
    setCollapsedQuestionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setAllQuestionsCollapse = (questionIds: string[], shouldCollapse: boolean) => {
    setCollapsedQuestionIds((prev) => {
      const next = { ...prev };
      questionIds.forEach((id) => {
        next[id] = shouldCollapse;
      });
      return next;
    });
  };

  const toggleGroupMetaCollapse = (groupId: string) => {
    setCollapsedGroupMeta((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleExamConfigCollapse = (examId: string) => {
    setCollapsedExamConfig((prev) => ({
      ...prev,
      [examId]: !prev[examId],
    }));
  };

  const toggleSectionMetaCollapse = (sectionId: string) => {
    setCollapsedSectionMeta((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const markDirty = () => setHasChanges(true);

  // =========================================================================
  // 1. TỐI ƯU HÓA HOÀN TOÀN THÀNH 2 KHUNG TEXT: TRÊN LÀ TÀI LIỆU, DƯỚI LÀ VÍ DỤ
  // (2 KHUNG ĐỀU NHẬP TEXT, KO CHIA KHỐI NHỎ HƠN NỮA)
  // =========================================================================

  // Trích xuất văn bản từ bài học ra 2 phần: Tài liệu (trên) và Ví dụ (dưới)
  const extractTextsFromLesson = (lessonData: GrammarLesson) => {
    let theory = '';
    let examples = '';

    // 1. Examples từ lessonData.examples
    if (lessonData.examples && lessonData.examples.length > 0) {
      examples = lessonData.examples
        .map((ex) => `• ${ex.en}${ex.vi ? `\n  (${ex.vi})` : ''}`)
        .join('\n\n');
    }

    // 2. Theory từ lessonData.theoryBlocks
    if (lessonData.theoryBlocks && lessonData.theoryBlocks.length > 0) {
      const docParts: string[] = [];
      const exParts: string[] = [];
      let isUnderExample = false;

      lessonData.theoryBlocks.forEach((b) => {
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

      theory = docParts.join('\n\n').trim();
      if (exParts.length > 0) {
        const extraEx = exParts.join('\n\n').trim();
        examples = examples ? `${examples}\n\n${extraEx}` : extraEx;
      }
    }

    return { theory, examples };
  };

  // Tự động chuẩn hóa văn bản, xuống hàng theo từng mục rõ ràng ("hàng nào ra hàng đó")
  const autoFormatTextLines = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // 1. Loại bỏ watermark / số trang
    text = text.replace(/Page:\s*Tài Liệu Khóa Học Hay Miễn Phí[^\n]*/gi, '');

    // 2. Tự động xuống dòng trước các mục La Mã lớn: I., II., III., IV., V., VI.,...
    text = text.replace(/([^\n])\s+([IVXLCDM]+\.\s+[A-ZÀ-Ỹ0-9])/g, '$1\n\n$2');

    // 3. Tự động xuống dòng trước các tiêu đề lớn như PRACTICE, BÀI TẬP, LUYỆN TẬP
    text = text.replace(/([^\n])\s+(PRACTICE|BÀI TẬP|LUYỆN TẬP|VÍ DỤ:)/gi, '$1\n\n$2');

    // 4. Tự động xuống dòng trước các dấu gạch đầu dòng hoặc dấu chấm tròn: •, -, +
    text = text.replace(/([^\n])\s+([•\-+]\s+)/g, '$1\n$2');

    // 5. Tự động xuống dòng trước các câu hỏi/mục đánh số: 1., 2., 3.,... sau dấu chấm/kết thúc câu
    text = text.replace(/([.!?\):…])\s+(\d+\.\s+[A-ZÀ-Ỹa-z0-9])/g, '$1\n\n$2');

    // 6. Tự động xuống dòng trước các tiểu mục chữ cái: a), b), c), d)
    text = text.replace(/([.!?\):…])\s+([a-d]\)\s+)/gi, '$1\n$2');

    // 7. Chuẩn hóa khoảng trống thừa: không quá 2 dòng trống liên tiếp
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    return text;
  };

  // Đồng bộ 2 khung text + Bài tập + Thi online vào cấu trúc GrammarLesson
  const syncLessonData = (
    prev: GrammarLesson,
    tText: string,
    eText: string,
    currentExGroups = exerciseGroups,
    currentOnlineExams = onlineExams
  ): GrammarLesson => {
    // Khung Trên: 1 khối duy nhất cho Tài Liệu (KHÔNG CHIA KHỐI NHỎ HƠN NỮA)
    const blocks: TheoryBlock[] = [];
    if (tText.trim()) {
      blocks.push({
        id: `tb-theory-main`,
        type: 'paragraph',
        content: tText.trim(),
        order: 1,
        isHidden: false,
      });
    }

    // Khung Dưới: Parse các câu ví dụ cho phát âm TTS
    const parsedExamples: LessonExample[] = [];
    if (eText.trim()) {
      const chunks = eText.trim().split(/\n\n+/).filter(Boolean);
      chunks.forEach((chunk, i) => {
        const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0) {
          const en = lines[0].replace(/^[•\-*]\s*/, '');
          const vi = lines.length > 1 ? lines[1].replace(/^\(?|\)?$/g, '').trim() : '';
          parsedExamples.push({
            id: `ex-${Date.now()}-${i + 1}`,
            en,
            vi,
          });
        }
      });
    }

    const allExerciseQuestions = currentExGroups.flatMap((g) => g.questions);
    const primaryExam = currentOnlineExams[0];
    const allOnlineQuestions = currentOnlineExams.flatMap((e) =>
      e.sections.flatMap((s) => s.questions)
    );
    const examSettings: ExamSettings = {
      status: currentOnlineExams.some((e) => e.status === 'READY') ? 'READY' : 'NOT_CREATED',
      durationMinutes: primaryExam?.durationMinutes || 10,
      passScore: primaryExam?.passScore || 1,
      totalQuestions: allOnlineQuestions.length,
      questionIds: allOnlineQuestions.map((q) => q.id),
    };

    return {
      ...prev,
      theoryBlocks: blocks,
      examples: parsedExamples,
      questions: allExerciseQuestions,
      exerciseGroups: currentExGroups,
      onlineExams: currentOnlineExams,
      examSettings,
    };
  };

  // State 2 khung text: Khung trên là Tài Liệu, Khung dưới là Ví Dụ
  const [theoryText, setTheoryText] = useState<string>(() => {
    const { theory } = extractTextsFromLesson(lesson);
    return theory;
  });
  const [examplesText, setExamplesText] = useState<string>(() => {
    const { examples } = extractTextsFromLesson(lesson);
    return examples;
  });
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Đồng bộ khi đổi bài học
  React.useEffect(() => {
    const freshData = JSON.parse(JSON.stringify(lesson));
    setFormData(freshData);
    const { theory, examples } = extractTextsFromLesson(freshData);
    setTheoryText(theory);
    setExamplesText(examples);

    const normGroups = normalizeLessonExerciseGroups(freshData);
    setExerciseGroups(normGroups);
    setActiveExerciseGroupIndex(0);

    const normExams = normalizeLessonOnlineExams(freshData);
    setOnlineExams(normExams);
    setActiveExamIndex(0);
    setActiveExamSectionIndex(0);

    setEditingExerciseQuestionState(null);
    setEditingExamQuestionState(null);
    setHasChanges(false);
  }, [lesson.id]);

  const handleTheoryChange = (newTheory: string) => {
    setTheoryText(newTheory);
    setFormData((prev) => syncLessonData(prev, newTheory, examplesText, exerciseGroups, onlineExams));
    markDirty();
  };

  const handleExamplesChange = (newExamples: string) => {
    setExamplesText(newExamples);
    setFormData((prev) => syncLessonData(prev, theoryText, newExamples, exerciseGroups, onlineExams));
    markDirty();
  };

  const handleAutoFormatTheory = () => {
    const formatted = autoFormatTextLines(theoryText);
    setTheoryText(formatted);
    setFormData((prev) => syncLessonData(prev, formatted, examplesText, exerciseGroups, onlineExams));
    markDirty();
  };

  const handleInsertExampleSnippet = () => {
    const snippet = '• She usually walks to work every morning.\n  (Cô ấy thường đi bộ đi làm vào mỗi buổi sáng.)';
    const updated = examplesText.trim() ? `${examplesText}\n\n${snippet}` : snippet;
    setExamplesText(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, updated, exerciseGroups, onlineExams));
    markDirty();
  };

  const handleSave = () => {
    const synced = syncLessonData(formData, theoryText, examplesText, exerciseGroups, onlineExams);
    onSaveLesson(synced);
    setFormData(synced);
    setHasChanges(false);
  };

  // =========================================================================
  // 2. TAB: BÀI TẬP THỰC HÀNH (MULTI-EXERCISE GROUPS MANAGEMENT)
  // Quy tắc: Từ 2 bài tập thì đánh Bài 1, Bài 2... Còn 1 bài thì hiển thị như bình thường
  // =========================================================================

  const handleAddExerciseGroup = () => {
    const nextNum = exerciseGroups.length + 1;
    const newGroup: ExerciseGroup = {
      id: `eg-${Date.now()}`,
      title: `Bài ${nextNum}`,
      description: '',
      questions: [],
    };
    const updated = [...exerciseGroups, newGroup];
    setExerciseGroups(updated);
    setActiveExerciseGroupIndex(updated.length - 1);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleRemoveExerciseGroup = (groupId: string) => {
    if (exerciseGroups.length <= 1) {
      alert('Bài học phải có ít nhất 1 bài tập!');
      return;
    }
    const target = exerciseGroups.find((g) => g.id === groupId);
    if (!confirm(`Bạn có chắc muốn xóa "${target?.title || 'bài tập này'}" và toàn bộ câu hỏi bên trong?`)) {
      return;
    }
    const updated = exerciseGroups.filter((g) => g.id !== groupId);
    setExerciseGroups(updated);
    setActiveExerciseGroupIndex((prev) => Math.min(prev, updated.length - 1));
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleRenameExerciseGroup = (groupId: string, newTitle: string) => {
    const updated = exerciseGroups.map((g) =>
      g.id === groupId ? { ...g, title: newTitle } : g
    );
    setExerciseGroups(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleUpdateExerciseGroupDesc = (groupId: string, newDesc: string) => {
    const updated = exerciseGroups.map((g) =>
      g.id === groupId ? { ...g, description: newDesc } : g
    );
    setExerciseGroups(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleDuplicateExerciseGroup = (groupId: string) => {
    const target = exerciseGroups.find((g) => g.id === groupId);
    if (!target) return;
    const nextNum = exerciseGroups.length + 1;
    const duplicated: ExerciseGroup = {
      id: `eg-${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      description: target.description,
      questions: target.questions.map((q, idx) => ({
        ...q,
        id: `qb-clone-${Date.now()}-${idx + 1}`,
      })),
    };
    const updated = [...exerciseGroups, duplicated];
    setExerciseGroups(updated);
    setActiveExerciseGroupIndex(updated.length - 1);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleAddNewQuestionToGroup = (groupId: string) => {
    const newQData = {
      prompt: 'Choose the correct answer: He ________ football on weekends.',
      options: ['play', 'plays', 'is play', 'playing'],
      correctAnswer: 1,
      explanation: 'Chủ ngữ ngôi thứ 3 số ít "He" trong Hiện tại đơn thêm -s (plays).',
      topicId,
      lessonId: formData.id,
      difficulty: 'easy' as const,
      cefr: formData.cefr,
      usageTags: ['lesson_exercise' as const, 'topic_exam' as const],
    };

    const { question } = addQuestionToBank(newQData);

    const updated = exerciseGroups.map((g) =>
      g.id === groupId ? { ...g, questions: [...g.questions, question] } : g
    );
    setExerciseGroups(updated);
    setEditingExerciseQuestionState({ groupId, questionId: question.id });
    setCollapsedQuestionIds((prev) => ({ ...prev, [question.id]: false }));
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleRemoveQuestionFromGroup = (groupId: string, questionId: string) => {
    const updated = exerciseGroups.map((g) =>
      g.id === groupId
        ? { ...g, questions: g.questions.filter((q) => q.id !== questionId) }
        : g
    );
    setExerciseGroups(updated);
    if (editingExerciseQuestionState?.questionId === questionId) {
      setEditingExerciseQuestionState(null);
    }
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleUpdateQuestionInGroup = (
    groupId: string,
    questionId: string,
    patch: Partial<BankQuestion>
  ) => {
    const updated = exerciseGroups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            questions: g.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
          }
        : g
    );
    setExerciseGroups(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleDuplicateQuestionInGroup = (groupId: string, questionId: string) => {
    const group = exerciseGroups.find((g) => g.id === groupId);
    const targetQ = group?.questions.find((q) => q.id === questionId);
    if (!targetQ) return;

    const cloned: BankQuestion = {
      ...targetQ,
      id: `qb-qclone-${Date.now()}`,
      prompt: `${targetQ.prompt} (Bản sao)`,
    };

    const updated = exerciseGroups.map((g) =>
      g.id === groupId ? { ...g, questions: [...g.questions, cloned] } : g
    );
    setExerciseGroups(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  const handleMoveQuestionInGroup = (
    groupId: string,
    qIdx: number,
    direction: 'up' | 'down'
  ) => {
    const group = exerciseGroups.find((g) => g.id === groupId);
    if (!group) return;
    const targetIdx = direction === 'up' ? qIdx - 1 : qIdx + 1;
    if (targetIdx < 0 || targetIdx >= group.questions.length) return;

    const newQuestions = [...group.questions];
    const [moved] = newQuestions.splice(qIdx, 1);
    newQuestions.splice(targetIdx, 0, moved);

    const updated = exerciseGroups.map((g) =>
      g.id === groupId ? { ...g, questions: newQuestions } : g
    );
    setExerciseGroups(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
    markDirty();
  };

  // =========================================================================
  // 3. TAB: THI ONLINE (MULTI-ONLINE EXAMS & MULTI-SECTIONS MANAGEMENT)
  // Quy tắc: Có thể có nhiều bài online, trong 1 bài online có nhiều bài nhỏ (sections)
  // =========================================================================

  const handleAddOnlineExam = () => {
    const nextNum = onlineExams.length + 1;
    const newExam: OnlineExamItem = {
      id: `oe-${Date.now()}`,
      title: `Bài Online ${nextNum}`,
      durationMinutes: 10,
      passScore: 1,
      status: 'DRAFT',
      sections: [
        {
          id: `oes-${Date.now()}-1`,
          title: 'Bài 1',
          description: '',
          questions: [],
        },
      ],
    };
    const updated = [...onlineExams, newExam];
    setOnlineExams(updated);
    setActiveExamIndex(updated.length - 1);
    setActiveExamSectionIndex(0);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleRemoveOnlineExam = (examId: string) => {
    if (onlineExams.length <= 1) {
      alert('Phải giữ lại ít nhất 1 bài online!');
      return;
    }
    const target = onlineExams.find((e) => e.id === examId);
    if (!confirm(`Bạn có chắc muốn xóa "${target?.title || 'bài online này'}"?`)) return;
    const updated = onlineExams.filter((e) => e.id !== examId);
    setOnlineExams(updated);
    setActiveExamIndex((prev) => Math.min(prev, updated.length - 1));
    setActiveExamSectionIndex(0);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleUpdateOnlineExam = (examId: string, patch: Partial<OnlineExamItem>) => {
    const updated = onlineExams.map((e) => (e.id === examId ? { ...e, ...patch } : e));
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleAddSectionToExam = (examId: string) => {
    const exam = onlineExams.find((e) => e.id === examId);
    if (!exam) return;
    const nextSecNum = exam.sections.length + 1;
    const newSec: OnlineExamSection = {
      id: `oes-${Date.now()}`,
      title: `Bài ${nextSecNum}`,
      description: '',
      questions: [],
    };
    const updated = onlineExams.map((e) =>
      e.id === examId ? { ...e, sections: [...e.sections, newSec] } : e
    );
    setOnlineExams(updated);
    setActiveExamSectionIndex(exam.sections.length);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleRemoveSectionFromExam = (examId: string, sectionId: string) => {
    const exam = onlineExams.find((e) => e.id === examId);
    if (!exam) return;
    if (exam.sections.length <= 1) {
      alert('Bài online phải có ít nhất 1 phần/bài nhỏ!');
      return;
    }
    const target = exam.sections.find((s) => s.id === sectionId);
    if (!confirm(`Bạn có chắc muốn xóa phần "${target?.title || 'này'}"?`)) return;

    const updated = onlineExams.map((e) =>
      e.id === examId
        ? { ...e, sections: e.sections.filter((s) => s.id !== sectionId) }
        : e
    );
    setOnlineExams(updated);
    setActiveExamSectionIndex((prev) => Math.max(0, prev - 1));
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleUpdateSectionInExam = (
    examId: string,
    sectionId: string,
    patch: Partial<OnlineExamSection>
  ) => {
    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) => (s.id === sectionId ? { ...s, ...patch } : s)),
          }
        : e
    );
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleDuplicateSectionInExam = (examId: string, sectionId: string) => {
    const exam = onlineExams.find((e) => e.id === examId);
    if (!exam) return;
    const target = exam.sections.find((s) => s.id === sectionId);
    if (!target) return;
    const nextSecNum = exam.sections.length + 1;
    const duplicatedSec: OnlineExamSection = {
      ...target,
      id: `oes-${Date.now()}`,
      title: `${target.title || `Bài ${nextSecNum}`} (Bản sao)`,
      questions: target.questions.map((q) => ({
        ...q,
        id: `q-exam-dup-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      })),
    };
    const updated = onlineExams.map((e) =>
      e.id === examId ? { ...e, sections: [...e.sections, duplicatedSec] } : e
    );
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleAddNewQuestionToExamSection = (examId: string, sectionId: string) => {
    const newQData = {
      prompt: 'Online Exam Question: Choose the correct option to fill in the blank.',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'Giải thích câu hỏi thi online chi tiết.',
      topicId,
      lessonId: formData.id,
      difficulty: 'medium' as const,
      cefr: formData.cefr,
      usageTags: ['lesson_exam' as const, 'topic_exam' as const],
    };

    const { question } = addQuestionToBank(newQData);

    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) =>
              s.id === sectionId ? { ...s, questions: [...s.questions, question] } : s
            ),
          }
        : e
    );
    setOnlineExams(updated);
    setEditingExamQuestionState({ examId, sectionId, questionId: question.id });
    setCollapsedQuestionIds((prev) => ({ ...prev, [question.id]: false }));
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleRemoveQuestionFromExamSection = (
    examId: string,
    sectionId: string,
    questionId: string
  ) => {
    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) =>
              s.id === sectionId
                ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
                : s
            ),
          }
        : e
    );
    setOnlineExams(updated);
    if (editingExamQuestionState?.questionId === questionId) {
      setEditingExamQuestionState(null);
    }
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleUpdateQuestionInExamSection = (
    examId: string,
    sectionId: string,
    questionId: string,
    patch: Partial<BankQuestion>
  ) => {
    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) =>
              s.id === sectionId
                ? {
                    ...s,
                    questions: s.questions.map((q) =>
                      q.id === questionId ? { ...q, ...patch } : q
                    ),
                  }
                : s
            ),
          }
        : e
    );
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleDuplicateQuestionInExamSection = (
    examId: string,
    sectionId: string,
    questionId: string
  ) => {
    const exam = onlineExams.find((e) => e.id === examId);
    const section = exam?.sections.find((s) => s.id === sectionId);
    const targetQ = section?.questions.find((q) => q.id === questionId);
    if (!targetQ) return;

    const cloned: BankQuestion = {
      ...targetQ,
      id: `qb-examclone-${Date.now()}`,
      prompt: `${targetQ.prompt} (Bản sao)`,
    };

    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) =>
              s.id === sectionId ? { ...s, questions: [...s.questions, cloned] } : s
            ),
          }
        : e
    );
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleMoveQuestionInExamSection = (
    examId: string,
    sectionId: string,
    qIdx: number,
    direction: 'up' | 'down'
  ) => {
    const exam = onlineExams.find((e) => e.id === examId);
    const section = exam?.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const targetIdx = direction === 'up' ? qIdx - 1 : qIdx + 1;
    if (targetIdx < 0 || targetIdx >= section.questions.length) return;

    const newQuestions = [...section.questions];
    const [moved] = newQuestions.splice(qIdx, 1);
    newQuestions.splice(targetIdx, 0, moved);

    const updated = onlineExams.map((e) =>
      e.id === examId
        ? {
            ...e,
            sections: e.sections.map((s) =>
              s.id === sectionId ? { ...s, questions: newQuestions } : s
            ),
          }
        : e
    );
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
  };

  const handleGenerateExamFromExercises = (examId: string) => {
    const allExQuestions = exerciseGroups.flatMap((g) => g.questions);
    if (allExQuestions.length === 0) {
      alert('Chưa có câu hỏi nào trong mục Bài Tập. Vui lòng thêm câu hỏi vào Bài Tập trước!');
      return;
    }
    const updated = onlineExams.map((e) => {
      if (e.id !== examId) return e;
      const updatedSections = e.sections.map((s, idx) => {
        if (idx === 0) {
          return {
            ...s,
            questions: [...allExQuestions],
          };
        }
        return s;
      });
      return {
        ...e,
        status: 'READY' as const,
        passScore: Math.max(1, Math.floor(allExQuestions.length * 0.7)),
        sections: updatedSections,
      };
    });
    setOnlineExams(updated);
    setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
    markDirty();
    alert(`Đã tự động nạp ${allExQuestions.length} câu hỏi từ Bài Tập vào đề thi này!`);
  };

  // Nhận câu hỏi được chọn từ Question Bank Modal
  const handleAddPickedQuestion = (pickedQuestion: BankQuestion) => {
    if (!pickerTarget) return;

    if (pickerTarget.type === 'exercise') {
      const group = exerciseGroups.find((g) => g.id === pickerTarget.groupId);
      if (group?.questions.some((q) => q.id === pickedQuestion.id)) {
        alert('Câu hỏi này đã có trong bài tập này!');
        return;
      }
      const updated = exerciseGroups.map((g) =>
        g.id === pickerTarget.groupId
          ? { ...g, questions: [...g.questions, pickedQuestion] }
          : g
      );
      setExerciseGroups(updated);
      setFormData((prev) => syncLessonData(prev, theoryText, examplesText, updated, onlineExams));
      markDirty();
    } else if (pickerTarget.type === 'exam') {
      const exam = onlineExams.find((e) => e.id === pickerTarget.examId);
      const section = exam?.sections.find((s) => s.id === pickerTarget.sectionId);
      if (section?.questions.some((q) => q.id === pickedQuestion.id)) {
        alert('Câu hỏi này đã có trong phần thi này!');
        return;
      }
      const updated = onlineExams.map((e) =>
        e.id === pickerTarget.examId
          ? {
              ...e,
              sections: e.sections.map((s) =>
                s.id === pickerTarget.sectionId
                  ? { ...s, questions: [...s.questions, pickedQuestion] }
                  : s
              ),
            }
          : e
      );
      setOnlineExams(updated);
      setFormData((prev) => syncLessonData(prev, theoryText, examplesText, exerciseGroups, updated));
      markDirty();
    }

    setIsQuestionBankPickerOpen(false);
    setPickerTarget(null);
  };

  const handleDeleteCurrentLesson = () => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn bài học "${formData.title}" khỏi chuyên đề?\nThao tác này không thể hoàn tác!`
      )
    ) {
      deleteLessonFromTopic(topicId, formData.id);
      if (onRefresh) onRefresh();
      onBackToTopic();
    }
  };

  const handleCreateLessonInSidebar = () => {
    const nextOrder = (allLessonsInTopic?.length || 0) + 1;
    const newLesson = createEmptyLessonDraft(topicId, nextOrder);
    saveLessonToTopic(topicId, newLesson);
    if (onRefresh) onRefresh();
    if (onSwitchLesson) {
      onSwitchLesson(newLesson.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTopic}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Quay lại danh sách bài học của chuyên đề"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {allLessonsInTopic && allLessonsInTopic.length > 0 && (
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden lg:flex items-center justify-center"
              title={isSidebarOpen ? 'Thu gọn danh sách bài học' : 'Mở danh sách bài học'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          )}

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <span>📚 Khóa học</span>
              <span>›</span>
              <span className="text-slate-600 font-bold">{topicName}</span>
              <span>›</span>
              <span className="text-[#FF5C28] font-bold">📖 {formData.title}</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
              Chỉnh Sửa Bài Học (3 Phân Khu Đồng Bộ)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Button */}
          <button
            onClick={() => window.open(`/learn/grammar?topic=${topicId}&lesson=${formData.id}`, '_blank')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
            title="Xem trước bài học trong giao diện học viên (tab mới)"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem trước ↗</span>
          </button>

          {/* Status Toggle */}
          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                status: prev.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED',
              }));
              markDirty();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
              formData.status === 'PUBLISHED'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-amber-50 text-amber-700 border border-amber-300'
            }`}
          >
            {formData.status === 'PUBLISHED' ? '● Đã Xuất Bản' : '○ Bản Nháp'}
          </button>

          {/* Delete Lesson Button */}
          <button
            onClick={handleDeleteCurrentLesson}
            className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Xóa vĩnh viễn bài học này khỏi chuyên đề"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xóa bài</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 shadow-2xs transition-all ${
              hasChanges
                ? 'bg-[#FF5C28] hover:bg-[#e04a19] shadow-orange-200'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{hasChanges ? 'Lưu Thay Đổi *' : 'Đã Lưu'}</span>
          </button>
        </div>
      </div>

      {/* MASTER-DETAIL 2-PANEL LAYOUT (LEFT LESSON ROADMAP + RIGHT EDITOR) */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Lesson Roadmap Sidebar */}
        {allLessonsInTopic && allLessonsInTopic.length > 0 && isSidebarOpen && (
          <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-[#FF5C28]" />
                <span>Danh Sách Bài Học</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                {allLessonsInTopic.length} bài
              </span>
            </div>

            {/* Quick Topic Switcher if allTopics is provided */}
            {allTopics && allTopics.length > 0 && onSwitchTopic && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Chuyển chuyên đề:
                </label>
                <select
                  value={topicId}
                  onChange={(e) => onSwitchTopic(e.target.value)}
                  className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                >
                  {allTopics.map((t) => (
                    <option key={t.id} value={t.id}>
                      #{t.order < 10 ? `0${t.order}` : t.order}. {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Lessons List in current topic */}
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {allLessonsInTopic.map((l, lIdx) => {
                const isCurrent = l.id === lesson.id;
                return (
                  <button
                    key={l.id}
                    onClick={() => {
                      if (onSwitchLesson && l.id !== lesson.id) {
                        onSwitchLesson(l.id);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium'
                    }`}
                  >
                    <div className="min-w-0 flex-1 truncate">
                      <span className={isCurrent ? 'text-amber-400 font-bold mr-1.5' : 'text-slate-400 mr-1.5'}>
                        #{lIdx + 1}
                      </span>
                      <span className="truncate">{l.title}</span>
                    </div>

                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        l.status === 'PUBLISHED' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      title={l.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Add Lesson Button in Sidebar */}
            <button
              onClick={handleCreateLessonInSidebar}
              className="w-full mt-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              title="Tạo thêm bài học mới cho chuyên đề này"
            >
              <Plus className="w-3.5 h-3.5 text-[#FF5C28]" />
              <span>Thêm Bài Mới</span>
            </button>
          </aside>
        )}

        {/* Right Main Editor Body */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Lesson Meta Editor Strip */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-600 block mb-1">Tiêu đề bài học:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  markDirty();
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Phụ đề (Subtitle):</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, subtitle: e.target.value }));
                  markDirty();
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Thời lượng ước tính:</label>
              <input
                type="text"
                value={formData.estimated_time}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, estimated_time: e.target.value }));
                  markDirty();
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>
          </div>

          {/* 3 TAB BAR (LÍ THUYẾT & VÍ DỤ GỘP VÀO 1 MỤC) */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
            {[
              {
                id: 'theory',
                label: '1. Lí Thuyết & Ví Dụ',
                icon: '📖',
                count: `${theoryText.split(/\s+/).filter(Boolean).length + examplesText.split(/\s+/).filter(Boolean).length} từ`,
                color: 'text-blue-600',
              },
              {
                id: 'exercises',
                label: '2. Bài Tập Thực Hành',
                icon: '✏️',
                count: `${exerciseGroups.length} bài • ${exerciseGroups.reduce((acc, g) => acc + g.questions.length, 0)} câu`,
                color: 'text-emerald-600',
              },
              {
                id: 'exam',
                label: '3. Thi Online Đánh Giá',
                icon: '📝',
                count: `${onlineExams.length} bài online • ${onlineExams.reduce((acc, e) => acc + e.sections.reduce((sAcc, s) => sAcc + s.questions.length, 0), 0)} câu`,
                color: 'text-purple-600',
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

      {/* =====================================================================
          TAB 1: LÍ THUYẾT & VÍ DỤ (2 KHUNG TEXT: TRÊN LÀ TÀI LIỆU, DƯỚI LÀ VÍ DỤ)
          TOÀN BỘ LÀ TEXT, 2 KHUNG ĐỀU NHẬP TEXT, KO CHIA KHỐI NHỎ HƠN NỮA
      ===================================================================== */}
      {activeTab === 'theory' && (
        <div className="space-y-4">
          {/* Thanh công cụ tối giản */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 mr-1">
                <FileText className="w-4 h-4 text-[#FF5C28]" />
                <span>Chế độ:</span>
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                1. Khung Trên: Tài Liệu (Text)
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                2. Khung Dưới: Ví Dụ (Text)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                  showLivePreview
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
                title="Bật/Tắt xem trước trực tiếp bên cạnh"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showLivePreview ? '👁️ Đang Bật Xem Trước' : '👁️ Mở Xem Trước'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAiImportOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#FF5C28] hover:bg-[#e04a19] shadow-2xs flex items-center gap-1.5 transition-colors"
                title="Dùng AI phân tích tài liệu tự động"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import AI</span>
              </button>
            </div>
          </div>

          {/* Vùng Soạn Thảo: 2 Khung Nhập Text (Trên là Tài liệu, Dưới là Ví dụ) + Live Preview */}
          <div className={`grid gap-4 ${showLivePreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* CỘT TRÁI: 2 KHUNG NHẬP TEXT */}
            <div className="space-y-4">
              {/* KHUNG TRÊN: TÀI LIỆU LÝ THUYẾT */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Khung Trên: Tài Liệu Lý Thuyết (Text)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Hàng nào ra hàng đó
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFormatTheory}
                      className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200 flex items-center gap-1 transition-colors"
                      title="Tự động chuẩn hóa, xuống dòng hàng nào ra hàng đó"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>⚡ Tách Hàng Tự Động</span>
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      {theoryText.split(/\s+/).filter(Boolean).length} từ • {theoryText.split('\n').length} dòng
                    </span>
                  </div>
                </div>

                <textarea
                  value={theoryText}
                  onChange={(e) => handleTheoryChange(e.target.value)}
                  rows={13}
                  placeholder={`Nhập toàn bộ tài liệu lý thuyết bài học vào đây (gõ hoặc dán text thoải mái)...\n\nVí dụ:\n1. Khái Niệm & Bản Chất Trực Thời Gian\nThì Hiện tại đơn (Present Simple) không nhất thiết chỉ hành động đang xảy ra tại thời điểm nói. Nó đại diện cho những điều luôn đúng theo quy luật tự nhiên, các lịch trình cố định của phương tiện công cộng, hoặc các thói quen sinh hoạt thường nhật.\n\n2. Cấu Trúc Khẳng Định & Phủ Định\nCông Thức Với Động Từ Thường: (+) S + V(s/es) | (-) S + do/does + not + V | (?) Do/Does + S + V?\n(He/She/It và danh từ số ít thêm -s hoặc -es vào sau động từ thường.)\n\n3. Quy Tắc Thêm Đuôi -S / -ES Cần Ghi Nhớ\nĐộng từ tận cùng bằng: -o, -s, -ch, -x, -sh, -z -> thêm -ES (watches, fixes, goes).\nĐộng từ tận cùng bằng "phụ âm + y" -> đổi thành -IES (studies).`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y whitespace-pre-wrap"
                />
              </div>

              {/* KHUNG DƯỚI: VÍ DỤ MINH HỌA */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                      Khung Dưới: Ví Dụ Minh Họa (Text)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      Nhập text tự do
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleInsertExampleSnippet}
                      className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                      title="Chèn mẫu câu ví dụ song ngữ"
                    >
                      <Plus className="w-3 h-3 text-emerald-600" />
                      <span>+ Mẫu Ví Dụ</span>
                    </button>
                    <span className="text-[11px] font-mono text-slate-400">
                      {examplesText.split(/\s+/).filter(Boolean).length} từ • {examplesText.split('\n').length} dòng
                    </span>
                  </div>
                </div>

                <textarea
                  value={examplesText}
                  onChange={(e) => handleExamplesChange(e.target.value)}
                  rows={9}
                  placeholder={`Nhập các câu ví dụ minh họa vào đây (tiếng Anh kèm dịch tiếng Việt)...\n\nVí dụ:\n• Water boils at 100 degrees Celsius under standard atmospheric pressure.\n  (Nước sôi ở 100 độ C dưới áp suất khí quyển tiêu chuẩn.)\n\n• The intercity express train departs at precisely 08:15 AM every morning.\n  (Chuyến tàu tốc hành liên tỉnh khởi hành đúng 8h15 mỗi sáng.)`}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono leading-relaxed text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y whitespace-pre-wrap"
                />

                <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                  <span>
                    💡 <b>Quy ước:</b> Toàn bộ là text. Khung trên là Tài liệu, khung dưới là Ví dụ. Không chia nhỏ khối nào nữa.
                  </span>
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Ngay</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: XEM TRƯỚC TRỰC TIẾP (2 KHUNG TEXT DUY NHẤT, KHÔNG CHIA NHỎ KHỐI NỮA) */}
            {showLivePreview && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800">
                      Xem Trước Phía Học Viên (Live Preview)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100">
                    2 Khung Text Duy Nhất
                  </span>
                </div>

                <div className="flex-1 max-h-[660px] overflow-y-auto space-y-4 pr-1">
                  {/* Khung Trên Xem Trước: Tài Liệu Lý Thuyết */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-4 rounded-full bg-[#FF5C28]" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        1. Tài Liệu Lý Thuyết
                      </h4>
                    </div>
                    <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs leading-relaxed text-slate-800 font-sans whitespace-pre-line break-words min-h-[160px]">
                      {theoryText.trim() ? (
                        theoryText
                      ) : (
                        <span className="text-slate-400 italic">Chưa có nội dung tài liệu lý thuyết. Hãy nhập vào khung trên bên trái!</span>
                      )}
                    </div>
                  </div>

                  {/* Khung Dưới Xem Trước: Ví Dụ Minh Họa */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-4 rounded-full bg-emerald-600" />
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                        2. Ví Dụ Minh Họa
                      </h4>
                    </div>
                    <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200/80 shadow-2xs text-xs leading-relaxed text-slate-800 font-sans whitespace-pre-line break-words min-h-[120px]">
                      {examplesText.trim() ? (
                        examplesText
                      ) : (
                        <span className="text-slate-400 italic">Chưa có ví dụ minh họa. Hãy nhập vào khung dưới bên trái!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: BÀI TẬP THỰC HÀNH (MULTI-EXERCISE ARCHITECTURE)
          Quy tắc:
          - Từ 2 bài tập trở lên: Đánh dấu rõ "Bài 1", "Bài 2", ... với thanh chuyển bài linh hoạt
          - Nếu chỉ có 1 bài: Hiển thị giao diện gọn gàng như bình thường + nút "+ Thêm Bài 2"
          - Mỗi bài tập có thể có nhiều câu hỏi khác nhau (Thêm, Sửa, Xóa, Nhân bản, Đổi vị trí)
      ===================================================================== */}
      {activeTab === 'exercises' && (() => {
        const activeGroup = exerciseGroups[activeExerciseGroupIndex] || exerciseGroups[0] || {
          id: 'eg-fallback',
          title: 'Bài 1',
          questions: [],
        };
        const totalExercises = exerciseGroups.length;
        const totalAllQuestions = exerciseGroups.reduce((acc, g) => acc + g.questions.length, 0);

        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Visual Hierarchy Navigation Breadcrumb / Legend */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50/40 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-black">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>CẤU TRÚC PHÂN CẤP (HIERARCHY):</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                  <span>🏆 Cấp 1: Bài Học</span>
                </span>
                <span className="text-emerald-400 font-bold">➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-800 flex items-center gap-1 border border-teal-200">
                  <span>📁 Cấp 2: Bài Tập ({totalExercises} bài)</span>
                </span>
                <span className="text-emerald-400 font-bold">➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-800 flex items-center gap-1 border border-slate-200">
                  <span>📄 Cấp 3: Câu Hỏi ({totalAllQuestions} câu)</span>
                </span>
              </div>
            </div>

            {/* Top Overview & Action Bar */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      Hệ Thống Quản Lý Bài Tập
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {totalExercises >= 2 ? `${totalExercises} Bài tập` : '1 Bài tập'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {totalAllQuestions} câu hỏi tổng
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {totalExercises >= 2
                      ? 'Bài học có nhiều bài tập (Bài 1, Bài 2...). Chọn từng bài để quản lý các câu hỏi riêng biệt.'
                      : 'Đang có 1 bài tập đơn giản. Bấm nút bên phải nếu muốn tạo thêm Bài 2, Bài 3...'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleAddExerciseGroup}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
                  title="Thêm một bài tập mới (Bài 2, Bài 3...)"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Bài Tập {totalExercises >= 1 ? `(Bài ${totalExercises + 1})` : ''}</span>
                </button>
              </div>
            </div>

            {/* SEGMENTED TABS: Hiển thị Bài 1, Bài 2... khi có từ 2 bài trở lên; Còn 1 bài thì hiển thị thanh đơn giản */}
            {totalExercises >= 2 ? (
              <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <ListOrdered className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Chọn bài tập để soạn câu hỏi ({totalExercises} bài):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold italic">
                    💡 Click vào tab để chuyển bài, bấm biểu tượng để sửa/xóa bài
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {exerciseGroups.map((grp, gIdx) => {
                    const isGroupActive = gIdx === activeExerciseGroupIndex;
                    const questionCount = grp.questions.length;
                    return (
                      <div
                        key={grp.id}
                        className={`group relative flex items-center rounded-xl transition-all ${
                          isGroupActive
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExerciseGroupIndex(gIdx);
                            setEditingExerciseQuestionState(null);
                          }}
                          className="py-2.5 pl-3.5 pr-2 flex items-center gap-2 text-xs font-black whitespace-nowrap"
                        >
                          <span
                            className={`w-5 h-5 rounded-lg text-[11px] flex items-center justify-center font-black ${
                              isGroupActive ? 'bg-emerald-500 text-slate-900' : 'bg-white text-slate-700'
                            }`}
                          >
                            {gIdx + 1}
                          </span>
                          <span>{grp.title || `Bài ${gIdx + 1}`}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isGroupActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                            }`}
                          >
                            {questionCount} câu
                          </span>
                        </button>

                        {/* Quick Delete button on tab if >= 2 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveExerciseGroup(grp.id);
                          }}
                          className={`p-1.5 mr-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity ${
                            isGroupActive ? 'hover:bg-rose-500/30 text-rose-300' : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                          }`}
                          title={`Xóa ${grp.title}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddExerciseGroup}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 text-emerald-700 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Thêm Bài {totalExercises + 1}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Bài tập thực hành ({activeGroup.questions.length} câu hỏi)</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">
                  Muốn chia thành Bài 1, Bài 2? Bấm nút <b>"+ Thêm Bài Tập"</b> ở góc trên bên phải.
                </div>
              </div>
            )}

            {/* ACTIVE EXERCISE GROUP WORKSPACE */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-2xs space-y-4">
              {/* Group Meta & Action Strip */}
              {collapsedGroupMeta[activeGroup.id] ? (
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-black text-base text-slate-900 truncate">
                      {activeGroup.title || (totalExercises >= 2 ? `Bài ${activeExerciseGroupIndex + 1}` : 'Bài 1')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAddNewQuestionToGroup(activeGroup.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Câu Hỏi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget({ type: 'exercise', groupId: activeGroup.id });
                        setIsQuestionBankPickerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors hidden sm:flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ngân Hàng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGroupMetaCollapse(activeGroup.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="Mở rộng chi tiết bài tập"
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mở rộng</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase shrink-0">
                      CẤP 2 • BÀI {activeExerciseGroupIndex + 1}
                    </span>
                    <input
                      type="text"
                      value={activeGroup.title}
                      onChange={(e) => handleRenameExerciseGroup(activeGroup.id, e.target.value)}
                      placeholder="Tên bài tập (vd: Bài 1, Bài 2...)"
                      className="text-sm sm:text-base font-black text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-lg px-2 py-1 border border-transparent hover:border-slate-200 transition-colors w-full max-w-md"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateExerciseGroup(activeGroup.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 transition-colors"
                      title="Nhân bản toàn bộ bài tập này kèm các câu hỏi"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Nhân bản bài</span>
                    </button>

                    {totalExercises >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseGroup(activeGroup.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Xóa bài tập này khỏi bài học"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa bài này</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget({ type: 'exercise', groupId: activeGroup.id });
                        setIsQuestionBankPickerOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Chọn từ Ngân Hàng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAddNewQuestionToGroup(activeGroup.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Thêm Câu Hỏi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleGroupMetaCollapse(activeGroup.id)}
                      className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      title="Thu gọn thông tin bài tập"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* QUESTIONS LIST IN ACTIVE GROUP */}
              <div className="space-y-3 pt-1">
                {activeGroup.questions.length > 0 && (() => {
                  const allCollapsed = activeGroup.questions.every((q) => !!collapsedQuestionIds[q.id]);
                  const groupQIds = activeGroup.questions.map((q) => q.id);
                  const withExplanationCount = activeGroup.questions.filter((q) => !!q.explanation?.trim()).length;

                  return (
                    <div className="flex items-center justify-between px-1 py-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black uppercase shrink-0">
                          CẤP 3 • CÂU HỎI
                        </span>
                        <span className="font-extrabold text-slate-700">
                          Danh sách câu hỏi ({activeGroup.questions.length} câu):
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          • {withExplanationCount}/{activeGroup.questions.length} đã có lời giải thích
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAllQuestionsCollapse(groupQIds, !allCollapsed)}
                        className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                        title={allCollapsed ? 'Mở rộng tất cả câu hỏi' : 'Thu gọn tất cả câu hỏi'}
                      >
                        <ChevronsUpDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{allCollapsed ? 'Mở rộng tất cả' : 'Thu gọn tất cả'}</span>
                      </button>
                    </div>
                  );
                })()}

                {activeGroup.questions.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {activeGroup.title} chưa có câu hỏi nào
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Thêm câu hỏi trắc nghiệm mới hoặc chọn câu hỏi sẵn có từ Question Bank dùng chung.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAddNewQuestionToGroup(activeGroup.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tạo câu hỏi đầu tiên</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPickerTarget({ type: 'exercise', groupId: activeGroup.id });
                          setIsQuestionBankPickerOpen(true);
                        }}
                        className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl"
                      >
                        Chọn từ Question Bank
                      </button>
                    </div>
                  </div>
                ) : (
                  activeGroup.questions.map((q, qIdx) => {
                    const isEditing =
                      editingExerciseQuestionState?.groupId === activeGroup.id &&
                      editingExerciseQuestionState?.questionId === q.id;
                    const isCollapsed = !!collapsedQuestionIds[q.id];

                    if (isEditing) {
                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-2xl bg-white border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in duration-150"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                                {qIdx + 1}.
                              </span>
                              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Chỉnh Sửa Câu Hỏi ({activeGroup.title})</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingExerciseQuestionState(null)}
                                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Xong</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingExerciseQuestionState(null);
                                  toggleQuestionCollapse(q.id);
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors"
                                title="Lưu và thu gọn câu hỏi"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Thu gọn</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionFromGroup(activeGroup.id, q.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa câu hỏi này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                Nội Dung Câu Hỏi (Prompt): <span className="text-rose-500">*</span>
                              </label>
                              <textarea
                                rows={2}
                                value={q.prompt}
                                onChange={(e) =>
                                  handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                    prompt: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                placeholder="Nhập câu hỏi tiếng Anh..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">
                                  Trình Độ CEFR:
                                </label>
                                <select
                                  value={q.cefr || 'B1'}
                                  onChange={(e) =>
                                    handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                      cefr: e.target.value as CefrLevel,
                                    })
                                  }
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
                                    <option key={lvl} value={lvl}>
                                      CEFR {lvl}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Độ Khó:</label>
                                <select
                                  value={q.difficulty || 'medium'}
                                  onChange={(e) =>
                                    handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                      difficulty: e.target.value as any,
                                    })
                                  }
                                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                  <option value="easy">Dễ (Easy)</option>
                                  <option value="medium">Trung bình (Medium)</option>
                                  <option value="hard">Khó (Hard)</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="font-bold text-slate-700 block mb-1.5">
                                4 Lựa Chọn (Bấm nút chữ cái để đặt làm đáp án ĐÚNG ✓):
                              </label>
                              <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                  const letter = String.fromCharCode(65 + optIdx);
                                  const isCorrect = optIdx === q.correctAnswer;
                                  return (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                            correctAnswer: optIdx,
                                          })
                                        }
                                        className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1 ${
                                          isCorrect
                                            ? 'bg-emerald-600 text-white shadow-2xs'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                                        }`}
                                        title="Click để chọn làm đáp án đúng"
                                      >
                                        <span>{letter}</span>
                                        {isCorrect && <span>✓ ĐÚNG</span>}
                                      </button>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const nextOptions = [...q.options];
                                          nextOptions[optIdx] = e.target.value;
                                          handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                            options: nextOptions,
                                          });
                                        }}
                                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        placeholder={`Lựa chọn ${letter}...`}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* MỤC GIẢI THÍCH ĐÁP ÁN */}
                            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="font-extrabold text-amber-950 flex items-center gap-1.5 text-xs">
                                  <Lightbulb className="w-4 h-4 text-amber-600" />
                                  <span>MỤC GIẢI THÍCH ĐÁP ÁN (EXPLANATION):</span>
                                  <span className="text-rose-500 font-black">*</span>
                                </label>
                                <span className="text-[10px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                                  Hiển thị cho học viên sau khi làm
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600">
                                Giải thích chi tiết vì sao chọn đáp án này, phân tích cấu trúc ngữ pháp, dịch câu hoặc chỉ ra bẫy lỗi sai:
                              </p>
                              <textarea
                                rows={3}
                                value={q.explanation || ''}
                                onChange={(e) =>
                                  handleUpdateQuestionInGroup(activeGroup.id, q.id, {
                                    explanation: e.target.value,
                                  })
                                }
                                placeholder="Nhập lời giải thích đáp án chi tiết tại đây (vd: Chủ ngữ ngôi thứ 3 số ít He đi với động từ thêm -s; dấu hiệu nhận biết: on weekends)..."
                                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
                              />
                              {!q.explanation?.trim() && (
                                <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Lưu ý: Bạn chưa nhập giải thích đáp án cho câu hỏi này!</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Collapsed Question Row
                    if (isCollapsed) {
                      const correctOptText = q.options[q.correctAnswer] || '';
                      const correctLetter = String.fromCharCode(65 + (q.correctAnswer ?? 0));
                      const hasExp = !!q.explanation?.trim();

                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionCollapse(q.id)}
                          className="group p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleQuestionCollapse(q.id);
                              }}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 group-hover:text-emerald-600 transition-colors"
                              title="Bấm để mở rộng câu hỏi"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <span className="font-bold text-sm text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded shrink-0">
                              {qIdx + 1}.
                            </span>

                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                              {q.cefr || 'B1'}
                            </span>

                            <span className="font-extrabold text-xs text-slate-800 truncate max-w-xs sm:max-w-md md:max-w-lg">
                              {q.prompt}
                            </span>

                            <span className="hidden sm:inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              ✓ {correctLetter}: {correctOptText.length > 20 ? `${correctOptText.slice(0, 20)}...` : correctOptText}
                            </span>

                            {hasExp ? (
                              <span
                                className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0"
                                title={q.explanation}
                              >
                                <Lightbulb className="w-3 h-3 text-amber-500" />
                                <span>Có giải thích</span>
                              </span>
                            ) : (
                              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                <span>Chưa có giải thích</span>
                              </span>
                            )}
                          </div>

                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleMoveQuestionInGroup(activeGroup.id, qIdx, 'up')}
                              disabled={qIdx === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                              title="Di chuyển lên trên"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestionInGroup(activeGroup.id, qIdx, 'down')}
                              disabled={qIdx === activeGroup.questions.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                              title="Di chuyển xuống dưới"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestionInGroup(activeGroup.id, q.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Nhân bản câu hỏi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExerciseQuestionState({
                                  groupId: activeGroup.id,
                                  questionId: q.id,
                                });
                                setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Chỉnh sửa câu hỏi này"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromGroup(activeGroup.id, q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleQuestionCollapse(q.id)}
                              className="px-2 py-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Mở rộng xem chi tiết"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Mở rộng</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Expanded Question Card
                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                              {qIdx + 1}.
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                              CEFR {q.cefr || 'B1'}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100">
                              {q.difficulty === 'easy'
                                ? 'Dễ'
                                : q.difficulty === 'hard'
                                ? 'Khó'
                                : 'Trung bình'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestionInGroup(activeGroup.id, qIdx, 'up')}
                              disabled={qIdx === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                              title="Di chuyển lên trên"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveQuestionInGroup(activeGroup.id, qIdx, 'down')}
                              disabled={qIdx === activeGroup.questions.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                              title="Di chuyển xuống dưới"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestionInGroup(activeGroup.id, q.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Nhân bản câu hỏi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExerciseQuestionState({
                                  groupId: activeGroup.id,
                                  questionId: q.id,
                                });
                                setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                              }}
                              className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Chỉnh sửa câu hỏi này"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestionFromGroup(activeGroup.id, q.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleQuestionCollapse(q.id)}
                              className="px-2 py-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ml-1"
                              title="Thu gọn câu hỏi này"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                              <span>Thu gọn</span>
                            </button>
                          </div>
                        </div>

                        <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                          {q.prompt}
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isCorrect = optIdx === q.correctAnswer;
                            return (
                              <div
                                key={optIdx}
                                className={`px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between ${
                                  isCorrect
                                    ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900 shadow-2xs'
                                    : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                              >
                                <span>
                                  {letter}. {opt}
                                </span>
                                {isCorrect && <span className="font-bold text-emerald-700">✓ Đúng</span>}
                              </div>
                            );
                          })}
                        </div>

                        {/* MỤC GIẢI THÍCH ĐÁP ÁN LUÔN HIỂN THỊ */}
                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-black text-amber-900">
                            <span className="flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-amber-600" />
                              <span>Mục Giải Thích Đáp Án:</span>
                            </span>
                            {!q.explanation?.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingExerciseQuestionState({
                                    groupId: activeGroup.id,
                                    questionId: q.id,
                                  });
                                  setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                                }}
                                className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-200 transition-colors"
                              >
                                + Thêm giải thích
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed pl-5 font-medium">
                            {q.explanation?.trim() ? (
                              q.explanation
                            ) : (
                              <span className="italic text-slate-400">
                                Chưa có lời giải thích cho câu hỏi này. Bấm "Thêm giải thích" hoặc nút "Sửa" ở trên để bổ sung.
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          TAB 3: THI ONLINE (MULTI-ONLINE EXAMS & MULTI-SECTIONS)
          Quy tắc:
          - Có thể có nhiều bài online (Bài Online 1, Bài Online 2...)
          - Trong 1 bài online có thể có nhiều bài nhỏ (sections)
          - Trong 1 bài nhỏ có thể có nhiều câu hỏi
      ===================================================================== */}
      {activeTab === 'exam' && (() => {
        const activeExam = onlineExams[activeExamIndex] || onlineExams[0] || {
          id: 'oe-fallback',
          title: 'Bài Online 1',
          durationMinutes: 10,
          passScore: 1,
          status: 'DRAFT',
          sections: [],
        };
        const activeSection =
          activeExam.sections[activeExamSectionIndex] ||
          activeExam.sections[0] || {
            id: 'oes-fallback',
            title: 'Bài 1',
            questions: [],
          };
        const totalExams = onlineExams.length;
        const totalSections = activeExam.sections.length;
        const totalQuestionsInExam = activeExam.sections.reduce(
          (acc, s) => acc + s.questions.length,
          0
        );

        return (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Visual Hierarchy Navigation Breadcrumb / Legend */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/60 to-purple-50/40 border border-purple-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-950 font-black">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>CẤU TRÚC PHÂN CẤP DẠNG CÂY (TREE VIEW):</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-purple-600 text-white flex items-center gap-1 shadow-2xs">
                  <span>🏆 Cấp 1: Đề Thi</span>
                </span>
                <span className="text-purple-400 font-bold">➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 flex items-center gap-1 border border-indigo-200">
                  <span>📁 Cấp 2: Bài Con ({totalSections} bài)</span>
                </span>
                <span className="text-purple-400 font-bold">➔</span>
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-800 flex items-center gap-1 border border-slate-200">
                  <span>📄 Cấp 3: Câu Hỏi ({totalQuestionsInExam} câu)</span>
                </span>
              </div>
            </div>

            {/* Top Overview & Action Bar */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold flex-shrink-0 shadow-2xs">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm sm:text-base text-slate-900">
                      Hệ Thống Thi Online Đánh Giá
                    </h3>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {totalExams >= 2 ? `${totalExams} Bài Online` : '1 Bài Online'}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {totalQuestionsInExam} câu hỏi trong đề này
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ nhiều bài thi online. Trong mỗi bài online có thể chia thành nhiều bài nhỏ (sections) khác nhau.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <button
                  type="button"
                  onClick={handleAddOnlineExam}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
                  title="Thêm một bài thi online mới (Bài Online 2...)"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Bài Online {totalExams >= 1 ? `(Bài ${totalExams + 1})` : ''}</span>
                </button>
              </div>
            </div>

            {/* SEGMENTED TABS CHO CÁC BÀI THI ONLINE */}
            {totalExams >= 2 ? (
              <div className="p-2 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5 text-purple-600" />
                    <span>Danh sách các bài thi online ({totalExams} bài):</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold italic">
                    💡 Click để chọn bài online đang cấu hình
                  </span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {onlineExams.map((exam, eIdx) => {
                    const isExamActive = eIdx === activeExamIndex;
                    const qCount = exam.sections.reduce((acc, s) => acc + s.questions.length, 0);
                    return (
                      <div
                        key={exam.id}
                        className={`group relative flex items-center rounded-xl transition-all ${
                          isExamActive
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveExamIndex(eIdx);
                            setActiveExamSectionIndex(0);
                            setEditingExamQuestionState(null);
                          }}
                          className="py-2.5 pl-3.5 pr-2 flex items-center gap-2 text-xs font-black whitespace-nowrap"
                        >
                          <span
                            className={`w-5 h-5 rounded-lg text-[11px] flex items-center justify-center font-black ${
                              isExamActive ? 'bg-purple-500 text-white' : 'bg-white text-slate-700'
                            }`}
                          >
                            {eIdx + 1}
                          </span>
                          <span>{exam.title || `Bài Online ${eIdx + 1}`}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              isExamActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                            }`}
                          >
                            {qCount} câu • {exam.durationMinutes}p
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOnlineExam(exam.id);
                          }}
                          className={`p-1.5 mr-1.5 rounded-lg opacity-60 hover:opacity-100 transition-opacity ${
                            isExamActive ? 'hover:bg-rose-500/30 text-rose-300' : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                          }`}
                          title={`Xóa ${exam.title}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleAddOnlineExam}
                    className="py-2 px-3 bg-purple-50 hover:bg-purple-100 border border-dashed border-purple-300 text-purple-700 font-bold rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-purple-600" />
                    <span>Thêm Bài Online {totalExams + 1}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-purple-900 font-bold">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span>{activeExam.title} ({totalQuestionsInExam} câu hỏi)</span>
                </div>
                <div className="text-[11px] text-purple-700 font-medium">
                  Muốn tạo thêm đề khác? Bấm nút <b>"+ Thêm Bài Online"</b> ở góc trên bên phải.
                </div>
              </div>
            )}

            {/* UNIFIED EXAM & TREE CONTAINER (GỘP CHUNG 1 KHUNG DUY NHẤT) */}
            <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              {/* CẤP 1: HEADER ĐỀ THI ONLINE (TÊN ĐỀ, THỜI GIAN, ĐIỂM SÀN, NÚT LÀM THỬ, NÚT CẤU HÌNH) */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50/80 via-slate-50 to-indigo-50/40 border-b border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider shrink-0">
                          CẤP 1 • ĐỀ THI ONLINE
                        </span>
                        <input
                          type="text"
                          value={activeExam.title}
                          onChange={(e) => handleUpdateOnlineExam(activeExam.id, { title: e.target.value })}
                          placeholder="Tên bài thi online (vd: Bài Online 1...)"
                          className="text-base font-black text-slate-900 bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-purple-400 rounded-lg px-2 py-0.5 transition-colors max-w-xs focus:outline-none"
                        />
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            activeExam.status === 'READY'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {activeExam.status === 'READY' ? '● Sẵn Sàng' : '○ Bản Nháp'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          ⏱️ <b>{activeExam.durationMinutes} phút</b>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          🎯 Điểm sàn: <b>{activeExam.passScore} câu</b>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-purple-700">
                          📊 <b>{totalQuestionsInExam} câu hỏi</b> ({totalSections} bài con)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions on Exam Root */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleGenerateExamFromExercises(activeExam.id)}
                      className="px-3 py-1.5 bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-xl transition-colors hidden sm:flex items-center gap-1.5 shadow-2xs"
                      title="Nạp toàn bộ câu hỏi từ Tab Bài Tập vào đề này"
                    >
                      <span>⚡ Nạp từ Bài Tập</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (totalQuestionsInExam === 0) {
                          alert('Bài thi này chưa có câu hỏi nào để làm thử!');
                          return;
                        }
                        setTestingExam(activeExam);
                        setIsExamModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Làm Thử</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleExamConfigCollapse(activeExam.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      title={collapsedExamConfig[activeExam.id] ? 'Mở rộng cấu hình thời gian & điểm' : 'Thu gọn cấu hình'}
                    >
                      <Settings className="w-3.5 h-3.5 text-purple-600" />
                      <span>{collapsedExamConfig[activeExam.id] ? 'Cấu hình đề' : 'Đóng cấu hình'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          !collapsedExamConfig[activeExam.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Collapsible Config Drawer */}
                {!collapsedExamConfig[activeExam.id] && (
                  <div className="mt-4 pt-4 border-t border-purple-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-150 text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-purple-200/80 shadow-2xs">
                      <label className="font-bold text-slate-700 block mb-1">
                        ⏱️ Thời lượng thi (phút):
                      </label>
                      <input
                        type="number"
                        value={activeExam.durationMinutes}
                        onChange={(e) =>
                          handleUpdateOnlineExam(activeExam.id, {
                            durationMinutes: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-purple-200/80 shadow-2xs">
                      <label className="font-bold text-slate-700 block mb-1">
                        🎯 Điểm qua bài (số câu đúng tối thiểu):
                      </label>
                      <input
                        type="number"
                        value={activeExam.passScore}
                        onChange={(e) =>
                          handleUpdateOnlineExam(activeExam.id, {
                            passScore: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <div className="p-3 rounded-2xl bg-white border border-purple-200/80 shadow-2xs">
                      <label className="font-bold text-slate-700 block mb-1">
                        Trạng thái đề thi:
                      </label>
                      <select
                        value={activeExam.status}
                        onChange={(e) =>
                          handleUpdateOnlineExam(activeExam.id, {
                            status: e.target.value as 'READY' | 'DRAFT',
                          })
                        }
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="READY">● Sẵn sàng (Công khai)</option>
                        <option value="DRAFT">○ Bản nháp (Ẩn)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* THÂN KHUNG CÂY: DANH SÁCH CÁC BÀI CON & CÂU HỎI TRONG ĐỀ */}
              <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                      <Folder className="w-4 h-4 text-purple-600" />
                      <span>CÁC PHẦN THI / BÀI CON TRONG ĐỀ ({totalSections} BÀI):</span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddSectionToExam(activeExam.id)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-transform hover:scale-[1.02]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Bài Mới Vào Đề (Bài {totalSections + 1})</span>
                  </button>
                </div>
{/* TREE CONTAINER VỚI ĐƯỜNG KẺ NHÁNH CÂY DỌC */}
              <div className="relative pl-3 sm:pl-7 space-y-4 before:absolute before:left-1 sm:before:left-3 before:top-4 before:bottom-6 before:w-0.5 before:bg-purple-200">
                {activeExam.sections.map((sec, sIdx) => {
                  const isSecCollapsed = !!collapsedSectionMeta[sec.id];
                  const withExpCount = sec.questions.filter((q) => !!q.explanation?.trim()).length;
                  const secTitle = (sec.title || `Bài ${sIdx + 1}`).replace('Bài 1 trong đề', 'Bài 1');

                  return (
                    <div
                      key={sec.id}
                      className="relative before:absolute before:-left-3 sm:before:-left-4 before:top-6 before:w-3 sm:before:w-4 before:h-0.5 before:bg-purple-200"
                    >
                      {/* CẤP 2 BRANCH CARD */}
                      <div className="rounded-3xl bg-white border border-slate-200 shadow-2xs hover:border-purple-300 transition-colors overflow-hidden">
                        {/* Branch Header - Strictly 1 Horizontal Row */}
                        <div
                          className={`px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between gap-2.5 overflow-x-auto transition-colors ${
                            !isSecCollapsed ? 'border-b border-slate-100' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleSectionMetaCollapse(sec.id)}
                              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-purple-700 transition-colors shrink-0"
                              title={isSecCollapsed ? 'Mở rộng bài này' : 'Thu gọn bài này'}
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-purple-600 transition-transform ${
                                  isSecCollapsed ? '-rotate-90' : ''
                                }`}
                              />
                            </button>

                            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              {isSecCollapsed ? (
                                <Folder className="w-3.5 h-3.5" />
                              ) : (
                                <FolderOpen className="w-3.5 h-3.5" />
                              )}
                            </div>

                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-black uppercase shrink-0">
                              CẤP 2 • BÀI {sIdx + 1}
                            </span>

                            <input
                              type="text"
                              value={secTitle}
                              onChange={(e) =>
                                handleUpdateSectionInExam(activeExam.id, sec.id, {
                                  title: e.target.value,
                                })
                              }
                              placeholder={`Bài ${sIdx + 1}`}
                              className="text-xs sm:text-sm font-black text-slate-900 bg-white hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1 w-28 sm:w-44 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors shrink-0"
                            />

                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shrink-0 whitespace-nowrap">
                              {sec.questions.length} câu hỏi
                            </span>

                            <span className="hidden lg:inline text-[10px] font-semibold text-slate-400 shrink-0 whitespace-nowrap">
                              • {withExpCount}/{sec.questions.length} có giải thích
                            </span>
                          </div>

                          {/* Branch Actions */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleAddNewQuestionToExamSection(activeExam.id, sec.id);
                                if (isSecCollapsed) toggleSectionMetaCollapse(sec.id);
                              }}
                              className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                              title="Thêm câu hỏi mới vào bài này"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">+ Thêm Câu Hỏi</span>
                              <span className="sm:hidden">+ Câu</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPickerTarget({
                                  type: 'exam',
                                  examId: activeExam.id,
                                  sectionId: sec.id,
                                });
                                setIsQuestionBankPickerOpen(true);
                              }}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors hidden md:flex items-center gap-1 whitespace-nowrap shrink-0"
                              title="Chọn câu hỏi từ Ngân hàng"
                            >
                              <Layers className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ngân Hàng</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateSectionInExam(activeExam.id, sec.id)}
                              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shrink-0"
                              title={`Nhân bản toàn bộ ${secTitle}`}
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            </button>

                            {totalSections >= 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSectionFromExam(activeExam.id, sec.id)}
                                className="p-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 transition-colors shrink-0"
                                title={`Xóa ${secTitle} khỏi đề thi`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => toggleSectionMetaCollapse(sec.id)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shadow-2xs shrink-0"
                              title={isSecCollapsed ? 'Mở rộng bài con' : 'Thu gọn bài con'}
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-purple-600 transition-transform ${
                                  isSecCollapsed ? '-rotate-90' : ''
                                }`}
                              />
                              <span>{isSecCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Branch Content (CẤP 3: Questions list in this section) */}
                        {!isSecCollapsed && (
                          <div className="p-4 sm:p-5 space-y-4">
                            {/* Sub-header inside section */}
                            <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                                  CẤP 3 • CÂU HỎI
                                </span>
                                <span className="font-extrabold text-slate-800">
                                  Danh sách câu hỏi trong {secTitle} ({sec.questions.length} câu)
                                </span>
                              </div>

                              {sec.questions.length > 0 && (() => {
                                const allCollapsed = sec.questions.every((q) => !!collapsedQuestionIds[q.id]);
                                const secQIds = sec.questions.map((q) => q.id);
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setAllQuestionsCollapse(secQIds, !allCollapsed)}
                                    className="px-2.5 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  >
                                    <ChevronsUpDown className="w-3.5 h-3.5 text-purple-600" />
                                    <span>{allCollapsed ? 'Mở rộng tất cả câu' : 'Thu gọn tất cả câu'}</span>
                                  </button>
                                );
                              })()}
                            </div>

                            {/* Questions list with nested branch line */}
                            <div className="relative pl-3 sm:pl-5 space-y-3 before:absolute before:left-1 sm:before:left-2 before:top-2 before:bottom-3 before:w-0.5 before:bg-purple-100">
                              {sec.questions.length === 0 ? (
                                <div className="relative before:absolute before:-left-3 sm:before:-left-4 before:top-1/2 before:w-3 sm:before:w-4 before:h-0.5 before:bg-purple-100">
                                  <div className="p-6 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                                    <p className="text-xs text-slate-500 font-medium">
                                      {secTitle} chưa có câu hỏi nào.
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleAddNewQuestionToExamSection(activeExam.id, sec.id)}
                                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tạo câu hỏi đầu tiên</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setPickerTarget({ type: 'exam', examId: activeExam.id, sectionId: sec.id });
                                          setIsQuestionBankPickerOpen(true);
                                        }}
                                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 rounded-xl"
                                      >
                                        Chọn từ Question Bank
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                sec.questions.map((q, qIdx) => {
                                  const isEditing =
                                    editingExamQuestionState?.examId === activeExam.id &&
                                    editingExamQuestionState?.sectionId === sec.id &&
                                    editingExamQuestionState?.questionId === q.id;
                                  const isCollapsed = !!collapsedQuestionIds[q.id];
                                  const hasExp = !!q.explanation?.trim();
                                  const correctOptText = q.options[q.correctAnswer] || '';
                                  const correctLetter = String.fromCharCode(65 + q.correctAnswer);

                                  if (isEditing) {
                                    return (
                                      <div
                                        key={q.id}
                                        className="p-5 rounded-2xl bg-white border-2 border-purple-500 shadow-md space-y-4 animate-in fade-in duration-150"
                                      >
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                                              {qIdx + 1}.
                                            </span>
                                            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                              <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                                              <span>Chỉnh Sửa Câu Hỏi ({secTitle})</span>
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setEditingExamQuestionState(null)}
                                              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                              <span>Xong</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingExamQuestionState(null);
                                                toggleQuestionCollapse(q.id);
                                              }}
                                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-colors"
                                              title="Lưu và thu gọn câu hỏi"
                                            >
                                              <ChevronUp className="w-3.5 h-3.5" />
                                              <span>Thu gọn</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleRemoveQuestionFromExamSection(
                                                  activeExam.id,
                                                  sec.id,
                                                  q.id
                                                )
                                              }
                                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                              title="Xóa câu hỏi này"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>

                                        <div className="space-y-3 text-xs">
                                          <div>
                                            <label className="font-bold text-slate-700 block mb-1">
                                              Nội Dung Câu Hỏi (Prompt): <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                              rows={2}
                                              value={q.prompt}
                                              onChange={(e) =>
                                                handleUpdateQuestionInExamSection(
                                                  activeExam.id,
                                                  sec.id,
                                                  q.id,
                                                  { prompt: e.target.value }
                                                )
                                              }
                                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                              placeholder="Nhập câu hỏi thi online..."
                                            />
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                              <label className="font-bold text-slate-700 block mb-1">
                                                Trình Độ CEFR:
                                              </label>
                                              <select
                                                value={q.cefr || 'B1'}
                                                onChange={(e) =>
                                                  handleUpdateQuestionInExamSection(
                                                    activeExam.id,
                                                    sec.id,
                                                    q.id,
                                                    { cefr: e.target.value as CefrLevel }
                                                  )
                                                }
                                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                              >
                                                {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map(
                                                  (lvl) => (
                                                    <option key={lvl} value={lvl}>
                                                      {lvl}
                                                    </option>
                                                  )
                                                )}
                                              </select>
                                            </div>

                                            <div>
                                              <label className="font-bold text-slate-700 block mb-1">
                                                Độ Khó:
                                              </label>
                                              <select
                                                value={q.difficulty || 'medium'}
                                                onChange={(e) =>
                                                  handleUpdateQuestionInExamSection(
                                                    activeExam.id,
                                                    sec.id,
                                                    q.id,
                                                    {
                                                      difficulty: e.target.value as
                                                        | 'easy'
                                                        | 'medium'
                                                        | 'hard',
                                                    }
                                                  )
                                                }
                                                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                                              >
                                                <option value="easy">Dễ (Easy)</option>
                                                <option value="medium">Trung bình (Medium)</option>
                                                <option value="hard">Khó (Hard)</option>
                                              </select>
                                            </div>
                                          </div>

                                          {/* 4 Options */}
                                          <div className="space-y-2">
                                            <label className="font-bold text-slate-700 block">
                                              Các Lựa Chọn Đáp Án (Click vào nút radio để chọn đáp án đúng):
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {q.options.map((opt, optIdx) => {
                                                const letter = String.fromCharCode(65 + optIdx);
                                                const isCorrect = optIdx === q.correctAnswer;
                                                return (
                                                  <div
                                                    key={optIdx}
                                                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                                                      isCorrect
                                                        ? 'bg-purple-50/70 border-purple-400 ring-1 ring-purple-400 shadow-2xs'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                    }`}
                                                  >
                                                    <input
                                                      type="radio"
                                                      name={`correct-exam-${sec.id}-${q.id}`}
                                                      checked={isCorrect}
                                                      onChange={() =>
                                                        handleUpdateQuestionInExamSection(
                                                          activeExam.id,
                                                          sec.id,
                                                          q.id,
                                                          { correctAnswer: optIdx }
                                                        )
                                                      }
                                                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                                    />
                                                    <span className="font-black text-xs text-slate-500">
                                                      {letter}.
                                                    </span>
                                                    <input
                                                      type="text"
                                                      value={opt}
                                                      onChange={(e) => {
                                                        const newOpts = [...q.options];
                                                        newOpts[optIdx] = e.target.value;
                                                        handleUpdateQuestionInExamSection(
                                                          activeExam.id,
                                                          sec.id,
                                                          q.id,
                                                          { options: newOpts }
                                                        );
                                                      }}
                                                      placeholder={`Đáp án ${letter}...`}
                                                      className="flex-1 px-2 py-1 bg-transparent font-medium text-xs text-slate-900 focus:outline-none"
                                                    />
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>

                                          {/* Explanation */}
                                          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
                                            <label className="font-bold text-amber-900 flex items-center gap-1.5">
                                              <Lightbulb className="w-4 h-4 text-amber-600" />
                                              <span>Mục Giải Thích Đáp Án (Bắt Buộc / Nên Có):</span>
                                            </label>
                                            <p className="text-[11px] text-amber-800/80 font-medium">
                                              Giải thích chi tiết vì sao chọn đáp án này, phân tích cấu trúc ngữ pháp, dịch câu hoặc chỉ ra bẫy lỗi sai:
                                            </p>
                                            <textarea
                                              rows={2}
                                              value={q.explanation || ''}
                                              onChange={(e) =>
                                                handleUpdateQuestionInExamSection(
                                                  activeExam.id,
                                                  sec.id,
                                                  q.id,
                                                  { explanation: e.target.value }
                                                )
                                              }
                                              className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
                                              placeholder="Ví dụ: Đáp án B đúng vì câu diễn tả chân lý khoa học thì hiện tại đơn..."
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }

                                  if (isCollapsed) {
                                    return (
                                      <div
                                        key={q.id}
                                        onClick={() => toggleQuestionCollapse(q.id)}
                                        className="group p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 select-none"
                                      >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleQuestionCollapse(q.id);
                                            }}
                                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 group-hover:text-purple-600 transition-colors"
                                            title="Bấm để mở rộng câu hỏi"
                                          >
                                            <ChevronRight className="w-4 h-4" />
                                          </button>

                                          <span className="font-bold text-sm text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded shrink-0">
                                            {qIdx + 1}.
                                          </span>

                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                            {q.cefr || 'B1'}
                                          </span>

                                          <span className="font-extrabold text-xs text-slate-800 truncate max-w-xs sm:max-w-md md:max-w-lg">
                                            {q.prompt}
                                          </span>

                                          <span className="hidden sm:inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                            ✓ {correctLetter}: {correctOptText.length > 20 ? `${correctOptText.slice(0, 20)}...` : correctOptText}
                                          </span>

                                          {hasExp ? (
                                            <span
                                              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0"
                                              title={q.explanation}
                                            >
                                              <Lightbulb className="w-3 h-3 text-amber-500" />
                                              <span>Có giải thích</span>
                                            </span>
                                          ) : (
                                            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                              <span>Chưa có giải thích</span>
                                            </span>
                                          )}
                                        </div>

                                        <div
                                          className="flex items-center gap-1 shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                qIdx,
                                                'up'
                                              )
                                            }
                                            disabled={qIdx === 0}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                                            title="Di chuyển lên"
                                          >
                                            <MoveUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                qIdx,
                                                'down'
                                              )
                                            }
                                            disabled={qIdx === sec.questions.length - 1}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                                            title="Di chuyển xuống"
                                          >
                                            <MoveDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDuplicateQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                q.id
                                              )
                                            }
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                            title="Nhân bản câu hỏi"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingExamQuestionState({
                                                examId: activeExam.id,
                                                sectionId: sec.id,
                                                questionId: q.id,
                                              });
                                              setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                                            }}
                                            className="px-2.5 py-1 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                            title="Chỉnh sửa câu hỏi này"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Sửa</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveQuestionFromExamSection(
                                                activeExam.id,
                                                sec.id,
                                                q.id
                                              )
                                            }
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa câu hỏi này"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => toggleQuestionCollapse(q.id)}
                                            className="px-2 py-1 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                            title="Mở rộng xem chi tiết"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">Mở rộng</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }

                                  // Expanded Card
                                  return (
                                    <div
                                      key={q.id}
                                      className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-sm text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded">
                                            {qIdx + 1}.
                                          </span>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200">
                                            CEFR {q.cefr || 'B1'}
                                          </span>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-100">
                                            {q.difficulty === 'easy'
                                              ? 'Dễ'
                                              : q.difficulty === 'hard'
                                              ? 'Khó'
                                              : 'Trung bình'}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                qIdx,
                                                'up'
                                              )
                                            }
                                            disabled={qIdx === 0}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                                            title="Di chuyển lên"
                                          >
                                            <MoveUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMoveQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                qIdx,
                                                'down'
                                              )
                                            }
                                            disabled={qIdx === sec.questions.length - 1}
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-20"
                                            title="Di chuyển xuống"
                                          >
                                            <MoveDown className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDuplicateQuestionInExamSection(
                                                activeExam.id,
                                                sec.id,
                                                q.id
                                              )
                                            }
                                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                            title="Nhân bản câu hỏi"
                                          >
                                            <Copy className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setEditingExamQuestionState({
                                                examId: activeExam.id,
                                                sectionId: sec.id,
                                                questionId: q.id,
                                              });
                                              setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                                            }}
                                            className="px-2.5 py-1 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                                            title="Chỉnh sửa câu hỏi này"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Sửa</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveQuestionFromExamSection(
                                                activeExam.id,
                                                sec.id,
                                                q.id
                                              )
                                            }
                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Xóa câu hỏi này"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => toggleQuestionCollapse(q.id)}
                                            className="px-2 py-1 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ml-1"
                                            title="Thu gọn câu hỏi này"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                            <span>Thu gọn</span>
                                          </button>
                                        </div>
                                      </div>

                                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                                        {q.prompt}
                                      </h5>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                        {q.options.map((opt, optIdx) => {
                                          const letter = String.fromCharCode(65 + optIdx);
                                          const isCorrect = optIdx === q.correctAnswer;
                                          return (
                                            <div
                                              key={optIdx}
                                              className={`px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between ${
                                                isCorrect
                                                  ? 'bg-purple-50 border-purple-300 font-bold text-purple-900 shadow-2xs'
                                                  : 'bg-white border-slate-200 text-slate-700'
                                              }`}
                                            >
                                              <span>
                                                {letter}. {opt}
                                              </span>
                                              {isCorrect && (
                                                <span className="font-bold text-purple-700">✓ Đúng</span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      {/* MỤC GIẢI THÍCH ĐÁP ÁN LUÔN HIỂN THỊ */}
                                      <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-black text-amber-900">
                                          <span className="flex items-center gap-1.5">
                                            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                            <span>Mục Giải Thích Đáp Án:</span>
                                          </span>
                                          {!q.explanation?.trim() && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setEditingExamQuestionState({
                                                  examId: activeExam.id,
                                                  sectionId: sec.id,
                                                  questionId: q.id,
                                                });
                                                setCollapsedQuestionIds((prev) => ({ ...prev, [q.id]: false }));
                                              }}
                                              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-md border border-rose-200 transition-colors"
                                            >
                                              + Thêm giải thích
                                            </button>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-700 leading-relaxed pl-5 font-medium">
                                          {q.explanation?.trim() ? (
                                            q.explanation
                                          ) : (
                                            <span className="italic text-slate-400">
                                              Chưa có lời giải thích cho câu hỏi thi này. Bấm "Thêm giải thích" hoặc nút "Sửa" ở trên để bổ sung.
                                            </span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })
                              )}

                              {/* Quick Add Question At Bottom of Section */}
                              <div className="relative before:absolute before:-left-3 sm:before:-left-4 before:top-1/2 before:w-3 sm:before:w-4 before:h-0.5 before:bg-purple-100 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddNewQuestionToExamSection(activeExam.id, sec.id)}
                                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 text-purple-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5 text-purple-600" />
                                  <span>+ Thêm câu hỏi vào {secTitle}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* ADD NEW SECTION BRANCH BUTTON AT BOTTOM OF TREE */}
                <div className="relative before:absolute before:-left-3 sm:before:-left-4 before:top-1/2 before:w-3 sm:before:w-4 before:h-0.5 before:bg-purple-200 pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddSectionToExam(activeExam.id)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50 text-purple-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>+ Thêm Bài Con Mới Vào Đề Thi (Bài {totalSections + 1})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })()}

      {/* Pick Question Modal */}
      {isQuestionBankPickerOpen && (
        <QuestionBankModal
          isOpen={isQuestionBankPickerOpen}
          onClose={() => {
            setIsQuestionBankPickerOpen(false);
            setPickerTarget(null);
          }}
          isPickerMode={true}
          onSelectQuestion={handleAddPickedQuestion}
        />
      )}

      {/* Test Run Exam Modal */}
      {isExamModalOpen && (
        <ExamCenterModal
          isOpen={isExamModalOpen}
          onClose={() => {
            setIsExamModalOpen(false);
            setTestingExam(null);
          }}
          initialMode="lesson"
          topicId={topicId}
          lessonId={formData.id}
          lessonTitle={testingExam ? testingExam.title : formData.title}
          topicName={topicName}
          customQuestions={testingExam ? testingExam.sections.flatMap((s) => s.questions) : undefined}
          customDuration={testingExam ? testingExam.durationMinutes : undefined}
          customTitle={testingExam ? testingExam.title : undefined}
        />
      )}

      {/* AI Import Modal */}
      {isAiImportOpen && (
        <AiImportModal
          isOpen={isAiImportOpen}
          onClose={() => setIsAiImportOpen(false)}
          topicId={topicId}
          topicName={topicName}
          onSuccess={(newLesson) => {
            setFormData(newLesson);
            const { theory, examples } = extractTextsFromLesson(newLesson);
            setTheoryText(theory);
            setExamplesText(examples);
            const normGroups = normalizeLessonExerciseGroups(newLesson);
            setExerciseGroups(normGroups);
            setActiveExerciseGroupIndex(0);
            const normExams = normalizeLessonOnlineExams(newLesson);
            setOnlineExams(normExams);
            setActiveExamIndex(0);
            setActiveExamSectionIndex(0);
            markDirty();
          }}
        />
      )}
        </div>
      </div>
    </div>
  );
};
