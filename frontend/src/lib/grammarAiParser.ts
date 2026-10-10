import {
  TheoryBlock,
  LessonExample,
  BankQuestion,
  CefrLevel,
  ExamSettings,
  GrammarLesson,
} from '@/types/grammarSystem';
import { computeNormalizedHash, findDuplicateInBank } from './questionBankStorage';

export interface ParseResult {
  lessonTitle: string;
  lessonSubtitle: string;
  description: string;
  cefr: CefrLevel;
  estimatedTime: string;
  theoryBlocks: TheoryBlock[];
  examples: LessonExample[];
  questions: BankQuestion[];
  duplicateCount: number;
  examSettings: ExamSettings;
  rawStats: {
    totalBlocks: number;
    totalExamples: number;
    totalQuestions: number;
  };
}

/**
 * Intelligent AI parser that analyzes raw documents or lecture notes and automatically classifies:
 * 1. TheoryBlocks[] (Freestyle blocks: Headings, Formulas, Callouts, Pitfalls, Tables, Paragraphs)
 * 2. Examples[] (Bilingual English / Vietnamese pairs with context & breakdowns)
 * 3. Questions[] (Multiple-choice exercises with options, answers, and explanations)
 * 
 * Crucial Rule:
 * DOES NOT create Online Exam at import step:
 * ✓ Theory
 * ✓ Examples
 * ✓ Exercises
 * ○ Online Exam NOT created yet (configured later from Question Bank)
 */
function normalizeImportText(raw: string): string {
  if (!raw) return '';
  let text = raw;
  // 1. Clean PDF watermarks / pagination
  text = text.replace(/Page:\s*Tài Liệu Khóa Học Hay Miễn Phí[^\n]*/gi, '');
  // 2. Line break before Roman numeral headings
  text = text.replace(/([^\n])\s+([IVXLCDM]+\.\s+[A-ZÀ-Ỹ0-9])/g, '$1\n\n$2');
  // 3. Line break before PRACTICE, BÀI TẬP
  text = text.replace(/([^\n])\s+(PRACTICE|BÀI TẬP|LUYỆN TẬP|VÍ DỤ:)/gi, '$1\n\n$2');
  // 4. Line break before bullet points
  text = text.replace(/([^\n])\s+([•\-+]\s+)/g, '$1\n$2');
  // 5. Line break before numbered points
  text = text.replace(/([.!?\):…])\s+(\d+\.\s+[A-ZÀ-Ỹa-z0-9])/g, '$1\n\n$2');
  // 6. Line break before sub-options
  text = text.replace(/([.!?\):…])\s+([a-d]\)\s+)/gi, '$1\n$2');
  return text;
}

