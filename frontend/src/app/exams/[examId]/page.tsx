'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Clock,
  Flag,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { Modal } from '@/design-system/components/Modal';
import { EXAMS_DATA, PRACTICE_QUESTIONS } from '@/lib/data/mockData';
import { formatTime } from '@/lib/utils';
import { addXP, recordMistake } from '@/lib/storage';
import { CoinIcon } from '@/components/CoinIcon';

interface ExamRunnerProps {
  params: Promise<{ examId: string }>;
}

export default function ExamRunnerPage({ params }: ExamRunnerProps) {
  const resolvedParams = use(params);
  const { examId } = resolvedParams;

  const exam =
    EXAMS_DATA.find((e) => e.slug === examId || e.id === examId) || EXAMS_DATA[0];

  const questions = exam.questions.length > 0 ? exam.questions : PRACTICE_QUESTIONS;

  // Exam States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = questions[currentIndex];
  const selectedAnswer = answers[currentQ.id];
  const isCurrentFlagged = !!flagged[currentQ.id];

  const handleSelectOption = (optId: string) => {
    if (isFinished) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleToggleFlag = () => {
    setFlagged((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const handleSubmitExam = () => {
    setIsSubmitModalOpen(false);
    setIsFinished(true);

    // Calculate score
    let correct = 0;
    questions.forEach((q) => {
      const userAns = answers[q.id];
      const isCorrect = userAns && userAns.toLowerCase() === (q.correctAnswer as string).toLowerCase();
      if (isCorrect) {
        correct++;
      } else {
        recordMistake(q, userAns || 'No Answer', (q.correctAnswer as string) || 'Option A');
      }
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    addXP(correct * 20);
  };

  // Score calculation for review
  const correctCount = questions.filter(
    (q) => answers[q.id]?.toLowerCase() === (q.correctAnswer as string).toLowerCase()
  ).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const isPassed = scorePercent >= exam.passingScore;

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Top Exam Header */}
      <header className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <Container size="lg" className="py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/exams"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="font-bold text-sm text-slate-900 line-clamp-1">{exam.title}</h2>
              <span className="text-[11px] text-slate-400">
                {Object.keys(answers).length} of {questions.length} answered
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold border ${
                timeLeft < 180
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {!isFinished && (
              <Button
                onClick={() => setIsSubmitModalOpen(true)}
                tone="orange"
                size="sm"
                className="font-bold shadow-sm"
              >
                Submit Exam
              </Button>
            )}
          </div>
        </Container>
      </header>

      <Container size="lg" className="mt-8">
        {!isFinished ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Active Question Area */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-subtle space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF5C28]">
                    Question {currentIndex + 1} of {questions.length}
                  </span>

                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                      isCurrentFlagged
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-500' : ''}`} />
                    <span>{isCurrentFlagged ? 'Flagged' : 'Flag for review'}</span>
                  </button>
                </div>

                <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.prompt}
                </div>

                {/* Options list */}
                <div className="space-y-3">
                  {(currentQ.options || [
                    { id: 'a', text: 'Option A' },
                    { id: 'b', text: 'Option B' },
                    { id: 'c', text: 'Option C' },
                    { id: 'd', text: 'Option D' },
                  ]).map((opt) => {
                    const isSelected = selectedAnswer === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#FFF0E7] border-[#FF5C28] text-orange-950 shadow-sm'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center uppercase ${
                              isSelected
                                ? 'bg-[#FF5C28] text-white'
                                : 'bg-white text-slate-700 border border-slate-200'
                            }`}
                          >
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Next Bottom Strip */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  tone="orange"
                  size="md"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="font-bold"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Right: Question Palette Navigator */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Question Navigator</h3>

                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id];
                    const isFlag = !!flagged[q.id];
                    const isCurrent = currentIndex === idx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-10 rounded-xl text-xs font-bold transition-all relative ${
                          isCurrent
                            ? 'ring-2 ring-[#FF5C28] ring-offset-2'
                            : ''
                        } ${
                          isAnswered
                            ? 'bg-[#FF5C28] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isFlag && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-[#FF5C28]" />
                    <span>Answered ({Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-slate-100" />
                    <span>Unanswered ({questions.length - Object.keys(answers).length})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-amber-400" />
                    <span>Flagged for review ({Object.keys(flagged).filter((k) => flagged[k]).length})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Finished Exam Score & Review View */
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center space-y-6 shadow-card">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white shadow-lg ${
                  isPassed
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-emerald-500/25'
                    : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-orange-500/25'
                }`}
              >
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <Badge tone={isPassed ? 'green' : 'orange'}>
                  {isPassed ? 'Benchmark Passed' : 'Needs Practice'}
                </Badge>
                <h2 className="text-3xl font-black text-slate-900 mt-2">{exam.title}</h2>
                <p className="text-sm text-slate-500">
                  Passing Score: {exam.passingScore}% · Time Spent: {formatTime(exam.durationMinutes * 60 - timeLeft)}
                </p>
              </div>

              {/* Big Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="text-3xl font-black text-[#FF5C28]">{scorePercent}%</div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Final Score</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="text-3xl font-black text-emerald-600">
                    {correctCount}/{questions.length}
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Correct Answers</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                  <div className="text-3xl font-black text-amber-500 flex items-center justify-center gap-1.5">
                    <span>+{correctCount * 20}</span>
                    <CoinIcon className="w-6 h-6 inline-block" />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-0.5">Xu đạt được</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Link href="/review/mistakes">
                  <Button tone="orange" size="md" className="font-bold shadow-md shadow-orange-500/20">
                    <RotateCcw className="w-4 h-4 mr-1.5" />
                    <span>Review Missed Questions</span>
                  </Button>
                </Link>
                <Link href="/exams">
                  <Button variant="outline" size="md" className="font-bold">
                    Back to All Exams
                  </Button>
                </Link>
              </div>
            </div>

            {/* Comprehensive Question Review Key */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 px-1">Detailed Answer Key</h3>

              {questions.map((q, i) => {
                const userChoice = answers[q.id];
                const isCorrect =
                  userChoice && userChoice.toLowerCase() === (q.correctAnswer as string).toLowerCase();

                return (
                  <div
                    key={q.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">Question {i + 1}</span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          isCorrect ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span>{isCorrect ? 'Correct' : 'Missed'}</span>
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900">{q.prompt}</p>

                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Your Answer:</span>
                        <span className="font-bold uppercase text-slate-800">{userChoice || 'None'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Correct Answer:</span>
                        <span className="font-bold uppercase text-emerald-700">{q.correctAnswer as string}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                      <strong className="text-[#FF5C28]">Explanation: </strong>
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Container>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Confirm Exam Submission"
        description="Are you sure you want to finalize your exam attempt?"
        size="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <p className="font-bold">Summary before submitting:</p>
            <p>• {Object.keys(answers).length} of {questions.length} answered</p>
            <p>• {questions.length - Object.keys(answers).length} unanswered</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="md" onClick={() => setIsSubmitModalOpen(false)}>
              Keep Working
            </Button>
            <Button onClick={handleSubmitExam} tone="orange" size="md" className="font-bold">
              Submit & View Score
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
