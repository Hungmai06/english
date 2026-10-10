'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Flame, Trophy, ArrowRight, Clock } from 'lucide-react';
import { Card } from '@/design-system/components/Card';
import { Button } from '@/design-system/components/Button';
import { CoinIcon } from '@/components/CoinIcon';

export const DailyChallengeCard: React.FC = () => {
  return (
    <Card tone="cream" className="border-amber-200/80 p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-xs uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              Thói quen hàng ngày
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Làm mới vào lúc 00:00 mỗi đêm
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Thử Thách Hôm Nay: 5 Câu Hỏi Trọng Tâm
          </h3>

          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            Chỉ mất 3 phút để ôn lại các bẫy ngữ pháp thường gặp, collocations trong đề thi TOEIC và cách chia động từ.
            Duy trì chuỗi ngày học liên tục (streak) và nhận thêm xu thưởng.
          </p>

          <div className="flex items-center gap-4 pt-1 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 text-orange-600">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>+1 Ngày Streak</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700 font-bold">
              <CoinIcon className="w-4 h-4" />
              <span>+50 Xu thưởng</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end justify-center gap-3">
          <Link href="/practice?mode=daily" className="w-full">
            <Button
              tone="orange"
              size="lg"
              className="w-full font-bold shadow-lg shadow-orange-500/25"
            >
              <span>Bắt đầu thử thách</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <span className="text-center text-xs text-slate-400">
            Thời gian hoàn thành trung bình: 2 phút 45 giây
          </span>
        </div>
      </div>
    </Card>
  );
};
