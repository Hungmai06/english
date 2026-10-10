import { Request, Response } from 'express';
import { BACKEND_GRAMMAR_CATEGORIES } from '../data/mockDatabase.js';
import { sendSuccess, sendError } from '../middleware/responseHandler.js';

export const getGrammarCategories = (req: Request, res: Response) => {
  return sendSuccess(res, BACKEND_GRAMMAR_CATEGORIES, {
    total: BACKEND_GRAMMAR_CATEGORIES.length,
  });
};

export const getTopicBySlug = (req: Request, res: Response) => {
  const { slug } = req.params;
  for (const cat of BACKEND_GRAMMAR_CATEGORIES) {
    const topic = cat.topics.find((t) => t.slug === slug || t.id === slug);
    if (topic) {
      return sendSuccess(res, { ...topic, categoryName: cat.name });
    }
  }
  return sendError(res, 'TOPIC_NOT_FOUND', `Topic '${slug}' was not found`, 404);
};
