'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  HelpCircle,
  Timer,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  XCircle,
  FileText,
  Wand2,
  Save,
  Check,
} from 'lucide-react';
import {
  AdminGrammarLessonItem,
  createEmptyLessonDraft,
  createSampleLessonTemplate,
  LessonFormulaItem,
  LessonUsageItem,
  LessonPitfallItem,
  LessonExampleItem,
  LessonExerciseItem,
} from '@/lib/adminStorage';
import { speakText } from '@/lib/tts';

interface LessonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLesson: AdminGrammarLessonItem | null;
  onSave: (lesson: AdminGrammarLessonItem) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  isOpen,
  onClose,
  editingLesson,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'theory' | 'examples' | 'exercises' | 'exam'>('general');
  const [formData, setFormData] = useState<AdminGrammarLessonItem>(() =>
    createEmptyLessonDraft()
  );

  useEffect(() => {
    if (editingLesson) {
      setFormData(JSON.parse(JSON.stringify(editingLesson)));
      setActiveTab('general');
    } else {
      setFormData(createEmptyLessonDraft());
      setActiveTab('general');
    }
  }, [editingLesson, isOpen]);

  if (!isOpen) return null;

  const handleFillSample = () => {
    const sample = createSampleLessonTemplate(formData.order || 1);
    setFormData((prev) => ({
      ...sample,
      id: prev.id || sample.id,
      order: prev.order || 1,
    }));
  };

  // ----------------------------------------------------
  // Form Handlers: 1. Theory
  // ----------------------------------------------------
  const handleAddFormula = () => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        formulas: [
          ...prev.theory.formulas,
          { type: 'Khẳng định (+)', pattern: 'S + V + O', note: 'Ghi chú cách chia động từ...' },
        ],
      },
    }));
  };

  const handleRemoveFormula = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        formulas: prev.theory.formulas.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateFormula = (index: number, field: keyof LessonFormulaItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.theory.formulas];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        theory: { ...prev.theory, formulas: updated },
      };
    });
  };

  const handleAddUsage = () => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        usages: [
          ...prev.theory.usages,
          { title: 'Trường hợp sử dụng mới', detail: 'Mô tả ngữ cảnh áp dụng...', signals: ['từ 1', 'từ 2'] },
        ],
      },
    }));
  };

  const handleRemoveUsage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        usages: prev.theory.usages.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateUsage = (index: number, field: keyof LessonUsageItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.theory.usages];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        theory: { ...prev.theory, usages: updated },
      };
    });
  };

  const handleAddPitfall = () => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        pitfalls: [
          ...prev.theory.pitfalls,
          { wrong: 'Ví dụ câu viết sai...', correct: 'Ví dụ câu viết đúng chuẩn...', explanation: 'Vì sao sai...' },
        ],
      },
    }));
  };

  const handleRemovePitfall = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      theory: {
        ...prev.theory,
        pitfalls: prev.theory.pitfalls.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdatePitfall = (index: number, field: keyof LessonPitfallItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.theory.pitfalls];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        theory: { ...prev.theory, pitfalls: updated },
      };
    });
  };

  // ----------------------------------------------------
  // Form Handlers: 2. Examples
  // ----------------------------------------------------
  const handleAddExample = () => {
    const id = `ex-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        {
          id,
          en: 'English example sentence here.',
          vi: 'Bản dịch tiếng Việt của câu ví dụ.',
          context: 'Ngữ cảnh sử dụng',
          breakdown: { subject: 'Subject', verb: 'Verb', objectAndOthers: 'Object' },
        },
      ],
    }));
  };

  const handleRemoveExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateExample = (index: number, field: keyof LessonExampleItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.examples];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, examples: updated };
    });
  };

  const handleUpdateBreakdown = (index: number, part: 'subject' | 'verb' | 'objectAndOthers', value: string) => {
    setFormData((prev) => {
      const updated = [...prev.examples];
      const curBreakdown = updated[index].breakdown || { subject: '', verb: '', objectAndOthers: '' };
      updated[index] = {
        ...updated[index],
        breakdown: { ...curBreakdown, [part]: value },
      };
      return { ...prev, examples: updated };
    });
  };

  // ----------------------------------------------------
  // Form Handlers: 3. Exercises
  // ----------------------------------------------------
  const handleAddExercise = () => {
    const id = `q-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          id,
          question: 'Nội dung câu hỏi bài tập...',
          options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
          correctAnswer: 0,
          explanation: 'Giải thích chi tiết vì sao chọn đáp án này...',
        },
      ],
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateExercise = (index: number, field: keyof LessonExerciseItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, exercises: updated };
    });
  };

  const handleUpdateExerciseOption = (qIndex: number, optIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.exercises];
      const options = [...updated[qIndex].options];
      options[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options };
      return { ...prev, exercises: updated };
    });
  };

  // ----------------------------------------------------
  // Form Handlers: 4. Exam
  // ----------------------------------------------------
  const handleAddExamQuestion = () => {
    const id = `exam-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: [
          ...prev.exam.questions,
          {
            id,
            question: 'Nội dung câu hỏi đề thi...',
            options: ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
            correctAnswer: 0,
            explanation: 'Lời giải chi tiết câu thi...',
          },
        ],
      },
    }));
  };

  const handleRemoveExamQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateExamQuestion = (index: number, field: keyof LessonExerciseItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.exam.questions];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        exam: { ...prev.exam, questions: updated },
      };
    });
  };

  const handleUpdateExamOption = (qIndex: number, optIndex: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.exam.questions];
      const options = [...updated[qIndex].options];
      options[optIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options };
      return {
        ...prev,
        exam: { ...prev.exam, questions: updated },
      };
    });
  };

  // ----------------------------------------------------
  // Submit
  // ----------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài học');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header Strip */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quản Trị Bài Học Ngữ Pháp
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-[#FF5C28]">
                Chuẩn 4 Mục User
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {editingLesson ? `Chỉnh Sửa: ${editingLesson.title}` : 'Thêm Bài Học Ngữ Pháp Mới'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!editingLesson && (
              <button
                type="button"
                onClick={handleFillSample}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C28] text-xs font-bold flex items-center gap-1.5 transition-colors border border-orange-200"
                title="Tự động điền dữ liệu mẫu 4 mục"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Nạp Mẫu 4 Mục Gợi Ý</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 5 Tab Navigation: General + 4 Sections like User */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>⚙️ Thông Tin Chung</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'theory'
                ? 'bg-[#FF5C28] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>1. Lí Thuyết</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'theory' ? 'bg-white/20' : 'bg-orange-100 text-[#FF5C28]'
              }`}
            >
              {formData.theory?.formulas?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'examples'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>2. Ví Dụ</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'examples' ? 'bg-white/20' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {formData.examples?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exercises')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exercises'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>3. Bài Tập</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'exercises' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {formData.exercises?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exam'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>4. Thi Online</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                activeTab === 'exam' ? 'bg-white/20' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {formData.exam?.questions?.length || 0}
            </span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 0: THÔNG TIN CHUNG                                   */}
          {/* ======================================================== */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Thông Tin Định Danh & Phân Loại
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu Đề Bài Học (Tiếng Việt) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ví dụ: Hiện Tại Đơn (Present Simple): Chân lý & Thói quen"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Tiếng Anh / Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.enTitle || ''}
                      onChange={(e) => setFormData({ ...formData, enTitle: e.target.value })}
                      placeholder="Ví dụ: Present Simple"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên Chủ Đề Lớn
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.topicTitle}
                      onChange={(e) => setFormData({ ...formData, topicTitle: e.target.value })}
                      placeholder="Ví dụ: Các Thì Hiện Tại"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cấp Độ CEFR
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          level: e.target.value as AdminGrammarLessonItem['level'],
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                    >
                      <option value="A1">A1 - Sơ Cấp 1</option>
                      <option value="A2">A2 - Sơ Cấp 2</option>
                      <option value="B1">B1 - Trung Cấp 1</option>
                      <option value="B2">B2 - Trung Cấp 2</option>
                      <option value="C1">C1 - Cao Cấp 1</option>
                      <option value="C2">C2 - Cao Cấp 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trạng Thái Xuất Bản
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as AdminGrammarLessonItem['status'],
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
                    >
                      <option value="PUBLISHED">PUBLISHED (Hiển thị cho học viên)</option>
                      <option value="DRAFT">DRAFT (Bản nháp ẩn)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thứ Tự Hiển Thị
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.order}
                      onChange={(e) =>
                        setFormData({ ...formData, order: Number(e.target.value) || 1 })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời Gian Đọc Ước Tính
                    </label>
                    <input
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="8 phút"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tóm Tắt Mục Tiêu Bài Học
                  </label>
                  <textarea
                    rows={2}
                    value={formData.summary || ''}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Mô tả ngắn gọn mục tiêu kiến thức học viên sẽ đạt được sau bài học này..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 1: 1. LÍ THUYẾT (THEORY)                             */}
          {/* ======================================================== */}
          {activeTab === 'theory' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* 1.1 Tổng quan */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
                    01
                  </span>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Tổng Quan & Bản Chất Ngữ Pháp
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={formData.theory?.overview || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      theory: { ...formData.theory, overview: e.target.value },
                    })
                  }
                  placeholder="Giải thích bản chất tại sao lại dùng cấu trúc ngữ pháp này..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white leading-relaxed"
                />
              </div>

              {/* 1.2 Công thức & Cấu trúc */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
                      02
                    </span>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Công Thức & Cấu Trúc Ngữ Pháp ({formData.theory?.formulas?.length || 0})
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFormula}
                    className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF5C28] border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Công Thức</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.theory?.formulas?.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={f.type}
                          onChange={(e) => handleUpdateFormula(idx, 'type', e.target.value)}
                          placeholder="Khẳng định (+), Phủ định (-), Nghi vấn (?)..."
                          className="font-bold text-xs text-[#FF5C28] bg-white px-2.5 py-1 rounded-lg border border-slate-200 max-w-xs w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormula(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa công thức này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={f.pattern}
                        onChange={(e) => handleUpdateFormula(idx, 'pattern', e.target.value)}
                        placeholder="Ví dụ: S + V(s/es) + O"
                        className="w-full font-mono text-xs font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                      />

                      <input
                        type="text"
                        value={f.note}
                        onChange={(e) => handleUpdateFormula(idx, 'note', e.target.value)}
                        placeholder="Ghi chú quy tắc chia động từ, điều kiện..."
                        className="w-full text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.3 Cách dùng & Dấu hiệu nhận biết */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold text-xs">
                      03
                    </span>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Trường Hợp Sử Dụng & Dấu Hiệu Nhận Biết ({formData.theory?.usages?.length || 0})
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUsage}
                    className="px-3 py-1 bg-orange-50 hover:bg-orange-100 text-[#FF5C28] border border-orange-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Cách Dùng</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.theory?.usages?.map((u, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={u.title}
                          onChange={(e) => handleUpdateUsage(idx, 'title', e.target.value)}
                          placeholder="Tiêu đề trường hợp sử dụng (ví dụ: Thói quen hàng ngày)..."
                          className="font-bold text-xs text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveUsage(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa trường hợp này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={u.detail || ''}
                        onChange={(e) => handleUpdateUsage(idx, 'detail', e.target.value)}
                        placeholder="Chi tiết giải thích ngữ cảnh..."
                        className="w-full text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 resize-none"
                      />

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          Dấu hiệu nhận biết (ngăn cách bằng dấu phẩy):
                        </span>
                        <input
                          type="text"
                          value={u.signals ? u.signals.join(', ') : ''}
                          onChange={(e) =>
                            handleUpdateUsage(
                              idx,
                              'signals',
                              e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="always, usually, every day, often..."
                          className="w-full text-xs font-mono text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1.4 Bẫy đề thi & Lỗi sai thường gặp */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                      04
                    </span>
                    <label className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                      Bẫy Đề Thi & Lỗi Sai Thường Gặp ({formData.theory?.pitfalls?.length || 0})
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddPitfall}
                    className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Bẫy Lỗi Sai</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.theory?.pitfalls?.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-rose-500 uppercase">
                          Bẫy lỗi #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePitfall(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa bẫy này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 block mb-0.5">
                            ❌ Câu SAI (bị ảnh hưởng tiếng Việt):
                          </span>
                          <input
                            type="text"
                            value={p.wrong}
                            onChange={(e) => handleUpdatePitfall(idx, 'wrong', e.target.value)}
                            placeholder="Ví dụ: He work in a company."
                            className="w-full text-xs font-mono text-rose-600 bg-white px-3 py-1.5 rounded-lg border border-rose-200"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 block mb-0.5">
                            ✔️ Câu ĐÚNG chuẩn bản xứ:
                          </span>
                          <input
                            type="text"
                            value={p.correct}
                            onChange={(e) => handleUpdatePitfall(idx, 'correct', e.target.value)}
                            placeholder="Ví dụ: He works in a company."
                            className="w-full text-xs font-mono text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-bold"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        value={p.explanation}
                        onChange={(e) => handleUpdatePitfall(idx, 'explanation', e.target.value)}
                        placeholder="Giải thích nguyên nhân vì sao sai..."
                        className="w-full text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: 2. VÍ DỤ (EXAMPLES)                               */}
          {/* ======================================================== */}
          {activeTab === 'examples' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-500 font-medium">
                  Ví dụ thực tế kèm âm thanh phát âm bản xứ và bóc tách thành phần S - V - O:
                </span>
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Ví Dụ Mới</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.examples?.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-black">
                          Ví dụ #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ex.context || ''}
                          onChange={(e) => handleUpdateExample(idx, 'context', e.target.value)}
                          placeholder="Ngữ cảnh sử dụng (ví dụ: Chân lý khoa học)..."
                          className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakText(ex.en)}
                          className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                          title="Nghe thử phát âm"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Nghe thử</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExample(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa ví dụ này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Câu Tiếng Anh (English)
                        </label>
                        <input
                          type="text"
                          required
                          value={ex.en}
                          onChange={(e) => handleUpdateExample(idx, 'en', e.target.value)}
                          placeholder="Ví dụ: The Earth revolves around the Sun."
                          className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Dịch Nghĩa Tiếng Việt
                        </label>
                        <input
                          type="text"
                          required
                          value={ex.vi}
                          onChange={(e) => handleUpdateExample(idx, 'vi', e.target.value)}
                          placeholder="Ví dụ: Trái Đất quay quanh Mặt Trời."
                          className="w-full text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Breakdown S - V - O */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Bóc tách thành phần ngữ pháp S - V - O (Tùy chọn):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={ex.breakdown?.subject || ''}
                          onChange={(e) => handleUpdateBreakdown(idx, 'subject', e.target.value)}
                          placeholder="Chủ ngữ (S): The Earth"
                          className="text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200"
                        />
                        <input
                          type="text"
                          value={ex.breakdown?.verb || ''}
                          onChange={(e) => handleUpdateBreakdown(idx, 'verb', e.target.value)}
                          placeholder="Động từ (V): revolves"
                          className="text-xs bg-orange-50/50 text-[#FF5C28] px-2.5 py-1.5 rounded-lg border border-orange-200 font-bold"
                        />
                        <input
                          type="text"
                          value={ex.breakdown?.objectAndOthers || ''}
                          onChange={(e) =>
                            handleUpdateBreakdown(idx, 'objectAndOthers', e.target.value)
                          }
                          placeholder="Tân ngữ/Khác: around the Sun"
                          className="text-xs bg-emerald-50/50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: 3. BÀI TẬP (EXERCISES)                            */}
          {/* ======================================================== */}
          {activeTab === 'exercises' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-500 font-medium">
                  Ngân hàng câu hỏi bài tập trắc nghiệm luyện tập tương tác:
                </span>
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Câu Hỏi Bài Tập</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.exercises?.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-black">
                        Câu hỏi #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExercise(qIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa câu hỏi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nội Dung Câu Hỏi <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={q.question}
                        onChange={(e) => handleUpdateExercise(qIdx, 'question', e.target.value)}
                        placeholder="Ví dụ: Water ________ at 100 degrees Celsius under standard atmospheric pressure."
                        className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        4 Phương Án Đáp Án (Bấm nút tròn để chọn đáp án đúng):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswer === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-400'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateExercise(qIdx, 'correctAnswer', oIdx)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-600 hover:border-emerald-500'
                                }`}
                                title="Đánh dấu đây là đáp án ĐÚNG"
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateExerciseOption(qIdx, oIdx, e.target.value)
                                }
                                placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Lời Giải Thích Chi Tiết
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => handleUpdateExercise(qIdx, 'explanation', e.target.value)}
                        placeholder="Giải thích vì sao chọn đáp án này..."
                        className="w-full text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: 4. THI ONLINE (EXAM)                              */}
          {/* ======================================================== */}
          {activeTab === 'exam' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Exam Settings Card */}
              <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    ⏱️
                  </span>
                  <h4 className="text-xs font-black uppercase tracking-wider text-purple-900">
                    Cấu Hình Đề Thi Trực Tuyến
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời Gian Làm Bài (Phút)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={formData.exam?.durationMinutes || 10}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exam: {
                            ...formData.exam,
                            durationMinutes: Number(e.target.value) || 10,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Điểm Đạt Yêu Cầu (Pass Score)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.exam?.passScore || 1}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exam: {
                            ...formData.exam,
                            passScore: Number(e.target.value) || 1,
                          },
                        })
                      }
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Exam Questions List */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500 font-medium">
                  Danh sách câu hỏi trong đề thi ({formData.exam?.questions?.length || 0} câu):
                </span>
                <button
                  type="button"
                  onClick={handleAddExamQuestion}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Câu Hỏi Thi</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.exam?.questions?.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-black">
                        Câu thi #{qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExamQuestion(qIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa câu hỏi thi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nội Dung Câu Hỏi Thi <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={q.question}
                        onChange={(e) =>
                          handleUpdateExamQuestion(qIdx, 'question', e.target.value)
                        }
                        placeholder="Nội dung câu hỏi đề thi..."
                        className="w-full text-xs font-bold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:bg-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        4 Lựa Chọn (Bấm nút tròn để chọn đáp án đúng):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, oIdx) => {
                          const isCorrect = q.correctAnswer === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                                isCorrect
                                  ? 'bg-purple-50 border-purple-400'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateExamQuestion(qIdx, 'correctAnswer', oIdx)
                                }
                                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                                  isCorrect
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-600 hover:border-purple-500'
                                }`}
                                title="Đánh dấu đây là đáp án ĐÚNG"
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) =>
                                  handleUpdateExamOption(qIdx, oIdx, e.target.value)
                                }
                                placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                                className="w-full text-xs font-medium bg-transparent focus:outline-none text-slate-900"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Lời Giải Chi Tiết
                      </label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) =>
                          handleUpdateExamQuestion(qIdx, 'explanation', e.target.value)
                        }
                        placeholder="Lời giải thích đáp án..."
                        className="w-full text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Submit Bar */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between sticky bottom-0 bg-[#FAF8F5] pb-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-bold text-slate-700">Tổng quan bài học:</span>
              <span>{formData.theory?.formulas?.length || 0} công thức</span>
              <span>·</span>
              <span>{formData.examples?.length || 0} ví dụ</span>
              <span>·</span>
              <span>{formData.exercises?.length || 0} bài tập</span>
              <span>·</span>
              <span>{formData.exam?.questions?.length || 0} câu thi</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-xs font-black text-white shadow-md shadow-[#FF5C28]/20 transition-all flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{editingLesson ? 'Cập Nhật Bài Học' : 'Lưu Bài Học Mới'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
