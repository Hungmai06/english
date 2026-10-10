import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../middleware/responseHandler.js';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'INVALID_CREDENTIALS', 'Email and password are required', 400);
  }

  return sendSuccess(res, {
    token: 'jwt-mock-access-token-lingua-core-2026',
    user: {
      id: 'usr-1001',
      email,
      displayName: 'English Learner',
      role: 'STUDENT',
      streakDays: 5,
      totalXP: 1420,
      level: 4,
    },
  });
};

export const register = (req: Request, res: Response) => {
  const { email, password, displayName } = req.body;
  if (!email || !password) {
    return sendError(res, 'INVALID_INPUT', 'Email và mật khẩu không được để trống', 400);
  }

  return sendSuccess(
    res,
    {
      token: 'jwt-mock-access-token-lingua-core-2026',
      user: {
        id: `usr-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        role: 'STUDENT',
        streakDays: 1,
        totalXP: 100,
        level: 1,
      },
    },
    undefined,
    201
  );
};

export const getCurrentUser = (req: Request, res: Response) => {
  return sendSuccess(res, {
    id: 'usr-1001',
    email: 'learner@linguacore.com',
    displayName: 'English Learner',
    role: 'STUDENT',
    streakDays: 5,
    totalXP: 1420,
    level: 4,
  });
};
