'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Tag,
  Database,
  Sparkles,
} from 'lucide-react';
import { BankQuestion, CefrLevel, QuestionDifficulty } from '@/types/grammarSystem';
import {
  getQuestionBank,
  addQuestionToBank,
  deleteQuestionFromBank,
  computeNormalizedHash,
} from '@/lib/questionBankStorage';
import { getGrammarTopics } from '@/lib/grammarCourseStorage';

interface QuestionBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion?: (question: BankQuestion) => void;
  isPickerMode?: boolean;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
  isPickerMode = false,
}) => {
  const [bank, setBank] = useState<BankQuestion[]>(() => getQuestionBank());
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('ALL');
  const [selectedCefr, setSelectedCefr] = useState('ALL');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // New question form state
  const [newPrompt, setNewPrompt] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [newTopicId, setNewTopicId] = useState('topic-1-tenses');
  const [newCefr, setNewCefr] = useState<CefrLevel>('B1');
  const [newDifficulty, setNewDifficulty] = useState<QuestionDifficulty>('medium');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const topics = useMemo(() => getGrammarTopics(), []);

  if (!isOpen) return null;

  const reloadBank = () => {
    setBank(getQuestionBank());
  };

  const filteredQuestions = bank.filter((q) => {
    if (search.trim()) {
      const s = search.toLowerCase();
      const match =
        q.prompt.toLowerCase().includes(s) ||
        q.explanation.toLowerCase().includes(s) ||
        q.options.some((opt) => opt.toLowerCase().includes(s));
      if (!match) return false;
    }
    if (selectedTopic !== 'ALL' && q.topicId !== selectedTopic) return false;
    if (selectedCefr !== 'ALL' && q.cefr !== selectedCefr) return false;
    return true;
  });

  const handlePromptChange = (val: string) => {
    setNewPrompt(val);
    if (!val.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const hash = computeNormalizedHash(val);
    const existing = bank.find((q) => q.normalizedHash === hash);
    if (existing) {
      setDuplicateWarning(`Cảnh báo: Câu hỏi này đã tồn tại trong Ngân Hàng (ID: ${existing.id})! Hệ thống sẽ tự động tái sử dụng, không tạo câu trùng lặp.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleSaveNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || newOptions.some((o) => !o.trim())) {
      alert('Vui lòng nhập đầy đủ câu hỏi và 4 lựa chọn trả lời!');
      return;
    }

    const { question, isDuplicate } = addQuestionToBank({
      prompt: newPrompt.trim(),
      options: newOptions.map((o) => o.trim()),
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation.trim(),
      topicId: newTopicId,
      difficulty: newDifficulty,
      cefr: newCefr,
      usageTags: ['lesson_exercise', 'topic_exam', 'course_exam'],
    });

    if (isDuplicate) {
      alert(`Đã nhận diện câu hỏi trùng lặp và liên kết tái sử dụng thành công (ID: ${question.id}).`);
    }

    // Reset form
    setNewPrompt('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
    setDuplicateWarning(null);
    setIsAddFormOpen(false);
    reloadBank();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi Ngân Hàng Câu Hỏi dùng chung?')) {
      deleteQuestionFromBank(id);
      reloadBank();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 via-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  Ngân Hàng Câu Hỏi Ngữ Pháp Dùng Chung (Question Bank)
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {bank.length} câu hỏi
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Dùng chung cho Bài tập · Mini test · Thi theo bài · Thi chuyên đề · Thi toàn khóa (Chống trùng lặp tuyệt đối)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm câu hỏi, nội dung, đáp án..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Mọi Chuyên Đề (21 chuyên đề)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCefr}
              onChange={(e) => setSelectedCefr(e.target.value)}
              className="py-2 px-3 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">Mọi Trình Độ CEFR</option>
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
              <option value="C1">C1</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddFormOpen ? 'Đóng Form' : 'Thêm Câu Hỏi Mới'}</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Add Question Expandable Form */}
          {isAddFormOpen && (
            <form
              onSubmit={handleSaveNewQuestion}
              className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-4 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Thêm Câu Hỏi Mới Vào Ngân Hàng Dùng Chung</span>
                </h4>
                <span className="text-[11px] text-blue-700 font-medium">
                  Tự động kiểm tra trùng lặp thời gian thực
                </span>
              </div>

              {/* Prompt */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nội dung câu hỏi (Prompt):
                </label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder="Ví dụ: Water ________ at 100 degrees Celsius under standard atmospheric pressure."
                  rows={2}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
                {duplicateWarning && (
                  <p className="mt-1 text-xs text-amber-700 font-semibold flex items-center gap-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{duplicateWarning}</span>
                  </p>
                )}
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {newOptions.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isCorrect = newCorrectAnswer === idx;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Lựa chọn {letter}:</span>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-emerald-700 font-bold">
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={isCorrect}
                            onChange={() => setNewCorrectAnswer(idx)}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Đáp án đúng</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx] = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`Nhập đáp án ${letter}...`}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-xs font-medium ${
                          isCorrect ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-slate-200'
                        }`}
                        required
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanation & Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1 text-blue-950">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Mục Giải Thích Đáp Án:</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Hiển thị cho học viên sau khi nộp bài
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    placeholder="Giải thích vì sao đáp án này đúng, phân tích ngữ pháp và bẫy cần tránh..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chuyên đề:</label>
                  <select
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 truncate"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-200/60">
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  Lưu Vào Ngân Hàng Câu Hỏi
                </button>
              </div>
            </form>
          )}

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                Không tìm thấy câu hỏi nào phù hợp với bộ lọc tìm kiếm.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const topicName = topics.find((t) => t.id === q.topicId)?.name || q.topicId;
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-50 text-blue-700">
                          CEFR {q.cefr}
                        </span>
                        <span className="text-xs font-bold text-slate-600">
                          {topicName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isPickerMode && onSelectQuestion && (
                          <button
                            onClick={() => {
                              onSelectQuestion(q);
                              onClose();
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            Chọn Câu Này
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa câu hỏi khỏi ngân hàng"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h5 className="font-extrabold text-xs text-slate-900 leading-snug">
                      {q.prompt}
                    </h5>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = optIdx === q.correctAnswer;
                        return (
                          <div
                            key={optIdx}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <span>
                              {letter}. {opt}
                            </span>
                            {isCorrect && <span className="text-emerald-700">✓ Đúng</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] space-y-0.5">
                      <span className="font-extrabold text-amber-950 flex items-center gap-1">
                        💡 <span>Mục Giải Thích Đáp Án:</span>
                      </span>
                      <p className="text-slate-700 pl-4 font-medium">
                        {q.explanation?.trim() ? (
                          q.explanation
                        ) : (
                          <span className="italic text-slate-400">Chưa có lời giải thích chi tiết.</span>
                        )}
                      </p>
                    </div>

                    {/* Usage tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        Sử dụng trong:
                      </span>
                      {q.usageTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          {tag === 'lesson_exercise'
                            ? 'Bài tập'
                            : tag === 'topic_exam'
                            ? 'Thi chuyên đề'
                            : tag === 'course_exam'
                            ? 'Thi toàn khóa'
                            : tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredQuestions.length} / {bank.length} câu hỏi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
