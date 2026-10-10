'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  RotateCcw,
  Bookmark,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { Progress } from '@/design-system/components/Progress';
import { getMistakes, getBookmarks, getUserStats } from '@/lib/storage';
import { MistakeRecord } from '@/types';

export default function ReviewHubPage() {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    setMistakes(getMistakes());
    setBookmarkIds(getBookmarks());
    setStats(getUserStats());
  }, []);

  const pendingMistakes = mistakes.filter((m) => m.status === 'needs_review');
  const masteredMistakes = mistakes.filter((m) => m.status === 'mastered');

  const srsBoxes = [
    { stage: 'Hộp 1: Mới sai / Cần ôn', count: pendingMistakes.length, interval: 'Mỗi ngày', color: 'bg-red-50 text-red-700 border-red-200' },
    { stage: 'Hộp 2: Đang củng cố (Đúng 1 lần)', count: Math.max(2, mistakes.length - pendingMistakes.length - masteredMistakes.length), interval: '3 ngày / lần', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { stage: 'Hộp 3: Đã thuộc vững (Đúng 2+ lần)', count: masteredMistakes.length + 8, interval: '7 ngày / lần', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge tone="orange">Thuật Toán Ghi Nhớ Giãn Cách (Spaced Repetition)</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Trung Tâm Ôn Tập & Khắc Sâu
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Học mà không ôn lại sẽ quên 70% sau 48 giờ. Trung tâm ôn tập giúp bạn khắc phục đúng các lỗ hổng kiến thức, làm lại câu sai và ghi nhớ từ vựng vĩnh viễn.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card tone="white" className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cần ôn hôm nay</span>
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{pendingMistakes.length + 5}</span>
              <span className="text-xs text-slate-500 ml-1.5">mục đến hạn</span>
            </div>
            <p className="text-[11px] text-orange-600 font-semibold mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Khoảng 6 phút để hoàn thành</span>
            </p>
          </Card>

          <Card tone="white" className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sổ tay lỗi sai</span>
              <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{pendingMistakes.length}</span>
              <span className="text-xs text-slate-500 ml-1.5">câu cần phục hồi</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {masteredMistakes.length} câu đã chuyển hóa thành công
            </p>
          </Card>

          <Card tone="white" className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mục đã đánh dấu</span>
              <div className="w-8 h-8 rounded-xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-900">{bookmarkIds.length}</span>
              <span className="text-xs text-slate-500 ml-1.5">từ vựng & câu hỏi</span>
            </div>
            <p className="text-[11px] text-[#FF5C28] mt-1 font-semibold">
              Kho tài liệu cá nhân
            </p>
          </Card>

          <Card tone="white" className="p-5 border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tỷ lệ lưu giữ trí nhớ</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-emerald-600">84%</span>
              <span className="text-xs text-slate-500 ml-1.5">Độ ổn định</span>
            </div>
            <Progress value={84} tone="green" size="sm" className="mt-2" />
          </Card>
        </div>

        {/* 2 Primary Action Portals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mistake Notebook Portal */}
          <Card tone="orange" className="p-7 flex flex-col justify-between border-orange-200 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <Badge tone="orange">{pendingMistakes.length} câu đang chờ</Badge>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Sổ Tay Lỗi Sai (Mistake Notebook)</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Tập trung giải quyết các lỗi sai bạn từng mắc phải trong bài thi, bài ngữ pháp hoặc trắc nghiệm phản xạ. Đúng 2 lần liên tiếp để gỡ khỏi sổ sai.
                </p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl text-xs space-y-1.5 text-slate-700 border border-orange-200/60">
                <div className="flex justify-between font-medium">
                  <span>Tiến độ phục hồi:</span>
                  <span className="font-bold text-orange-600">
                    {mistakes.length > 0 ? Math.round((masteredMistakes.length / mistakes.length) * 100) : 100}%
                  </span>
                </div>
                <Progress
                  value={mistakes.length > 0 ? (masteredMistakes.length / mistakes.length) * 100 : 100}
                  tone="orange"
                  size="sm"
                />
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-orange-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chế độ luyện tập thích ứng</span>
              <Link href="/review/mistakes">
                <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                  <span>Mở Sổ Tay Lỗi Sai</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Bookmarks Portal */}
          <Card tone="pastel" className="p-7 flex flex-col justify-between border-[#FFE4D6] shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#FF5C28] text-white flex items-center justify-center font-bold shadow-md shadow-[#FF5C28]/20">
                  <Bookmark className="w-6 h-6" />
                </div>
                <Badge tone="orange">{bookmarkIds.length} mục đã lưu</Badge>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">Mục Đã Đánh Dấu (Bookmarks)</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Xem lại danh sách từ vựng trọng điểm, cụm từ khó và câu trắc nghiệm phức tạp bạn đã đánh dấu để tự học hoặc tra cứu nhanh trước giờ thi.
                </p>
              </div>

              <div className="bg-white/80 p-3.5 rounded-2xl text-xs space-y-1 text-slate-700 border border-[#FFE4D6]">
                <p className="font-bold text-slate-900">Tính năng hỗ trợ:</p>
                <p className="text-slate-600">• Luyện phát âm audio chuẩn từng từ</p>
                <p className="text-slate-600">• Xem nghĩa ngữ cảnh & giải thích chi tiết</p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-[#FFE4D6] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kho ghi chú của bạn</span>
              <Link href="/review/bookmarks">
                <Button tone="orange" size="md" className="font-bold shadow-md shadow-[#FF5C28]/20">
                  <span>Xem Mục Đã Lưu</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Spaced Repetition Stages (Leitner Method) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hộp Ghi Nhớ Leitner (Memory Tiers)</h2>
              <p className="text-xs text-slate-500">Mỗi lần bạn trả lời đúng, câu hỏi sẽ được chuyển sang chu kỳ ôn tập dài hơn.</p>
            </div>
            <Link href="/practice">
              <Button variant="ghost" size="sm" className="font-bold text-xs">
                Luyện tập thêm →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {srsBoxes.map((box, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-3xl border ${box.color} flex flex-col justify-between space-y-4 shadow-subtle`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">{box.stage}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 border border-current">
                    {box.interval}
                  </span>
                </div>

                <div className="text-3xl font-black">{box.count} <span className="text-xs font-semibold">thẻ học</span></div>

                <div className="text-[11px] opacity-80">
                  Chu kỳ tiếp theo: Tự động nhắc nhở khi đến chu kỳ tối ưu của đường cong lãng quên Ebbinghaus.
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
