import { Request, Response } from 'express';
import { sendSuccess } from '../middleware/responseHandler.js';

export const EXAMS_LIST = [
  {
    id: 'exam-grammar-1',
    title: 'Grammar Comprehensive Benchmark',
    slug: 'grammar-benchmark',
    type: 'grammar_mastery',
    description: 'Test your mastery across Tenses, Conditionals, Passive Voice, and Modifiers.',
    durationMinutes: 20,
    totalQuestions: 6,
    passingScore: 70,
  },
  {
    id: 'exam-toeic-1',
    title: 'TOEIC Part 5 Mini Simulation (Incomplete Sentences)',
    slug: 'toeic-part-5-mini',
    type: 'toeic_part5',
    description: 'Speed test targeting grammar traps, prepositions, and vocabulary in business context.',
    durationMinutes: 10,
    totalQuestions: 4,
    passingScore: 75,
  },
];

export const getExams = (req: Request, res: Response) => {
  return sendSuccess(res, EXAMS_LIST, { total: EXAMS_LIST.length });
};
