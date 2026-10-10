import { Request, Response } from 'express';
import { BACKEND_MODULES } from '../data/mockDatabase.js';
import { sendSuccess } from '../middleware/responseHandler.js';

export const getModules = (req: Request, res: Response) => {
  return sendSuccess(res, BACKEND_MODULES, { total: BACKEND_MODULES.length });
};
