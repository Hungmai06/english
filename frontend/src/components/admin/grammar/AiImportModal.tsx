'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { parseDocumentWithAi, ParseResult } from '@/lib/grammarAiParser';
import { GrammarLesson, CefrLevel } from '@/types/grammarSystem';
import { saveLessonToTopic } from '@/lib/grammarCourseStorage';

interface AiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  onSuccess: (newLesson: GrammarLesson) => void;
}

const SAMPLE_RAW_DOC = `# 03. Hiện tại hoàn thành (Present Perfect)
## Diễn tả hành động xảy ra trong quá khứ kéo dài đến hiện tại

1. LÝ THUYẾT & CÔNG THỨC
Công thức khẳng định: S + have / has + V3/ed + O
- He, She, It, Danh từ số ít đi với has.
- I, You, We, They, Danh từ số nhiều đi với have.

Công thức phủ định: S + have / has + not + V3/ed + O
Công thức nghi vấn: Have / Has + S + V3/ed + O?

Lưu ý: Dấu hiệu nhận biết quan trọng nhất là "since" (mốc thời gian: since 2010, since yesterday) và "for" (khoảng thời gian: for 5 years, for two weeks). Ngoài ra còn có already, yet, just, recently, ever, never.

Lỗi sai thường gặp:
Sai: I have seen that movie yesterday.
Đúng: I saw that movie yesterday.
Giải thích: Khi có thời gian quá khứ xác định cụ thể (yesterday, last night, in 2020), BẮT BUỘC dùng Quá khứ đơn, không được dùng Hiện tại hoàn thành.

2. VÍ DỤ MINH HỌA
- She has lived in London for over ten years. (Cô ấy đã sống ở Luân Đôn hơn 10 năm rồi)
- The medical company has developed a groundbreaking vaccine since last January. (Công ty y tế đã phát triển một loại vắc-xin đột phá kể từ tháng Một năm ngoái)
- They have already completed the market research report. (Họ đã hoàn thành xong báo cáo nghiên cứu thị trường rồi)

3. BÀI TẬP VẬN DỤNG
Câu 1: Dr. Miller ________ at this prestigious hospital since 2015.
A. worked
B. has worked
C. is working
D. works
Đáp án: B
Giải thích: Có mốc thời gian "since 2015" và chủ ngữ số ít Dr. Miller nên chia thì Hiện tại hoàn thành "has worked".

Câu 2: We ________ the quarterly financial forecast yet.
A. haven't received
B. didn't receive
C. aren't receiving
D. hasn't received
Đáp án: A
Giải thích: Cuối câu có từ "yet" trong câu phủ định với chủ ngữ "We" -> dùng "haven't received".

Câu 3: She ________ to three European countries so far.
A. has been
B. was
C. had been
D. is being
Đáp án: A
Giải thích: Cụm từ "so far" (cho đến nay) là dấu hiệu kinh nghiệm của thì Hiện tại hoàn thành.`;

