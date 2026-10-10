'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  CheckCircle2,
  Trash2,
  Edit2,
  Search,
  Filter,
  Check,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import { GrammarTopic, GrammarLesson, CefrLevel } from '@/types/grammarSystem';
import {
  createEmptyLessonDraft,
  saveLessonToTopic,
  deleteLessonFromTopic,
  saveTopicMetadata,
  deleteTopic,
} from '@/lib/grammarCourseStorage';
import { AiImportModal } from './AiImportModal';
import { ExamCenterModal } from './ExamCenterModal';

interface TopicDetailViewProps {
  topic: GrammarTopic;
  onBackToCourse: () => void;
  onSelectLesson: (lesson: GrammarLesson) => void;
  onRefreshTopics: () => void;
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({
  topic,
  onBackToCourse,
  onSelectLesson,
  onRefreshTopics,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isAiImportOpen, setIsAiImportOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);

  // Edit Topic Modal state
  const [isEditTopicOpen, setIsEditTopicOpen] = useState(false);
  const [editTopicName, setEditTopicName] = useState(topic.name);
  const [editTopicNameEn, setEditTopicNameEn] = useState(topic.nameEn || '');
  const [editTopicCefr, setEditTopicCefr] = useState<CefrLevel>(topic.cefr || 'B1');
  const [editTopicStatus, setEditTopicStatus] = useState<'PUBLISHED' | 'DRAFT'>(topic.status || 'PUBLISHED');
  const [editTopicDesc, setEditTopicDesc] = useState(topic.description || '');

  // Synchronize when topic prop changes
  React.useEffect(() => {
    setEditTopicName(topic.name);
    setEditTopicNameEn(topic.nameEn || '');
    setEditTopicCefr(topic.cefr || 'B1');
    setEditTopicStatus(topic.status || 'PUBLISHED');
    setEditTopicDesc(topic.description || '');
  }, [topic]);

  // Filter lessons
  const filteredLessons = (topic.lessons || []).filter((l) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        l.title.toLowerCase().includes(q) ||
        l.subtitle.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    return true;
  });

  const handleCreateNewLesson = () => {
    const nextOrder = (topic.lessons?.length || 0) + 1;
    const newLesson = createEmptyLessonDraft(topic.id, nextOrder);
    saveLessonToTopic(topic.id, newLesson);
    onRefreshTopics();
    onSelectLesson(newLesson);
  };

