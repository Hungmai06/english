'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Card } from '@/design-system/components/Card';
import { Progress } from '@/design-system/components/Progress';
import { Button } from '@/design-system/components/Button';

export const ContinueLearningCard: React.FC = () => {
  return (
    <Card tone="pastel" className="border-[#FFE4D6] p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5C28] bg-[#FFF0E7] px-2.5 py-0.5 rounded-full">
              Học tiếp bài dở dang
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Khoảng 5 phút nữa</span>
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Thì Hiện Tại Đơn: Công thức, thói quen & các sự thật hiển nhiên
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuyên đề các thì tiếng Anh (Verb Tenses) · Bài 01
            </p>
          </div>

          <div className="max-w-md space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-slate-600">Mức độ hoàn thành bài học</span>
              <span className="text-[#FF5C28]">75% Hoàn thành</span>
            </div>
            <Progress value={75} tone="orange" size="md" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/learn/grammar/present-simple/present-simple-1">
            <Button tone="orange" size="md" className="font-bold whitespace-nowrap shadow-md shadow-orange-500/20">
              <span>Học tiếp bài này</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
