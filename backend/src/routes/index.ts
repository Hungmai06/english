import { Router } from 'express';
import { getModules } from '../controllers/modules.controller.js';
import { getGrammarCategories, getTopicBySlug } from '../controllers/grammar.controller.js';
import {
  getVocabularyList,
  previewVocabularyImport,
  batchImportVocabulary,
} from '../controllers/vocabulary.controller.js';
import {
  createPracticeSession,
  submitSessionAnswer,
} from '../controllers/practice.controller.js';
import { getExams } from '../controllers/exams.controller.js';
import { login, register, getCurrentUser } from '../controllers/auth.controller.js';

export const apiRouter = Router();

// Auth (Section 28)
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/register', register);
apiRouter.get('/auth/me', getCurrentUser);

// Modules (Section 29)
apiRouter.get('/modules', getModules);

// Grammar (Section 31)
apiRouter.get('/grammar/categories', getGrammarCategories);
apiRouter.get('/grammar/topics/:slug', getTopicBySlug);

// Vocabulary (Section 32, 101.18, 104)
apiRouter.get('/vocabulary', getVocabularyList);
apiRouter.post('/vocabulary/import/preview', previewVocabularyImport);
apiRouter.post('/vocabulary/import', batchImportVocabulary);

// Practice Session Engine (Section 12 & 35)
apiRouter.post('/practice/sessions', createPracticeSession);
apiRouter.post('/practice/sessions/:id/answers', submitSessionAnswer);

// Exams (Section 36)
apiRouter.get('/exams', getExams);
