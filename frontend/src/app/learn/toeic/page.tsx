'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  RotateCcw,
  Target,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { addXP } from '@/lib/storage';

interface PartInfo {
  partNumber: string;
  name: string;
  section: 'Listening' | 'Reading';
  questionCount: number;
  timeTip: string;
  strategy: string;
}

const TOEIC_PARTS: PartInfo[] = [
  { partNumber: 'Part 1', name: 'Photographs (Tranh miêu tả)', section: 'Listening', questionCount: 6, timeTip: 'Nhìn lướt hành động chính', strategy: 'Cảnh giác bẫy thì hiện tại tiếp diễn bị động (is being + V3) khi không có người trong ảnh.' },
  { partNumber: 'Part 2', name: 'Question - Response (Hỏi & Đáp)', section: 'Listening', questionCount: 25, timeTip: 'Tập trung từ để hỏi 5W1H', strategy: 'Loại ngay đáp án lặp lại từ cùng âm hoặc phát âm na ná câu hỏi.' },
  { partNumber: 'Part 3', name: 'Conversations (Hội thoại ngắn)', section: 'Listening', questionCount: 39, timeTip: 'Đọc trước câu hỏi 10s', strategy: 'Nhìn nhanh biểu đồ/bảng giá kèm theo trước khi đoạn hội thoại bắt đầu.' },
  { partNumber: 'Part 4', name: 'Short Talks (Bài nói chuyện ngắn)', section: 'Listening', questionCount: 30, timeTip: 'Theo dõi mạch bài nói', strategy: 'Nắm bắt câu mở đầu để nhận diện mục đích thông báo (announcement/radio).' },
  { partNumber: 'Part 5', name: 'Incomplete Sentences (Điền khuyết)', section: 'Reading', questionCount: 30, timeTip: 'Tối đa 15s / câu', strategy: 'Nhìn 4 phương án trước: Nếu cùng gốc từ -> Bài từ loại; nếu khác gốc từ -> Bài dịch nghĩa.' },
  { partNumber: 'Part 6', name: 'Text Completion (Hoàn thành đoạn văn)', section: 'Reading', questionCount: 16, timeTip: '30s / câu', strategy: 'Chú ý liên từ (However, Therefore) và câu chọn nguyên câu văn phù hợp ngữ cảnh.' },
  { partNumber: 'Part 7', name: 'Reading Comprehension (Đoạn đơn & kép)', section: 'Reading', questionCount: 54, timeTip: '55 phút tổng', strategy: 'Đọc câu hỏi trước, xác định từ khóa (Keyword Scan) và đọc lướt đoạn văn đối chiếu.' }
];

const SPEED_SPRINT_QUESTIONS = [
  {
    id: 'sp-1',
    prompt: 'Mr. Henderson requested that all expense reports be submitted _____ Friday at 5:00 PM.',
    options: [
      { id: 'a', text: 'by' },
      { id: 'b', text: 'until' },
      { id: 'c', text: 'during' },
      { id: 'd', text: 'between' }
    ],
    correct: 'a',
    explanation: 'Dùng giới từ "by" để chỉ thời hạn chót (deadline - trước thời điểm nào). "Until" chỉ một hành động kéo dài liên tục.'
  },
  {
    id: 'sp-2',
    prompt: 'The newly appointed director has implemented a _____ strategy to expand overseas market share.',
    options: [
      { id: 'a', text: 'comprehend' },
      { id: 'b', text: 'comprehensive' },
      { id: 'c', text: 'comprehensively' },
      { id: 'd', text: 'comprehension' }
    ],
    correct: 'b',
    explanation: 'Cần một tính từ (comprehensive - toàn diện) đứng trước danh từ "strategy" để bổ nghĩa cho nó.'
  },
  {
    id: 'sp-3',
    prompt: 'Neither the project supervisor nor the team members _____ aware of the updated regulatory standards.',
    options: [
      { id: 'a', text: 'was' },
      { id: 'b', text: 'were' },
      { id: 'c', text: 'is' },
      { id: 'd', text: 'has been' }
    ],
    correct: 'b',
    explanation: 'Cấu trúc "Neither A nor B": Động từ chia theo chủ ngữ gần nhất (B). Ở đây "team members" là số nhiều ở quá khứ nên dùng "were".'
  },
  {
    id: 'sp-4',
    prompt: 'Customers can receive a full refund _____ the returned merchandise is undamaged and accompanied by the original receipt.',
    options: [
      { id: 'a', text: 'in case of' },
      { id: 'b', text: 'provided that' },
      { id: 'c', text: 'even though' },
      { id: 'd', text: 'in spite of' }
    ],
    correct: 'b',
    explanation: '"Provided that" (= with the condition that / miễn là) là liên từ điều kiện nối mệnh đề S + V.'
  }
];

