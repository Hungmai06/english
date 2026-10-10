import { Request, Response } from 'express';
import { BACKEND_VOCABULARY } from '../data/mockDatabase.js';
import { sendSuccess, sendError } from '../middleware/responseHandler.js';

let activeVocabulary = [...BACKEND_VOCABULARY];

export const getVocabularyList = (req: Request, res: Response) => {
  const { q, collection, level } = req.query;
  let results = [...activeVocabulary];

  if (collection && collection !== 'all') {
    results = results.filter((w) => w.collectionId === collection);
  }

  if (level) {
    results = results.filter((w) => w.level === level);
  }

  if (q && typeof q === 'string') {
    const search = q.toLowerCase();
    results = results.filter(
      (w) =>
        w.lemma.toLowerCase().includes(search) ||
        w.senses.some(
          (s) =>
            s.definition.toLowerCase().includes(search) ||
            s.viDefinition.toLowerCase().includes(search)
        )
    );
  }

  return sendSuccess(res, results, {
    total: results.length,
    limit: 50,
    page: 1,
  });
};

// Section 101.18 & 104: Preview CSV / Text before importing with deduplication
export const previewVocabularyImport = (req: Request, res: Response) => {
  const { rawText } = req.body;
  if (!rawText || typeof rawText !== 'string') {
    return sendError(res, 'INVALID_INPUT', 'Field rawText is required', 400);
  }

  const existingLemmas = new Set(activeVocabulary.map((w) => w.normalizedLemma));
  const lines = rawText.split('\n').filter((l) => l.trim().length > 0);

  const preview = lines.map((line, idx) => {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 5) {
      return {
        line: idx + 1,
        lemma: parts[0] || 'Unknown',
        status: 'invalid',
        reason: 'Missing required comma-separated columns',
      };
    }

    const [lemma, ipa, pos, def, viDef, lvl] = parts;
    const norm = lemma.toLowerCase().trim();

    if (existingLemmas.has(norm)) {
      return {
        line: idx + 1,
        lemma,
        ipa,
        status: 'duplicate',
        reason: 'Lemma already exists in database (prevented duplicate insertion)',
      };
    }

    return {
      line: idx + 1,
      lemma,
      ipa,
      partOfSpeech: pos,
      definition: def,
      viDefinition: viDef,
      level: lvl || 'B1',
      status: 'valid',
    };
  });

  return sendSuccess(res, {
    totalRows: lines.length,
    validCount: preview.filter((p) => p.status === 'valid').length,
    duplicateCount: preview.filter((p) => p.status === 'duplicate').length,
    invalidCount: preview.filter((p) => p.status === 'invalid').length,
    rows: preview,
  });
};

// Section 101.16: Batch import items
export const batchImportVocabulary = (req: Request, res: Response) => {
  const { words } = req.body;
  if (!Array.isArray(words)) {
    return sendError(res, 'INVALID_INPUT', 'Expected an array of words to import', 400);
  }

  const existingLemmas = new Set(activeVocabulary.map((w) => w.normalizedLemma));
  const added: any[] = [];

  for (const w of words) {
    const norm = (w.lemma || '').toLowerCase().trim();
    if (!existingLemmas.has(norm) && w.lemma) {
      existingLemmas.add(norm);
      const newEntry = {
        id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        lemma: w.lemma,
        normalizedLemma: norm,
        ipa: w.ipa || '/.../',
        level: w.level || 'B2',
        collectionId: 'col-oxford',
        senses: [
          {
            id: `s-${Date.now()}`,
            partOfSpeech: w.partOfSpeech || 'noun',
            definition: w.definition || '',
            viDefinition: w.viDefinition || '',
            examples: [],
          },
        ],
        collocations: [],
      };
      activeVocabulary.push(newEntry);
      added.push(newEntry);
    }
  }

  return sendSuccess(res, {
    importedCount: added.length,
    totalDatabaseWords: activeVocabulary.length,
  });
};