  const handleDeleteLesson = (lessonId: string, title: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài học "${title}"?`)) {
      deleteLessonFromTopic(topic.id, lessonId);
      onRefreshTopics();
    }
  };

  const handleOpenEditTopic = () => {
    setEditTopicName(topic.name);
    setEditTopicNameEn(topic.nameEn || '');
    setEditTopicCefr(topic.cefr || 'B1');
    setEditTopicStatus(topic.status || 'PUBLISHED');
    setEditTopicDesc(topic.description || '');
    setIsEditTopicOpen(true);
  };

  const handleSaveEditTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTopicName.trim()) {
      alert('Vui lòng nhập tên chuyên đề!');
      return;
    }
    saveTopicMetadata({
      ...topic,
      name: editTopicName.trim(),
      nameEn: editTopicNameEn.trim(),
      cefr: editTopicCefr,
      status: editTopicStatus,
      description: editTopicDesc.trim(),
    });
    setIsEditTopicOpen(false);
    onRefreshTopics();
  };

  const handleDeleteTopic = () => {
    if (
      confirm(
        `Bạn có chắc chắn muốn XÓA TOÀN BỘ chuyên đề "${topic.name}" cùng tất cả bài học bên trong?\nThao tác này không thể hoàn tác!`
      )
    ) {
      deleteTopic(topic.id);
      onRefreshTopics();
      onBackToCourse();
    }
  };

  const totalQuestions = (topic.lessons || []).reduce(
    (acc, l) => acc + (l.questions?.length || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToCourse}
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Quay lại danh sách chuyên đề"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
              <span>📚 Khóa học</span>
              <span>›</span>
              <span className="text-[#FF5C28] font-bold">📂 {topic.name}</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
              Quản Lý Chuyên Đề & Danh Sách Bài Học
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Thi chuyên đề */}
          <button
            onClick={() => setIsExamModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Thi Chuyên Đề Này</span>
          </button>

          {/* Import AI */}
          <button
            onClick={() => setIsAiImportOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#FF5C28] to-[#FF8A00] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Import Tài Liệu AI</span>
          </button>

          {/* Thêm bài học */}
          <button
            onClick={handleCreateNewLesson}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bài Học Mới</span>
          </button>
        </div>
      </div>

      {/* TOPIC HERO INFORMATION CARD (CLEAN ADMIN STYLE) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#FF5C28] bg-[#FFF0E7] px-2.5 py-0.5 rounded-md">
                CHUYÊN ĐỀ #{topic.order.toString().padStart(2, '0')}
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                CEFR {topic.cefr}
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded uppercase ${
                  topic.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {topic.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{topic.name}</h1>
              {/* Sửa / Xóa Chuyên Đề Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleOpenEditTopic}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 transition-colors"
                  title="Chỉnh sửa thông tin chuyên đề"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Sửa chuyên đề</span>
                </button>
                <button
                  onClick={handleDeleteTopic}
                  className="px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 transition-colors"
                  title="Xóa vĩnh viễn chuyên đề này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500">{topic.nameEn}</p>
            {topic.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-1 max-w-3xl">
                {topic.description}
              </p>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center min-w-[80px]">
              <div className="text-lg font-black text-slate-900">{topic.lessons?.length || 0}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Bài Học</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center min-w-[80px]">
              <div className="text-lg font-black text-blue-600">{totalQuestions}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Câu Hỏi</div>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-center min-w-[80px]">
              <div className="text-lg font-black text-emerald-600">{topic.progress}%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Tiến Độ</div>
            </div>
          </div>
        </div>
      </div>

      {/* LESSONS LIST MANAGEMENT (per user spec: do not manage in a flat list!) */}
      <div className="space-y-4">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bài học trong chuyên đề này..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="PUBLISHED">Đã xuất bản (PUBLISHED)</option>
              <option value="DRAFT">Bản nháp (DRAFT)</option>
            </select>
          </div>

          <div className="text-xs font-bold text-slate-500">
            Hiển thị {filteredLessons.length} / {topic.lessons?.length || 0} bài học
          </div>
        </div>

        {/* Lessons Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Thứ Tự</th>
                  <th className="py-3.5 px-4">Tiêu Đề Bài Học</th>
                  <th className="py-3.5 px-3">CEFR</th>
                  <th className="py-3.5 px-3">Thời Lượng</th>
                  <th className="py-3.5 px-3">Số Câu Hỏi</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Chưa có bài học nào trong chuyên đề này. Hãy bấm "Thêm Bài Học Mới" hoặc "Import Tài Liệu AI"!
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((l, idx) => (
                    <tr
                      key={l.id}
                      onClick={() => onSelectLesson(l)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">
                        #{l.order}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900 block group-hover:text-[#FF5C28] transition-colors">
                          {l.title}
                        </span>
                        <span className="text-[11px] text-slate-400">{l.subtitle}</span>
                      </td>

                      <td className="py-4 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-100 text-blue-800">
                          {l.cefr}
                        </span>
                      </td>

                      <td className="py-4 px-3 text-slate-600 font-semibold">
                        {l.estimated_time}
                      </td>

                      <td className="py-4 px-3">
                        <span className="font-extrabold text-slate-800">
                          {l.questions?.length || 0} câu
                        </span>
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            l.status === 'PUBLISHED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => window.open(`/learn/grammar?topic=${topic.id}&lesson=${l.id}`, '_blank')}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Xem trước bài học giao diện học viên"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onSelectLesson(l)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa bài học"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteLesson(l.id, l.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Xóa bài học"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Import Modal */}
      {isAiImportOpen && (
        <AiImportModal
          isOpen={isAiImportOpen}
          onClose={() => setIsAiImportOpen(false)}
          topicId={topic.id}
          topicName={topic.name}
          onSuccess={() => {
            onRefreshTopics();
          }}
        />
      )}

      {/* Topic Exam Modal */}
      {isExamModalOpen && (
        <ExamCenterModal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          initialMode="topic"
          topicId={topic.id}
          topicName={topic.name}
        />
      )}

      {/* MODAL: SỬA THÔNG TIN CHUYÊN ĐỀ */}
      {isEditTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Chỉnh Sửa Thông Tin Chuyên Đề #{topic.order}
                </h3>
              </div>
              <button
                onClick={() => setIsEditTopicOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTopic} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Chuyên Đề (Tiếng Việt): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editTopicName}
                  onChange={(e) => setEditTopicName(e.target.value)}
                  placeholder="Ví dụ: Thì Hiện Tại Đơn & Hiện Tại Tiếp Diễn"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Tiếng Anh (English Name):
                </label>
                <input
                  type="text"
                  value={editTopicNameEn}
                  onChange={(e) => setEditTopicNameEn(e.target.value)}
                  placeholder="Ví dụ: Present Simple & Present Continuous"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trình Độ CEFR:</label>
                  <select
                    value={editTopicCefr}
                    onChange={(e) => setEditTopicCefr(e.target.value as CefrLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        CEFR {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trạng Thái:</label>
                  <select
                    value={editTopicStatus}
                    onChange={(e) => setEditTopicStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    <option value="PUBLISHED">Đã Xuất Bản (PUBLISHED)</option>
                    <option value="DRAFT">Bản Nháp (DRAFT)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Mô Tả Tổng Quan Chuyên Đề:
                </label>
                <textarea
                  rows={3}
                  value={editTopicDesc}
                  onChange={(e) => setEditTopicDesc(e.target.value)}
                  placeholder="Mô tả nội dung trọng tâm của chuyên đề ngữ pháp này..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditTopicOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF5C28] hover:bg-[#e04a19] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