export default function ToeicHubPage() {
  const [selectedSection, setSelectedSection] = useState<'All' | 'Listening' | 'Reading'>('All');

  // 60-Second Sprint State
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintAnswers, setSprintAnswers] = useState<Record<string, string>>({});
  const [sprintFinished, setSprintFinished] = useState(false);
  const [sprintSeconds, setSprintSeconds] = useState(60);
  const [isSprintActive, setIsSprintActive] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isSprintActive && !sprintFinished) {
      timer = setInterval(() => {
        setSprintSeconds((s) => {
          if (s <= 1) {
            setSprintFinished(true);
            setIsSprintActive(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSprintActive, sprintFinished]);

  const handleStartSprint = () => {
    setSprintIndex(0);
    setSprintAnswers({});
    setSprintFinished(false);
    setSprintSeconds(60);
    setIsSprintActive(true);
  };

  const handleSelectSprintOption = (optId: string) => {
    if (sprintFinished) return;
    const currentQ = SPEED_SPRINT_QUESTIONS[sprintIndex];
    setSprintAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));

    if (sprintIndex < SPEED_SPRINT_QUESTIONS.length - 1) {
      setSprintIndex((prev) => prev + 1);
    } else {
      setSprintFinished(true);
      setIsSprintActive(false);
      // Count correct
      let correct = 0;
      SPEED_SPRINT_QUESTIONS.forEach((q) => {
        if (sprintAnswers[q.id] === q.correct || (q.id === currentQ.id && optId === q.correct)) {
          correct++;
        }
      });
      addXP(correct * 20);
    }
  };

  const filteredParts = TOEIC_PARTS.filter(
    (p) => selectedSection === 'All' || p.section === selectedSection
  );

  const correctCount = SPEED_SPRINT_QUESTIONS.filter(
    (q) => sprintAnswers[q.id] === q.correct
  ).length;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone="orange">Chuyên Đề Luyện Thi TOEIC</Badge>
            <Badge tone="neutral">Thang Điểm 990</Badge>
          </div>
        </div>

        {/* Header & Quick Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Luyện Thi TOEIC Toàn Diện (TOEIC Master Hub)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Chiến lược phá đảo 7 phần thi TOEIC Listening & Reading: Kỹ thuật phân loại câu hỏi nhanh, bẫy thường gặp và thử thách phản xạ Part 5 trong 60 giây.
            </p>
          </div>

          <Link href="/exams/toeic-diagnostic">
            <Button tone="orange" size="lg" className="font-bold shadow-md shadow-orange-500/25 whitespace-nowrap">
              <Award className="w-4 h-4 mr-2" />
              <span>Thi Thử Đề Chuẩn TOEIC</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* 60-Second Part 5 Sprint Interactive Card */}
        <Card tone="orange" className="p-6 sm:p-8 border-orange-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Thử Thách Phản Xạ 60s Part 5 (Speed Sprint)
                </h3>
                <p className="text-xs text-slate-600">
                  4 câu điền khuyết Part 5 chọn lọc. Rèn thói quen hoàn thành câu hỏi trong vòng 15 giây.
                </p>
              </div>
            </div>

            {isSprintActive && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-orange-300 font-mono text-sm font-bold text-orange-600 shadow-xs">
                <Clock className="w-4 h-4 animate-pulse" />
                <span>00:{sprintSeconds < 10 ? `0${sprintSeconds}` : sprintSeconds}s</span>
              </div>
            )}
          </div>

          {!isSprintActive && !sprintFinished && (
            <div className="bg-white/80 p-5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">• Quy tắc thi:</p>
                <p>Mỗi câu có 15s. Đúng mỗi câu được +20 Xu. Bấm bắt đầu để kích hoạt đồng hồ đếm ngược.</p>
              </div>
              <Button onClick={handleStartSprint} tone="orange" size="md" className="font-bold whitespace-nowrap shadow-sm">
                <Zap className="w-4 h-4 mr-1.5" />
                <span>Bắt Đầu Thử Thách 60s</span>
              </Button>
            </div>
          )}

          {isSprintActive && !sprintFinished && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Câu hỏi {sprintIndex + 1} / {SPEED_SPRINT_QUESTIONS.length}</span>
                <span className="text-orange-600">Part 5 Sprint</span>
              </div>

              <div className="text-base font-bold text-slate-900 leading-relaxed">
                {SPEED_SPRINT_QUESTIONS[sprintIndex].prompt}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPEED_SPRINT_QUESTIONS[sprintIndex].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSprintOption(opt.id)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-400 text-slate-800 text-xs font-bold text-left transition-all flex items-center gap-2.5"
                  >
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center uppercase">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {sprintFinished && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-base text-slate-900">Kết Quả Thử Thách Phản Xạ</h4>
                  <p className="text-xs text-slate-500">Đã cộng +{correctCount * 20} Xu</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-orange-600">
                    {correctCount}/{SPEED_SPRINT_QUESTIONS.length} Đúng
                  </span>
                </div>
              </div>

              {/* Review questions key */}
              <div className="space-y-3">
                {SPEED_SPRINT_QUESTIONS.map((q, i) => {
                  const userChoice = sprintAnswers[q.id];
                  const isCorrect = userChoice === q.correct;
                  return (
                    <div key={q.id} className="p-3 rounded-xl bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Câu {i + 1}</span>
                        <span className={isCorrect ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                          {isCorrect ? '✓ Đúng' : `✗ Sai (Đáp án: ${q.correct.toUpperCase()})`}
                        </span>
                      </div>
                      <p className="text-slate-600">{q.prompt}</p>
                      <p className="text-[11px] text-orange-700 italic">💡 {q.explanation}</p>
                    </div>
                  );
                })}
              </div>

              <Button onClick={handleStartSprint} variant="outline" size="sm" className="font-bold">
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Làm lại thử thách</span>
              </Button>
            </div>
          )}
        </Card>

        {/* Parts 1 to 7 Strategy Guide */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Chiến Thuật 7 Phần Thi TOEIC Chuẩn ETS</h2>
              <p className="text-xs text-slate-500">Chi tiết số lượng câu, phân bổ thời gian và bẫy đề thi cần né tránh.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
              {(['All', 'Listening', 'Reading'] as const).map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedSection === sec
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sec === 'All' ? 'Tất cả 7 Phần' : sec}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParts.map((p, idx) => (
              <Card key={idx} tone="white" className="p-5 border-slate-200 flex flex-col justify-between space-y-4 shadow-subtle hover:border-orange-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-600 uppercase tracking-wider">{p.partNumber}</span>
                    <Badge tone={p.section === 'Listening' ? 'orange' : 'neutral'}>{p.section}</Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.questionCount} câu hỏi · {p.timeTip}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
                    <strong className="text-slate-900">Bí quyết ăn điểm: </strong>
                    {p.strategy}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-orange-600 font-bold">
                  <span>Mẹo thi chuẩn</span>
                  <Link href={`/practice?filter=toeic`} className="hover:underline flex items-center gap-1">
                    <span>Luyện Part này →</span>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
