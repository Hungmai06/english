'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Progress } from '@/design-system/components/Progress';
import { QuestionCard } from '@/features/practice/QuestionCard';
import { ExplanationBox } from '@/features/practice/ExplanationBox';
import { ResultsSummary } from '@/features/practice/ResultsSummary';
import { PRACTICE_QUESTIONS } from '@/lib/data/mockData';
import { recordMistake, addXP, updateUserStats, getUserStats } from '@/lib/storage';
import { Question } from '@/types';

interface PracticeSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const resolvedParams = use(params);
  const { sessionId } = resolvedParams;
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') || 'all';

  // Filter questions according to topic/type
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, { isCorrect: boolean; givenAnswer: any }>>({});
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    let pool = [...PRACTICE_QUESTIONS];

    if (filter === 'present-simple') {
      pool = pool.filter((q) => q.topicId === 'present-simple');
    } else if (filter === 'conditionals') {
      pool = pool.filter((q) => q.topicId === 'conditionals');
    } else if (filter === 'toeic') {
      pool = pool.filter((q) => q.moduleId === 'toeic');
    }

    // Default to at least 4 questions
    if (pool.length < 3) {
      pool = PRACTICE_QUESTIONS.slice(0, 5);
    }

    setQuestions(pool);
  }, [filter]);

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FF5C28] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Preparing practice questions...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const handleAnswerSubmit = (givenAnswer: any, isCorrect: boolean) => {
    setIsSubmitted(true);
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { isCorrect, givenAnswer },
    }));

    if (!isCorrect) {
      // Record into Mistake Notebook
      const correctText = Array.isArray(currentQuestion.correctAnswer)
        ? currentQuestion.correctAnswer.join(', ')
        : (currentQuestion.correctAnswer as string) || 'Refer to explanation';
      recordMistake(currentQuestion, givenAnswer, correctText);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsSubmitted(false);
    } else {
      // Complete Session
      const total = questions.length;
      const correct = Object.values(answers).filter((a) => a.isCorrect).length;
      const score = Math.round((correct / total) * 100);
      const earnedXP = correct * 15;

      addXP(earnedXP);

      const stats = getUserStats();
      updateUserStats({
        questionsAnswered: stats.questionsAnswered + total,
      });

      setIsSessionComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setIsSubmitted(false);
    setAnswers({});
    setIsSessionComplete(false);
  };

  const correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="bg-[#FAF8F5] min-h-screen pb-20">
      {/* Top Session Status Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30">
        <Container size="md" className="py-3 flex items-center justify-between gap-4">
          <Link
            href="/practice"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF5C28] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Exit Practice</span>
          </Link>

          {!isSessionComplete && (
            <div className="flex-1 max-w-xs space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} tone="orange" size="sm" />
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200/60">
            <Zap className="w-3.5 h-3.5 fill-orange-500" />
            <span>Practice Mode</span>
          </div>
        </Container>
      </div>

      {/* Main Question Runner or Results */}
      <Container size="md" className="mt-8">
        {isSessionComplete ? (
          <ResultsSummary
            score={score}
            totalQuestions={questions.length}
            correctCount={correctCount}
            xpEarned={correctCount * 15}
            answers={answers}
            questions={questions}
            onRetry={handleRetry}
          />
        ) : (
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              isSubmitted={isSubmitted}
              onAnswer={handleAnswerSubmit}
            />

            {isSubmitted && (
              <ExplanationBox
                question={currentQuestion}
                isCorrect={currentAnswer?.isCorrect ?? false}
                onNext={handleNext}
                isLastQuestion={currentIndex === questions.length - 1}
              />
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