export function parseDocumentWithAi(
  rawText: string,
  topicId: string,
  targetCefr: CefrLevel = 'B1'
): ParseResult {
  const cleanedText = normalizeImportText(rawText);
  const lines = cleanedText.split(/\r?\n/).map((l) => l.trim());
  const nonBlankLines = lines.filter((l) => l.length > 0);

  let lessonTitle = 'Bài Học Ngữ Pháp Mới';
  let lessonSubtitle = 'Khái niệm, công thức & vận dụng thực tế';
  let description = '';
  let estimatedTime = '20 phút';

  const theoryBlocks: TheoryBlock[] = [];
  const examples: LessonExample[] = [];
  const rawQuestions: Omit<BankQuestion, 'id' | 'normalizedHash'>[] = [];

  let blockOrder = 1;
  let duplicateCount = 0;

  // State machine for multi-line extraction
  let currentSection: 'theory' | 'examples' | 'exercises' = 'theory';

  // Temporary buffers
  let activeQuestion: {
    prompt: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    // 1. Detect Document / Lesson Title from the very top
    if (i < 5 && (line.startsWith('# ') || line.match(/^(Bài \d+:|Lesson \d+:|Chuyên đề)/i))) {
      lessonTitle = line.replace(/^[#\s]+/, '').replace(/^(Bài \d+:|Lesson \d+:)\s*/i, '').trim();
      continue;
    }
    if (i < 8 && !lessonSubtitle && line.startsWith('## ') && !line.toLowerCase().includes('lý thuyết')) {
      lessonSubtitle = line.replace(/^[#\s]+/, '').trim();
      continue;
    }

    // 2. Detect Section Switches
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.match(/^(1\.?|i\.?|\#\#)\s*(lý thuyết|ngữ pháp|theory|cấu trúc|quy tắc)/i) ||
      lowerLine === 'lý thuyết' ||
      lowerLine === 'theory'
    ) {
      currentSection = 'theory';
      continue;
    }
    if (
      lowerLine.match(/^(2\.?|ii\.?|\#\#)\s*(ví dụ|examples|câu mẫu|example)/i) ||
      lowerLine === 'ví dụ' ||
      lowerLine === 'examples'
    ) {
      currentSection = 'examples';
      continue;
    }
    if (
      lowerLine.match(/^(3\.?|iii\.?|\#\#)\s*(bài tập|luyện tập|exercises|practice|câu hỏi)/i) ||
      lowerLine === 'bài tập' ||
      lowerLine === 'exercises'
    ) {
      currentSection = 'exercises';
      continue;
    }

    // =========================================================================
    // SECTION 1: THEORY PARSING (FREESTYLE BLOCKS)
    // =========================================================================
    if (currentSection === 'theory') {
      // Heading detection
      if (line.startsWith('#') || line.match(/^[0-9IVX]+\.\s+[A-ZÀ-Ỹ]/)) {
        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'heading',
          content: line.replace(/^[#\s]+/, '').trim(),
          data: { level: line.startsWith('###') ? 3 : 2 },
          order: blockOrder++,
        });
        continue;
      }

      // Formula / Rule detection
      if (
        line.toLowerCase().includes('công thức') ||
        line.toLowerCase().includes('cấu trúc') ||
        line.toLowerCase().includes('formula:') ||
        line.match(/\b(S\s*\+\s*V|S\s*\+\s*am\/is\/are|S\s*\+\s*have|S\s*\+\s*had)\b/i)
      ) {
        const nextNote = lines[i + 1] && lines[i + 1].startsWith('-') ? lines[i + 1] : '';
        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'formula',
          title: line.includes(':') ? line.split(':')[0].replace(/^[*-]\s*/, '').trim() : 'Cấu Trúc Ngữ Pháp',
          content: line.includes(':') ? line.split(':')[1].trim() : line,
          data: {
            pattern: line.includes(':') ? line.split(':')[1].trim() : line,
            note: nextNote ? nextNote.replace(/^[-*]\s*/, '') : 'Chú ý cách chia thì và hòa hợp chủ vị.',
          },
          order: blockOrder++,
        });
        continue;
      }

      // Pitfall / Common Mistake detection
      if (
        lowerLine.includes('lỗi sai') ||
        lowerLine.includes('bẫy') ||
        lowerLine.startsWith('sai:') ||
        lowerLine.startsWith('wrong:')
      ) {
        let wrongText = line.replace(/^(sai:|wrong:)\s*/i, '');
        let correctText = '';
        let explainText = '';

        if (lines[i + 1] && lines[i + 1].toLowerCase().match(/^(đúng:|correct:)/)) {
          correctText = lines[i + 1].replace(/^(đúng:|correct:)\s*/i, '');
          i++;
        }
        if (lines[i + 1] && lines[i + 1].toLowerCase().match(/^(giải thích:|explanation:)/)) {
          explainText = lines[i + 1].replace(/^(giải thích:|explanation:)\s*/i, '');
          i++;
        }

        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'pitfall',
          title: 'Bẫy Lỗi Sai Cần Tránh',
          data: {
            wrong: wrongText || 'Ví dụ câu chia sai ngữ pháp',
            correct: correctText || 'Câu sửa đúng chuẩn',
            explanation: explainText || 'Lưu ý không chia động từ sai nguyên tắc.',
          },
          order: blockOrder++,
        });
        continue;
      }

      // Callout / Note / Tip detection
      if (
        lowerLine.startsWith('lưu ý:') ||
        lowerLine.startsWith('chú ý:') ||
        lowerLine.startsWith('note:') ||
        lowerLine.startsWith('tip:') ||
        lowerLine.startsWith('ghi nhớ:')
      ) {
        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'callout',
          title: line.split(':')[0].trim(),
          content: line.split(':')[1]?.trim() || line,
          data: {
            calloutVariant: lowerLine.includes('chú ý') || lowerLine.includes('lưu ý') ? 'warning' : 'tip',
          },
          order: blockOrder++,
        });
        continue;
      }

      // Table detection (Markdown table: | col 1 | col 2 |)
      if (line.includes('|') && line.startsWith('|') && line.endsWith('|')) {
        const headers = line.split('|').filter((c) => c.trim().length > 0).map((c) => c.trim());
        const rows: string[][] = [];

        // Check if next line is divider |---|---|
        if (lines[i + 1] && lines[i + 1].includes('---')) {
          i++; // Skip divider
          while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].startsWith('|')) {
            i++;
            const rowCols = lines[i].split('|').filter((c) => c.trim().length > 0).map((c) => c.trim());
            if (rowCols.length > 0) rows.push(rowCols);
          }
        }

        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'table',
          title: 'Bảng So Sánh & Tổng Hợp',
          data: {
            tableHeaders: headers,
            tableRows: rows,
          },
          order: blockOrder++,
        });
        continue;
      }

      // Normal paragraph
      if (line.length > 15) {
        if (!description) description = line;
        theoryBlocks.push({
          id: `tb-ai-${Date.now()}-${blockOrder}`,
          type: 'paragraph',
          content: line,
          order: blockOrder++,
        });
      }
    }

    // =========================================================================
    // SECTION 2: EXAMPLES PARSING (BILINGUAL PAIRS)
    // =========================================================================
    else if (currentSection === 'examples') {
      // Pattern: EN: ... / VI: ...
      if (lowerLine.startsWith('en:') || lowerLine.startsWith('ví dụ:')) {
        const enText = line.replace(/^(en:|ví dụ:)\s*/i, '').trim();
        let viText = '';
        if (lines[i + 1] && lines[i + 1].toLowerCase().startsWith('vi:')) {
          viText = lines[i + 1].replace(/^vi:\s*/i, '').trim();
          i++;
        }
        examples.push({
          id: `ex-ai-${Date.now()}-${examples.length + 1}`,
          en: enText,
          vi: viText || 'Nghĩa tiếng Việt tương ứng',
          context: 'Ví dụ minh họa ngữ pháp trong ngữ cảnh',
          breakdown: { subject: '', verb: '', objectAndOthers: '' },
        });
        continue;
      }

      // Pattern: English sentence (Vietnamese translation)
      const parenMatch = line.match(/^[-*•]?\s*([A-Za-z0-9\s,.'"!?-]+)\s*[(（]([^)）]+)[)）]/);
      if (parenMatch) {
        examples.push({
          id: `ex-ai-${Date.now()}-${examples.length + 1}`,
          en: parenMatch[1].trim(),
          vi: parenMatch[2].trim(),
          context: 'Ví dụ minh họa ngữ cảnh thực tế',
          breakdown: { subject: '', verb: '', objectAndOthers: '' },
        });
        continue;
      }

      // Pattern: English line followed by Vietnamese line
      if (line.match(/^[A-Z][a-zA-Z0-9\s,.'"!?-]{10,}\.$/)) {
        const enLine = line.replace(/^[-*•]\s*/, '').trim();
        let viLine = '';
        if (lines[i + 1] && lines[i + 1].match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i)) {
          viLine = lines[i + 1].replace(/^[-*•]\s*/, '').trim();
          i++;
        }
        if (viLine) {
          examples.push({
            id: `ex-ai-${Date.now()}-${examples.length + 1}`,
            en: enLine,
            vi: viLine,
            context: 'Ví dụ minh họa câu chuẩn',
            breakdown: { subject: '', verb: '', objectAndOthers: '' },
          });
          continue;
        }
      }
    }

    // =========================================================================
    // SECTION 3: EXERCISES / QUESTIONS PARSING
    // =========================================================================
    else if (currentSection === 'exercises') {
      // Question prompt: Câu 1: / Q1: / 1. ...
      const qMatch = line.match(/^(?:Câu\s*\d+|Q\d+|\d+)[.:]\s*(.+)/i);
      if (qMatch) {
        if (activeQuestion && activeQuestion.options.length >= 2) {
          rawQuestions.push({
            ...activeQuestion,
            topicId,
            difficulty: 'medium',
            cefr: targetCefr,
            usageTags: ['lesson_exercise', 'topic_exam'],
          });
        }
        activeQuestion = {
          prompt: qMatch[1].trim(),
          options: [],
          correctAnswer: 0,
          explanation: '',
        };
        continue;
      }

      // Option line: A. ... or [A] ...
      const optMatch = line.match(/^([A-D])[.:)]\s*(.+)/i);
      if (optMatch && activeQuestion) {
        activeQuestion.options.push(optMatch[2].trim());
        continue;
      }

      // Answer line: Đáp án: A / Key: B / Answer: C
      const ansMatch = line.match(/^(?:đáp án|key|answer|chọn)[.:]\s*([A-D])/i);
      if (ansMatch && activeQuestion) {
        const letter = ansMatch[1].toUpperCase();
        const letterIndex = letter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        activeQuestion.correctAnswer = letterIndex >= 0 && letterIndex < 4 ? letterIndex : 0;
        continue;
      }

      // Explanation line: Giải thích: ... / Explanation: ...
      const expMatch = line.match(/^(?:giải thích|explanation|lý do)[.:]\s*(.+)/i);
      if (expMatch && activeQuestion) {
        activeQuestion.explanation = expMatch[1].trim();
        continue;
      }
    }
  }

  // Push last pending question if exists
  if (activeQuestion && activeQuestion.options.length >= 2) {
    rawQuestions.push({
      ...activeQuestion,
      topicId,
      difficulty: 'medium',
      cefr: targetCefr,
      usageTags: ['lesson_exercise', 'topic_exam'],
    });
  }

  // Deduplication check on all parsed questions against the existing Question Bank
  const finalQuestions: BankQuestion[] = rawQuestions.map((q, idx) => {
    const hash = computeNormalizedHash(q.prompt);
    const existing = findDuplicateInBank(q.prompt);
    if (existing) {
      duplicateCount++;
      return existing;
    }
    return {
      ...q,
      id: `qb-import-${Date.now()}-${idx + 1}`,
      normalizedHash: hash,
      createdAt: new Date().toISOString(),
    };
  });

  // Default fallback if no theory blocks detected
  if (theoryBlocks.length === 0) {
    theoryBlocks.push({
      id: `tb-fallback-1`,
      type: 'paragraph',
      content: nonBlankLines.slice(0, 3).join('\n') || 'Tài liệu lý thuyết ngữ pháp được import thành công.',
      order: 1,
    });
  }

  // CRITICAL RULE:
  // "Không tạo Exam ở bước import. Sau khi import thành công: ✓ Lý thuyết ✓ Ví dụ ✓ Bài tập ○ Thi Online chưa tạo"
  const examSettings: ExamSettings = {
    status: 'NOT_CREATED',
    durationMinutes: 10,
    passScore: 1,
    totalQuestions: 0,
    questionIds: [],
  };

  return {
    lessonTitle: lessonTitle || 'Bài Học Ngữ Pháp',
    lessonSubtitle: lessonSubtitle || 'Lý thuyết, ví dụ & bài tập tương tác',
    description: description || 'Tài liệu chi tiết được AI tự động phân tích và cấu trúc.',
    cefr: targetCefr,
    estimatedTime,
    theoryBlocks,
    examples,
    questions: finalQuestions,
    duplicateCount,
    examSettings,
    rawStats: {
      totalBlocks: theoryBlocks.length,
      totalExamples: examples.length,
      totalQuestions: finalQuestions.length,
    },
  };
}
