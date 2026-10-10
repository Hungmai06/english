'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Sparkles,
  Award,
  Layers,
  Clock,
  Database,
  ArrowRight,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Eye,
  X,
  Check,
} from 'lucide-react';
import { GrammarCourse, GrammarTopic, GrammarLesson, CefrLevel } from '@/types/grammarSystem';
import { ExamCenterModal } from './ExamCenterModal';
import { QuestionBankModal } from './QuestionBankModal';
import { AiImportModal } from './AiImportModal';
import {
  createEmptyLessonDraft,
  saveLessonToTopic,
  deleteLessonFromTopic,
  createTopic,
  deleteTopic,
  saveTopicMetadata,
} from '@/lib/grammarCourseStorage';

interface CourseOverviewViewProps {
  course: GrammarCourse;
  onSelectTopic: (topic: GrammarTopic) => void;
  onSelectLessonDirect?: (topic: GrammarTopic, lesson: GrammarLesson) => void;
  onRefreshCourse?: () => void;
}

export const CourseOverviewView: React.FC<CourseOverviewViewProps> = ({
  course,
  onSelectTopic,
  onSelectLessonDirect,
  onRefreshCourse,
}) => {
  const [search, setSearch] = useState('');
  const [cefrFilter, setCefrFilter] = useState('ALL');
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examMode, setExamMode] = useState<'full_course' | 'multi_topic'>('full_course');
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);

  // Topic Create Modal state
  const [isCreateTopicOpen, setIsCreateTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicNameEn, setNewTopicNameEn] = useState('');
  const [newTopicCefr, setNewTopicCefr] = useState<CefrLevel>('B1');
  const [newTopicDesc, setNewTopicDesc] = useState('');

  // Topic Edit Modal state
  const [editingTopic, setEditingTopic] = useState<GrammarTopic | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicNameEn, setEditTopicNameEn] = useState('');
  const [editTopicCefr, setEditTopicCefr] = useState<CefrLevel>('B1');
  const [editTopicStatus, setEditTopicStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [editTopicDesc, setEditTopicDesc] = useState('');

  // Accordion state: which topics are expanded to show lessons
  // Default: first 3 topics expanded
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<string>>(
    () => new Set(['topic-1-tenses', 'topic-2-infinitives', 'topic-3-modals'])
  );

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

  const isAllExpanded = expandedTopicIds.size === course.topics.length;
  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedTopicIds(new Set());
    } else {
      setExpandedTopicIds(new Set(course.topics.map((t) => t.id)));
    }
  };

  // Filter 21 topics
  const filteredTopics = course.topics.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        t.name.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.lessons || []).some((l) => l.title.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (cefrFilter !== 'ALL' && t.cefr !== cefrFilter) return false;
    return true;
  });

  // Topic CRUD Handlers
  const handleOpenCreateTopic = () => {
    setNewTopicName('');
    setNewTopicNameEn('');
    setNewTopicCefr('B1');
    setNewTopicDesc('');
    setIsCreateTopicOpen(true);
  };

  const handleSaveCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) {
      alert('Vui lòng nhập tên chuyên đề!');
      return;
    }
    const created = createTopic(
      newTopicName.trim(),
      newTopicNameEn.trim(),
      newTopicCefr,
      newTopicDesc.trim()
    );
    setIsCreateTopicOpen(false);
    if (onRefreshCourse) onRefreshCourse();
    setExpandedTopicIds((prev) => new Set([...prev, created.id]));
  };

  const handleOpenEditTopic = (topic: GrammarTopic) => {
    setEditingTopic(topic);
    setEditTopicName(topic.name);
    setEditTopicNameEn(topic.nameEn);
    setEditTopicCefr(topic.cefr);
    setEditTopicStatus(topic.status);
    setEditTopicDesc(topic.description);
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTopic || !editTopicName.trim()) return;
    saveTopicMetadata({
      ...editingTopic,
      name: editTopicName.trim(),
      nameEn: editTopicNameEn.trim() || editTopicName.trim(),
      cefr: editTopicCefr,
      status: editTopicStatus,
      description: editTopicDesc.trim(),
    });
    setEditingTopic(null);
    if (onRefreshCourse) onRefreshCourse();
  };

  const handleDeleteTopic = (topicId: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa chuyên đề "${name}" cùng toàn bộ bài học bên trong?`)) {
      deleteTopic(topicId);
      if (onRefreshCourse) onRefreshCourse();
    }
  };

  // Lesson CRUD Handlers
  const handleCreateNewLesson = (topic: GrammarTopic) => {
    const nextOrder = (topic.lessons?.length || 0) + 1;
    const newLesson = createEmptyLessonDraft(topic.id, nextOrder);
    saveLessonToTopic(topic.id, newLesson);
    if (onRefreshCourse) onRefreshCourse();
    if (onSelectLessonDirect) {
      onSelectLessonDirect(topic, newLesson);
    } else {
      onSelectTopic(topic);
    }
  };

  const handleDeleteLesson = (topicId: string, lessonId: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài học "${title}"?`)) {
      deleteLessonFromTopic(topicId, lessonId);
      if (onRefreshCourse) onRefreshCourse();
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* 1. CLEAN ADMINISTRATIVE HEADER (CÓ ĐẦY ĐỦ THÊM SỬA XOÁ CHO HỢP LÍ) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#FFF0E7] text-[#FF5C28] text-xs font-black uppercase">
                Quản Trị Ngữ Pháp
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Chuẩn CEFR A1 - C1
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              21 Chuyên Đề & Hệ Thống Bài Học
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý cấu trúc phân tầng: Chuyên đề › Bài học › 3 Phân khu (Lí thuyết & Ví dụ, Bài tập, Thi online)
            </p>
          </div>

          {/* Quick Admin Actions (Thêm chuyên đề, Ngân hàng, Import, Thi toàn khóa) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenCreateTopic}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#FF5C28] hover:bg-[#ea501e] flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Chuyên Đề Mới</span>
            </button>

            <button
              onClick={() => setIsQuestionBankOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Ngân Hàng Câu Hỏi</span>
            </button>

            <button
              onClick={() => setIsAiImportOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Import AI</span>
            </button>

            <button
              onClick={() => {
                setExamMode('full_course');
                setIsExamModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Thi Toàn Khóa</span>
            </button>
          </div>
        </div>

        {/* Compact Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-xs text-slate-500 font-semibold">Tổng chuyên đề</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{course.topics.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-xs text-slate-500 font-semibold">Tổng số bài học</div>
            <div className="text-xl font-black text-[#FF5C28] mt-0.5">{course.totalLessons}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-xs text-slate-500 font-semibold">Tổng câu hỏi</div>
            <div className="text-xl font-black text-blue-600 mt-0.5">{course.totalQuestions}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="text-xs text-slate-500 font-semibold">Tiến độ cập nhật</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{course.progress}%</div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm chuyên đề hoặc bài học..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={cefrFilter}
            onChange={(e) => setCefrFilter(e.target.value)}
            className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
          >
            <option value="ALL">Mọi cấp độ CEFR</option>
            <option value="A1">A1 - Sơ cấp</option>
            <option value="A2">A2 - Cơ bản</option>
            <option value="B1">B1 - Trung cấp</option>
            <option value="B2">B2 - Trung cao</option>
            <option value="C1">C1 - Cao cấp</option>
          </select>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <button
            onClick={toggleExpandAll}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-[#FF5C28]" />
            <span>{isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}</span>
          </button>
          <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {filteredTopics.length} / {course.topics.length} Chuyên đề
          </span>
        </div>
      </div>

      {/* 3. ROW-BY-ROW ACCORDION LIST (CÓ NÚT THÊM, SỬA, XOÁ ĐẦY ĐỦ CHO TỪNG MỤC) */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            Không tìm thấy chuyên đề hoặc bài học nào khớp với từ khóa tìm kiếm.
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isExpanded = expandedTopicIds.has(topic.id);
            const lessons = topic.lessons || [];
            const totalQ = lessons.reduce((acc, l) => acc + (l.questions?.length || 0), 0);

            return (
              <div
                key={topic.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all overflow-hidden"
              >
                {/* TOPIC ROW HEADER */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Order Pill */}
                    <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                      #{topic.order.toString().padStart(2, '0')}
                    </span>

                    {/* Topic Title & Badges */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => toggleTopicExpand(topic.id)}
                          className="font-black text-sm sm:text-base text-slate-900 hover:text-[#FF5C28] text-left transition-colors truncate"
                        >
                          {topic.name}
                        </button>
                        <span className="text-xs text-slate-400 truncate">
                          • {topic.nameEn}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200/60">
                          {topic.cefr}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            topic.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {topic.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Meta (Thêm bài học, Sửa chuyên đề, Xóa chuyên đề, Quản lý) */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                      {lessons.length} bài • {totalQ} câu hỏi
                    </span>

                    {/* Thêm bài học mới vào chuyên đề này */}
                    <button
                      onClick={() => handleCreateNewLesson(topic)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Thêm bài học mới vào chuyên đề này"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#FF5C28]" />
                      <span>+ Bài học</span>
                    </button>

                    {/* Sửa thông tin chuyên đề */}
                    <button
                      onClick={() => handleOpenEditTopic(topic)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Sửa tên, mô tả & trạng thái chuyên đề"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Xóa chuyên đề */}
                    <button
                      onClick={() => handleDeleteTopic(topic.id, topic.name)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa chuyên đề này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Vào chi tiết chuyên đề */}
                    <button
                      onClick={() => onSelectTopic(topic)}
                      className="px-2.5 py-1 rounded-lg bg-[#FFF0E7] hover:bg-[#FFE4D6] text-[#FF5C28] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Quản lý chi tiết chuyên đề"
                    >
                      <span>Quản lý</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    {/* Mũi tên mở rộng/thu gọn bài học */}
                    <button
                      onClick={() => toggleTopicExpand(topic.id)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title={isExpanded ? 'Thu gọn bài học' : 'Xem danh sách bài học'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* EXPANDED LESSONS LIST TABLE (CÓ NÚT SỬA, XEM TRƯỚC, XOÁ BÀI HỌC) */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-[#FAF8F5]/60 p-3 sm:p-4 space-y-2">
                    {lessons.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
                        Chưa có bài học nào trong chuyên đề này.{' '}
                        <button
                          onClick={() => handleCreateNewLesson(topic)}
                          className="font-bold text-[#FF5C28] hover:underline"
                        >
                          Bấm để thêm bài học mới
                        </button>
                      </div>
                    ) : (
                      lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:border-[#FF5C28]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className="font-mono text-xs font-black text-slate-400 w-6 text-center">
                              #{idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-xs sm:text-sm text-slate-900 truncate">
                                  {lesson.title}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                                  {lesson.cefr || topic.cefr}
                                </span>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.estimated_time || '20p'}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Lesson Actions: Sửa, Xem trước, Xóa */}
                          <div className="flex items-center gap-1.5 self-end md:self-center">
                            <button
                              onClick={() => {
                                if (onSelectLessonDirect) {
                                  onSelectLessonDirect(topic, lesson);
                                } else {
                                  onSelectTopic(topic);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                              title="Chỉnh sửa nội dung 3 phân khu bài học"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Sửa bài học</span>
                            </button>

                            <button
                              onClick={() => window.open(`/learn/grammar?topic=${topic.id}&lesson=${lesson.id}`, '_blank')}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                              title="Xem trước trên giao diện học viên (tab mới)"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteLesson(topic.id, lesson.id, lesson.title)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                              title="Xóa bài học này"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE TOPIC MODAL (THÊM CHUYÊN ĐỀ MỚI) */}
      {isCreateTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#FF5C28]" />
                <span>Thêm Chuyên Đề Mới</span>
              </h3>
              <button
                onClick={() => setIsCreateTopicOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCreateTopic} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên chuyên đề (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Ví dụ: Câu Điều Kiện Nâng Cao..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Tiếng Anh (English Name)
                </label>
                <input
                  type="text"
                  value={newTopicNameEn}
                  onChange={(e) => setNewTopicNameEn(e.target.value)}
                  placeholder="Ví dụ: Advanced Conditionals..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cấp độ CEFR</label>
                  <select
                    value={newTopicCefr}
                    onChange={(e) => setNewTopicCefr(e.target.value as CefrLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Trung cao</option>
                    <option value="C1">C1 - Cao cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn nội dung của chuyên đề này..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateTopicOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold shadow-2xs"
                >
                  Tạo Chuyên Đề
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TOPIC MODAL (SỬA CHUYÊN ĐỀ) */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Sửa Chuyên Đề #{editingTopic.order}</span>
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTopic} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên chuyên đề (Tiếng Việt) *
                </label>
                <input
                  type="text"
                  required
                  value={editTopicName}
                  onChange={(e) => setEditTopicName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Tiếng Anh (English Name)
                </label>
                <input
                  type="text"
                  value={editTopicNameEn}
                  onChange={(e) => setEditTopicNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cấp độ CEFR</label>
                  <select
                    value={editTopicCefr}
                    onChange={(e) => setEditTopicCefr(e.target.value as CefrLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Trung cao</option>
                    <option value="C1">C1 - Cao cấp</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng thái</label>
                  <select
                    value={editTopicStatus}
                    onChange={(e) => setEditTopicStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
                    <option value="DRAFT">Bản nháp (DRAFT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  value={editTopicDesc}
                  onChange={(e) => setEditTopicDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modals */}
      {isExamModalOpen && (
        <ExamCenterModal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          initialMode={examMode}
        />
      )}

      {isQuestionBankOpen && (
        <QuestionBankModal
          isOpen={isQuestionBankOpen}
          onClose={() => setIsQuestionBankOpen(false)}
        />
      )}

      {isAiImportOpen && (
        <AiImportModal
          isOpen={isAiImportOpen}
          onClose={() => {
            setIsAiImportOpen(false);
            if (onRefreshCourse) onRefreshCourse();
          }}
          topicId={course.topics[0]?.id || 'topic-1-tenses'}
          topicName={course.topics[0]?.name || 'Thì Trong Tiếng Anh'}
          onSuccess={() => {
            setIsAiImportOpen(false);
            if (onRefreshCourse) onRefreshCourse();
          }}
        />
      )}
    </div>
  );
};
