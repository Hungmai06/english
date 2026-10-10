import { Request, Response } from 'express';
import { BACKEND_QUESTIONS } from '../data/mockDatabase.js';
import { sendSuccess, sendError } from '../middleware/responseHandler.js';

interface BackendPracticeSession {
  id: string;
  moduleId: string;
  topicId?: string;
  questionIds: string[];
  answers: Record<string, { givenAnswer: any; isCorrect: boolean }>;
  startedAt: string;
  completedAt?: string;
  scorePercent?: number;
}

const activeSessions: Record<string, BackendPracticeSession> = {};

// Section 12: POST /api/v1/practice/sessions
export const createPracticeSession = (req: Request, res: Response) => {
  const { moduleId = 'grammar', topicId } = req.body;

  let pool = [...BACKEND_QUESTIONS];
  if (topicId) {
    pool = pool.filter((q) => q.topicId === topicId);
  } else if (moduleId) {
    pool = pool.filter((q) => q.moduleId === moduleId);
  }

  if (pool.length === 0) {
    pool = BACKEND_QUESTIONS.slice(0, 4);
  }

  const sessionId = `session-${Date.now()}`;
  activeSessions[sessionId] = {
    id: sessionId,
    moduleId,
    topicId,
    questionIds: pool.map((q) => q.id),
    answers: {},
    startedAt: new Date().toISOString(),
  };

  // Strip correct answer for exam security (Section 12 rule)
  const clientQuestions = pool.map((q) => {
    const { correctAnswer, ...safe } = q;
    return safe;
  });

  return sendSuccess(res, {
    sessionId,
    questionsCount: pool.length,
    questions: clientQuestions,
  });
};

// Section 12: POST /api/v1/practice/sessions/:id/answers
export const submitSessionAnswer = (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { questionId, answer } = req.body;

  const session = activeSessions[id as string];
  if (!session) {
    return sendError(res, 'SESSION_NOT_FOUND', `Practice session '${id}' was not found`, 404);
  }

  const question = BACKEND_QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    return sendError(res, 'QUESTION_NOT_FOUND', `Question '${questionId}' was not found`, 404);
  }

  const isCorrect = String(answer).trim().toLowerCase() === String(question.correctAnswer).trim().toLowerCase();

  session.answers[questionId] = {
    givenAnswer: answer,
    isCorrect,
  };

  return sendSuccess(res, {
    questionId,
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    ruleReference: question.ruleReference,
  });
};
