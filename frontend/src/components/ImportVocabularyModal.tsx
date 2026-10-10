'use client';

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, X, Table } from 'lucide-react';
import { Modal } from '@/design-system/components/Modal';
import { Button } from '@/design-system/components/Button';
import { Badge } from '@/design-system/components/Badge';
import { VOCABULARY_WORDS } from '@/lib/data/mockData';
import { addCustomVocabWords, getCustomDecks, CustomDeck } from '@/lib/storage';
import { VocabularyWord } from '@/types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  defaultDeckId?: string;
}

interface ParsedRow {
  lemma: string;
  ipa: string;
  partOfSpeech: string;
  definition: string;
  viDefinition: string;
  level: string;
  status: 'valid' | 'duplicate' | 'invalid';
  reason?: string;
}

export const ImportVocabularyModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  defaultDeckId,
}) => {
  const [step, setStep] = useState<'input' | 'preview' | 'importing' | 'complete'>('input');
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([]);
  const [targetDeckId, setTargetDeckId] = useState<string>(defaultDeckId || 'cdeck-academic');

  React.useEffect(() => {
    if (isOpen) {
      const decks = getCustomDecks();
      setCustomDecks(decks);
      if (defaultDeckId) {
        setTargetDeckId(defaultDeckId);
      } else if (decks.length > 0) {
        setTargetDeckId(decks[0].id);
      }
    }
  }, [isOpen, defaultDeckId]);

  const [rawText, setRawText] = useState(
    `collaborate, /kəˈlæb.ə.reɪt/, verb, To work jointly on an activity or project., Hợp tác làm việc cùng nhau., B2\n` +
    `innovative, /ˈɪn.ə.veɪ.tɪv/, adjective, Introducing new ideas; original and creative., Có tính đổi mới sáng tạo., B2\n` +
    `accomplish, /əˈkʌm.plɪʃ/, verb, To succeed in finishing something., Hoàn thành mục tiêu., B2\n` +
    `benchmark, /ˈbentʃ.mɑːk/, noun, A standard or point of reference against which things may be compared., Tiêu chuẩn đối sánh., C1`
  );

  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  // Parse input text / CSV
  const handleGeneratePreview = () => {
    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const existingLemmas = new Set(
      VOCABULARY_WORDS.map((w) => w.lemma.toLowerCase().trim())
    );

    const parsed: ParsedRow[] = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length < 5) {
        return {
          lemma: parts[0] || 'Unknown',
          ipa: '',
          partOfSpeech: '',
          definition: '',
          viDefinition: '',
          level: 'B1',
          status: 'invalid',
          reason: 'Missing required comma-separated columns',
        };
      }

      const [lemma, ipa, pos, def, viDef, lvl] = parts;
      const cleanLemma = lemma.toLowerCase().trim();

      if (existingLemmas.has(cleanLemma)) {
        return {
          lemma,
          ipa: ipa || '/.../',
          partOfSpeech: pos || 'noun',
          definition: def,
          viDefinition: viDef,
          level: lvl || 'B1',
          status: 'duplicate',
          reason: 'Lemma already exists in database (Section 101.18 deduplication)',
        };
      }

      return {
        lemma,
        ipa: ipa || '/.../',
        partOfSpeech: pos || 'noun',
        definition: def,
        viDefinition: viDef,
        level: lvl || 'B1',
        status: 'valid',
      };
    });

    setPreviewRows(parsed);
    setStep('preview');
  };

  // Perform import (simulates async batch job as described in section 101.16)
  const handleStartImport = () => {
    setStep('importing');
    setImportProgress(10);

    const validRows = previewRows.filter((r) => r.status === 'valid');

    const newWords: VocabularyWord[] = validRows.map((r, i) => ({
      id: `custom-w-${Date.now()}-${i}`,
      lemma: r.lemma,
      ipa: r.ipa,
      level: (r.level as any) || 'B2',
      collectionId: targetDeckId || 'cdeck-academic',
      senses: [
        {
          id: `custom-s-${Date.now()}-${i}`,
          partOfSpeech: (r.partOfSpeech.toLowerCase() as any) || 'noun',
          definition: r.definition,
          viDefinition: r.viDefinition,
          examples: [
            {
              en: `They learned how to ${r.lemma} effectively.`,
              vi: `Họ đã học cách ${r.viDefinition.toLowerCase()}.`,
            },
          ],
        },
      ],
      collocations: [`effective ${r.lemma}`, `strategy to ${r.lemma}`],
      isMastered: false,
      isBookmarked: false,
    }));

    // Animate progress
    let p = 20;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(interval);
        setImportProgress(100);
        addCustomVocabWords(newWords);
        setTimeout(() => {
          setStep('complete');
        }, 400);
      } else {
        setImportProgress(p);
      }
    }, 200);
  };

  const handleReset = () => {
    setStep('input');
    setImportProgress(0);
  };

  const validCount = previewRows.filter((r) => r.status === 'valid').length;
  const duplicateCount = previewRows.filter((r) => r.status === 'duplicate').length;
  const invalidCount = previewRows.filter((r) => r.status === 'invalid').length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nhập từ vựng vào Bộ Từ Của Tôi"
      description="Dán danh sách từ hoặc tải file để thêm trực tiếp vào Bộ từ cá nhân và luyện tập ngay."
      size="xl"
    >
      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FFF0E7]/70 border border-[#FFE4D6] text-xs text-orange-950 leading-relaxed">
            <span className="font-bold">Format requirement: </span>
            <code>Word, /IPA/, Part of Speech, English Definition, Vietnamese Meaning, CEFR Level</code>
            <p className="mt-1 text-slate-500">
              The engine automatically normalizes lemmas, strips whitespace, and identifies existing database duplicates.
            </p>
          </div>

          {/* Chọn bộ từ cần lưu vào */}
          {customDecks.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Lưu vào bộ từ:
              </label>
              <select
                value={targetDeckId}
                onChange={(e) => setTargetDeckId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              >
                {customDecks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.icon} {d.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Paste CSV / Text Data
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF5C28]/30 focus:border-[#FF5C28]"
              placeholder="e.g. collaborate, /kəˈlæb.ə.reɪt/, verb, To work jointly, Hợp tác, B2"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="md" onClick={onClose} className="text-slate-500">
              Cancel
            </Button>
            <Button
              onClick={handleGeneratePreview}
              tone="orange"
              size="md"
              className="font-bold shadow-md shadow-orange-500/20"
            >
              <Table className="w-4 h-4 mr-1.5" />
              <span>Generate Preview Table</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Preview Table */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* Summary stats strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <span className="font-bold block text-sm">{validCount} Ready to Import</span>
              <span>Valid new words</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <span className="font-bold block text-sm">{duplicateCount} Duplicates</span>
              <span>Will be skipped</span>
            </div>
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
              <span className="font-bold block text-sm">{invalidCount} Malformed</span>
              <span>Requires fixing</span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[350px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Lemma</th>
                  <th className="p-3">IPA / POS</th>
                  <th className="p-3">Definition & Meaning</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row.status === 'valid'
                        ? 'hover:bg-slate-50'
                        : row.status === 'duplicate'
                        ? 'bg-amber-50/40 text-slate-500'
                        : 'bg-red-50/40 text-red-800'
                    }
                  >
                    <td className="p-3 font-bold text-slate-900">{row.lemma}</td>
                    <td className="p-3 text-slate-500">
                      {row.ipa} <span className="italic">({row.partOfSpeech})</span>
                    </td>
                    <td className="p-3">
                      <div className="line-clamp-1">{row.definition}</div>
                      <div className="text-slate-400 line-clamp-1 italic">{row.viDefinition}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold">
                        {row.level}
                      </span>
                    </td>
                    <td className="p-3">
                      {row.status === 'valid' && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      )}
                      {row.status === 'duplicate' && (
                        <span className="text-amber-600 font-semibold flex items-center gap-1" title={row.reason}>
                          <AlertCircle className="w-3.5 h-3.5" /> Duplicate
                        </span>
                      )}
                      {row.status === 'invalid' && (
                        <span className="text-red-600 font-semibold flex items-center gap-1" title={row.reason}>
                          <AlertCircle className="w-3.5 h-3.5" /> Invalid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="md" onClick={handleReset} className="text-slate-500">
              Back to Edit
            </Button>
            <Button
              onClick={handleStartImport}
              disabled={validCount === 0}
              tone="orange"
              size="md"
              className="font-bold shadow-md shadow-orange-500/20"
            >
              <span>Confirm & Import ({validCount} Words)</span>
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Importing */}
      {step === 'importing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Processing Batch Import...</h4>
          <p className="text-xs text-slate-500">
            Applying database uniqueness constraints and inserting vocabulary senses.
          </p>
          <div className="max-w-xs mx-auto bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${importProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <div className="py-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-slate-900">Import Completed Successfully!</h4>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            {validCount} new words have been added to your local vocabulary repository and are ready for practice.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => {
                onImportSuccess();
                onClose();
              }}
              tone="blue"
              size="md"
              className="font-bold"
            >
              View Updated Lexicon
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