export const AiImportModal: React.FC<AiImportModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  onSuccess,
}) => {
  const [rawText, setRawText] = useState('');
  const [cefr, setCefr] = useState<CefrLevel>('B1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [copiedSample, setCopiedSample] = useState(false);

  if (!isOpen) return null;

  const handlePasteSample = () => {
    setRawText(SAMPLE_RAW_DOC);
  };

  const handleAnalyze = () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      try {
        const result = parseDocumentWithAi(rawText, topicId, cefr);
        setParseResult(result);
      } catch (err) {
        console.error('Error parsing document:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 450); // slight smooth debounce
  };

  const handleSaveLesson = () => {
    if (!parseResult) return;

    const newLesson: GrammarLesson = {
      id: `lesson-${Date.now()}`,
      topic_id: topicId,
      title: parseResult.lessonTitle,
      subtitle: parseResult.lessonSubtitle,
      description: parseResult.description,
      cefr: parseResult.cefr,
      order: Date.now() % 1000,
      estimated_time: parseResult.estimatedTime,
      status: 'PUBLISHED',
      isCompleted: false,
      theoryBlocks: parseResult.theoryBlocks,
      examples: parseResult.examples,
      questions: parseResult.questions,
      examSettings: parseResult.examSettings, // "Không tạo Exam ở bước import"
    };

    saveLessonToTopic(topicId, newLesson);
    onSuccess(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5C28] to-[#FF8A00] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  AI Smart Document Import
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF5C28]/15 text-[#FF5C28] uppercase tracking-wider">
                  Tốc độ cao
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Chuyên đề: <span className="font-bold text-slate-800">{topicName}</span>
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {!parseResult ? (
            /* STEP 1: Paste Raw Document */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Dán toàn bộ tài liệu bài học (Markdown / Văn bản thô / Giáo trình):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePasteSample}
                    className="text-xs font-bold text-[#FF5C28] hover:text-[#e04a19] flex items-center gap-1 hover:underline"
                  >
                    <span>Dán tài liệu mẫu thử nghiệm</span>
                  </button>
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Dán toàn bộ nội dung giáo án, tài liệu ngữ pháp vào đây. AI sẽ tự động phân loại thành:
1. Lý thuyết (Freestyle TheoryBlocks: tiêu đề, công thức, lưu ý, bẫy lỗi sai)
2. Ví dụ (Câu tiếng Anh & dịch tiếng Việt)
3. Bài tập (Câu hỏi trắc nghiệm & giải thích)
(Thi Online chưa tạo - sẽ được cấu hình sau từ Question Bank)"
                rows={14}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28] focus:bg-white transition-all resize-none"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600">Trình độ CEFR dự kiến:</label>
                  <select
                    value={cefr}
                    onChange={(e) => setCefr(e.target.value as CefrLevel)}
                    className="py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  >
                    <option value="A1">A1 - Sơ cấp</option>
                    <option value="A2">A2 - Cơ bản</option>
                    <option value="B1">B1 - Trung cấp</option>
                    <option value="B2">B2 - Trung cao cấp</option>
                    <option value="C1">C1 - Cao cấp</option>
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={!rawText.trim() || isAnalyzing}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center gap-2 transition-all shadow-md ${
                    !rawText.trim() || isAnalyzing
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FF5C28] to-[#FF8A00] hover:shadow-orange-200 hover:-translate-y-0.5'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI Đang Phân Tích & Bóc Tách...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>AI Phân Tích & Tự Động Phân Loại</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Review AI Classification Results */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-950">
                      AI Phân Loại Thành Công!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Đã tự động trích xuất các thành phần theo cấu trúc chuẩn. Vui lòng kiểm tra nhanh trước khi lưu.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setParseResult(null)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Dán lại tài liệu khác
                </button>
              </div>

              {/* 4 Section Status Tracker per User Requirement */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">1. Lý thuyết</div>
                    <div className="text-xs font-black text-slate-900">
                      {parseResult.rawStats.totalBlocks} Blocks
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">2. Ví dụ</div>
                    <div className="text-xs font-black text-slate-900">
                      {parseResult.rawStats.totalExamples} Ví dụ
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">3. Bài tập</div>
                    <div className="text-xs font-black text-slate-900">
                      {parseResult.rawStats.totalQuestions} Câu hỏi
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs flex items-center gap-3 opacity-80">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm">
                    ○
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">4. Thi Online</div>
                    <div className="text-xs font-bold text-slate-500">
                      Chưa tạo đề
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Summary Card */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {parseResult.lessonTitle}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                    CEFR {parseResult.cefr}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {parseResult.lessonSubtitle}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {parseResult.estimatedTime}
                  </span>
                  {parseResult.duplicateCount > 0 && (
                    <span className="text-amber-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Phát hiện {parseResult.duplicateCount} câu hỏi đã có trong Question Bank (tái sử dụng, không trùng lặp)
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Blocks Accordion */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Chi tiết thành phần đã bóc tách:
                </div>

                {/* Theory Preview */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>📖 Các khối lý thuyết (Freestyle TheoryBlocks):</span>
                    <span className="text-slate-400">{parseResult.theoryBlocks.length} khối</span>
                  </div>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                    {parseResult.theoryBlocks.map((b, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 bg-white rounded-xl border border-slate-200/80 text-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-600 uppercase">
                            {b.type}
                          </span>
                          <span className="truncate font-medium text-slate-800">
                            {b.title || b.content || 'Khối nội dung'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Examples Preview */}
                {parseResult.examples.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>💡 Các ví dụ song ngữ EN / VI:</span>
                      <span className="text-amber-700">{parseResult.examples.length} ví dụ</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                      {parseResult.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-white rounded-xl border border-amber-200/60 text-xs space-y-0.5"
                        >
                          <p className="font-bold text-slate-900">{ex.en}</p>
                          <p className="text-[11px] text-slate-500 italic">{ex.vi}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions Preview */}
                {parseResult.questions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span>✏️ Câu hỏi bài tập đồng bộ với Question Bank:</span>
                      <span className="text-emerald-700">{parseResult.questions.length} câu</span>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-2">
                      {parseResult.questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 bg-white rounded-xl border border-emerald-200/60 text-xs flex items-center justify-between"
                        >
                          <span className="truncate font-semibold text-slate-800">
                            {idx + 1}. {q.prompt}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                            Đ/án: {String.fromCharCode(65 + q.correctAnswer)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Hủy Bỏ
          </button>

          {parseResult && (
            <button
              onClick={handleSaveLesson}
              className="px-6 py-2.5 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-200 flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <Check className="w-4 h-4" />
              <span>Xác Nhận & Lưu Vào Chuyên Đề</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
