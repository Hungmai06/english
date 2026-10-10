'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  BookOpen,
  Award,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { getMistakes } from '@/lib/storage';
import { CoinIcon } from '@/components/CoinIcon';

export default function PracticeHubPage() {
  const [mistakesCount, setMistakesCount] = React.useState(0);

  React.useEffect(() => {
    const list = getMistakes();
    setMistakesCount(list.filter((m) => m.status === 'needs_review').length);
  }, []);

  const PRACTICE_TRACKS = [
    {
      id: 'session-daily',
      title: 'Thử Thách Nhanh Hôm Nay',
      description: '5 câu hỏi trọng điểm bao quát các thì, collocations và cấu trúc câu thường gặp. Có thưởng streak & Xu thưởng.',
      tag: 'Thói quen mỗi ngày',
      tone: 'orange' as const,
      icon: Zap,
      questionsCount: '5 câu hỏi',
      xp: '+50 Xu',
      filter: 'all',
    },
    {
      id: 'session-tenses',
      title: 'Luyện Phản Xạ Các Thì Động Từ',
      description: 'Thực hành Hiện tại đơn, Tiếp diễn, Hoàn thành và Quá khứ với các dạng bài tự gõ chia động từ và xếp câu.',
      tag: 'Ngữ pháp thì',
      tone: 'orange' as const,
      icon: BookOpen,
      questionsCount: '4 câu hỏi',
      xp: '+40 Xu',
      filter: 'present-simple',
    },
    {
      id: 'session-conditionals',
      title: 'Câu Điều Kiện (Conditionals)',
      description: 'Phân biệt điều kiện loại 1, loại 2 và câu điều kiện hỗn hợp (Mixed) qua dạng bài sửa lỗi gạch chân.',
      tag: 'Cấu trúc câu',
      tone: 'purple' as const,
      icon: Sparkles,
      questionsCount: '3 câu hỏi',
      xp: '+30 Xu',
      filter: 'conditionals',
    },
    {
      id: 'session-toeic',
      title: 'TOEIC Part 5: Điền Khuyết Nhanh',
      description: 'Nhận diện từ loại, bẫy giới từ và cụm từ cố định trong ngữ cảnh văn phòng, kinh doanh.',
      tag: 'Luyện thi TOEIC',
      tone: 'warm' as const,
      icon: Award,
      questionsCount: '4 câu hỏi',
      xp: '+45 Xu',
      filter: 'toeic',
    },
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge tone="orange">Động Cơ Luyện Phản Xạ</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Phòng Luyện Tập Tương Tác
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            Kiểm tra mức độ ghi nhớ với phản hồi tức thì. Không học vẹt: bạn sẽ tự tay gõ từ, sắp xếp lại câu,
            ghép cặp từ và nhận giải thích cặn kẽ tại chỗ.
          </p>
        </div>

        {/* Mistake Notebook Banner if any mistakes */}
        {mistakesCount > 0 && (
          <Card tone="orange" className="p-6 border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Bạn có {mistakesCount} câu sai cần ôn lại trong Sổ tay lỗi sai
                </h3>
                <p className="text-xs text-slate-600">
                  Làm lại các câu này cho đến khi trả lời đúng 2 lần liên tiếp để biến điểm yếu thành điểm mạnh.
                </p>
              </div>
            </div>

            <Link href="/review/mistakes">
              <Button tone="orange" size="md" className="font-bold whitespace-nowrap shadow-md shadow-orange-500/20">
                <span>Vào ôn lại lỗi sai</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </Card>
        )}

        {/* Practice Tracks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRACTICE_TRACKS.map((track) => {
            const Icon = track.icon;
            return (
              <Card
                key={track.id}
                tone={track.tone}
                className="p-6 sm:p-7 flex flex-col justify-between border-slate-200/80 shadow-subtle"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-800">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge tone="orange">
                      {track.tag}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{track.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span>{track.questionsCount}</span>
                    <span>•</span>
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <CoinIcon className="w-3.5 h-3.5" />
                      <span>{track.xp}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Chấm điểm & giải thích tức thì</span>
                  <Link href={`/practice/${track.id}?filter=${track.filter}`}>
                    <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                      <span>Vào luyện ngay</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
