'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Clock, HelpCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { EXAMS_DATA } from '@/lib/data/mockData';

export default function ExamsCatalogPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 pb-20">
      <Container size="lg" className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <Badge tone="orange">Diagnostic & Mock Exams</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            English Proficiency & Exam Simulations
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Validate your mastery under realistic exam conditions. Timed countdown, question flagging,
            and comprehensive score analytics with band benchmarks.
          </p>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {EXAMS_DATA.map((exam) => (
            <Card
              key={exam.id}
              tone="white"
              interactive
              className="p-6 sm:p-7 flex flex-col justify-between border-slate-200/90 shadow-subtle hover:border-[#FF5C28]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF0E7] text-[#FF5C28] flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <Badge tone="orange">
                    Pass: {exam.passingScore}%
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    {exam.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.durationMinutes} mins</span>
                  </span>
                  <span>•</span>
                  <span>{exam.totalQuestions} Questions</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Timed Test</span>
                <Link href={`/exams/${exam.slug}`}>
                  <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                    <span>Start Exam</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
