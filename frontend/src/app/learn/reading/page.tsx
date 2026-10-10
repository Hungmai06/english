'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  Volume2,
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Eye,
  Highlighter,
  RotateCcw,
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Card } from '@/design-system/components/Card';
import { Badge } from '@/design-system/components/Badge';
import { Button } from '@/design-system/components/Button';
import { speakText } from '@/lib/tts';
import { addXP } from '@/lib/storage';

interface VocabHighlight {
  word: string;
  ipa: string;
  type: string;
  vi: string;
  definition: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  levelName: string;
  wordCount: number;
  readTimeMin: number;
  topic: string;
  paragraphs: string[];
  vocabulary: VocabHighlight[];
  questions: {
    id: string;
    prompt: string;
    options: { id: string; text: string }[];
    correct: string;
    explanation: string;
    evidenceLine: string;
  }[];
}

const READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'remote-work-evolution',
    title: 'The Evolution of Modern Remote Work Culture',
    level: 'B2',
    levelName: 'Upper-Intermediate',
    wordCount: 280,
    readTimeMin: 2,
    topic: 'Workplace & Technology',
    paragraphs: [
      'In recent years, the concept of the traditional workplace has undergone a profound transformation. What once seemed like a temporary adaptation during global disruptions has now solidified into a permanent shift. Across diverse industries, organizations have recognized that productivity is not inextricably tied to physical presence in a conventional cubicle.',
      'Proponents of asynchronous collaboration argue that remote arrangements afford workers unprecedented flexibility and autonomy. Employees can structure their working hours around personal peak productivity periods, resulting in reduced commuting stress and a superior work-life balance. Furthermore, corporations are able to tap into a borderless talent reservoir without being constrained by geographic boundaries.',
      'Nevertheless, this transition is not devoid of substantial hurdles. Extended isolation can erode camaraderie and dilute corporate culture. Moreover, asynchronous communication requires stringent self-discipline, clear documentation standards, and proactive digital etiquette to mitigate misunderstandings and emotional burnout.'
    ],
    vocabulary: [
      { word: 'profound', ipa: '/prəˈfaʊnd/', type: 'adj', vi: 'sâu sắc, toàn diện', definition: 'Very great, intense, or far-reaching.' },
      { word: 'inextricably', ipa: '/ˌɪn.ɪkˈstrɪk.ə.bli/', type: 'adv', vi: 'gắn bó chặt chẽ, không thể tách rời', definition: 'In a way that is impossible to separate.' },
      { word: 'asynchronous', ipa: '/eɪˈsɪŋ.krə.nəs/', type: 'adj', vi: 'bất đồng bộ (không cùng thời gian)', definition: 'Not happening or done at the same time or speed.' },
      { word: 'camaraderie', ipa: '/ˌkæm.əˈrɑː.dɚ.i/', type: 'noun', vi: 'tình đồng đội, sự gắn kết', definition: 'Mutual trust and friendship among people who spend time together.' },
      { word: 'mitigate', ipa: '/ˈmɪt.ɪ.ɡeɪt/', type: 'verb', vi: 'giảm nhẹ, xoa dịu', definition: 'Make something bad less severe, serious, or painful.' }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'According to paragraph 1, what has happened to remote work in recent years?',
        options: [
          { id: 'a', text: 'It has been completely abandoned by most traditional companies.' },
          { id: 'b', text: 'It transitioned from a temporary measure into a lasting organizational model.' },
          { id: 'c', text: 'It led to a catastrophic decline in global workforce productivity.' },
          { id: 'd', text: 'It became legally mandatory in all major technology industries.' }
        ],
        correct: 'b',
        explanation: 'Paragraph 1 notes that what once seemed like a temporary adaptation has now solidified into a permanent shift.',
        evidenceLine: 'Paragraph 1: "...solidified into a permanent shift."'
      },
      {
        id: 'q2',
        prompt: 'Which benefit of remote arrangements is explicitly mentioned in paragraph 2?',
        options: [
          { id: 'a', text: 'Free equipment supplied by multinational corporations' },
          { id: 'b', text: 'Access to a global pool of talent without geographical limitations' },
          { id: 'c', text: 'Exemption from state and federal income taxes' },
          { id: 'd', text: 'Shorter work weeks consisting of only four days' }
        ],
        correct: 'b',
        explanation: 'Paragraph 2 states that corporations can "tap into a borderless talent reservoir without being constrained by geographic boundaries."',
        evidenceLine: 'Paragraph 2: "...tap into a borderless talent reservoir..."'
      },
      {
        id: 'q3',
        prompt: 'What potential drawback of remote work is highlighted in paragraph 3?',
        options: [
          { id: 'a', text: 'Lack of reliable broadband internet across urban regions' },
          { id: 'b', text: 'Excessive face-to-face meetings scheduled by management' },
          { id: 'c', text: 'Potential isolation eroding camaraderie and risking burnout' },
          { id: 'd', text: 'Inability to save personal funds while working at home' }
        ],
        correct: 'c',
        explanation: 'Paragraph 3 warns that "extended isolation can erode camaraderie and dilute corporate culture" and mentions emotional burnout.',
        evidenceLine: 'Paragraph 3: "...erode camaraderie and dilute corporate culture."'
      }
    ]
  },
  {
    id: 'urban-biodiversity',
    title: 'Green Roofs and Urban Biodiversity in Megacities',
    level: 'B1',
    levelName: 'Intermediate',
    wordCount: 220,
    readTimeMin: 2,
    topic: 'Environment & Urbanism',
    paragraphs: [
      'As modern cities expand at an unprecedented rate, concrete structures and asphalt roads gradually replace natural meadows and forests. This phenomenon creates "urban heat islands," where ambient temperatures inside metropolitan areas can be several degrees warmer than neighboring rural landscapes.',
      'To counteract this ecological imbalance, urban planners are increasingly adopting vegetative roofs, commonly known as green roofs. These rooftop gardens are blanketed with hardy vegetation, moss, and drought-resistant succulents. Not only do they naturally insulate buildings, cutting air-conditioning costs by up to twenty percent, but they also absorb excess stormwater runoff.',
      'Crucially, green roofs create vital stepping-stone sanctuaries for native pollinators, including honeybees, butterflies, and migratory birds navigating dense concrete skylines.'
    ],
    vocabulary: [
      { word: 'phenomenon', ipa: '/fəˈnɑː.mə.nɑːn/', type: 'noun', vi: 'hiện tượng', definition: 'A fact or situation that is observed to exist or happen.' },
      { word: 'counteract', ipa: '/ˌkaʊn.tɚˈækt/', type: 'verb', vi: 'chống lại, làm giảm tác động', definition: 'Act against something in order to reduce its force or neutralize it.' },
      { word: 'insulate', ipa: '/ˈɪn.sə.leɪt/', type: 'verb', vi: 'cách nhiệt, bảo ôn', definition: 'Protect something with a material that prevents heat from escaping or entering.' },
      { word: 'sanctuaries', ipa: '/ˈsæŋk.tʃu.er.iz/', type: 'noun', vi: 'khu bảo tồn, nơi trú ẩn an toàn', definition: 'Places of refuge, safety, or protection for wildlife.' }
    ],
    questions: [
      {
        id: 'q1',
        prompt: 'What primarily causes urban heat islands according to paragraph 1?',
        options: [
          { id: 'a', text: 'The migration of wild animals into major downtown parks' },
          { id: 'b', text: 'Replacement of natural landscapes with concrete and asphalt' },
          { id: 'c', text: 'Extensive use of solar panels on residential houses' },
          { id: 'd', text: 'Abundant rainfall in suburban agricultural valleys' }
        ],
        correct: 'b',
        explanation: 'Paragraph 1 explains that concrete structures and asphalt replace natural meadows, causing urban heat islands.',
        evidenceLine: 'Paragraph 1: "...concrete structures and asphalt roads gradually replace..."'
      },
      {
        id: 'q2',
        prompt: 'How do green roofs help building owners save energy?',
        options: [
          { id: 'a', text: 'By generating geothermal electricity from rooftop soil' },
          { id: 'b', text: 'By insulating buildings to reduce air-conditioning expenses' },
          { id: 'c', text: 'By providing fresh drinking water directly to tenants' },
          { id: 'd', text: 'By deflecting sunlight into surrounding street lamps' }
        ],
        correct: 'b',
        explanation: 'The passage mentions they "naturally insulate buildings, cutting air-conditioning costs by up to twenty percent."',
        evidenceLine: 'Paragraph 2: "...cutting air-conditioning costs by up to twenty percent..."'
      }
    ]
  }
];

export default function ReadingComprehensionPage() {
  const [selectedPassageId, setSelectedPassageId] = useState(READING_PASSAGES[0].id);
  const [selectedWord, setSelectedWord] = useState<VocabHighlight | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isReadingTimerActive, setIsReadingTimerActive] = useState(true);

  const passage = READING_PASSAGES.find((p) => p.id === selectedPassageId) || READING_PASSAGES[0];

  useEffect(() => {
    let timer: any;
    if (isReadingTimerActive && !showResults) {
      timer = setInterval(() => setReadingSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isReadingTimerActive, showResults]);

  const handleSelectPassage = (id: string) => {
    setSelectedPassageId(id);
    setSelectedWord(null);
    setUserAnswers({});
    setShowResults(false);
    setReadingSeconds(0);
    setIsReadingTimerActive(true);
  };

  const handleOptionSelect = (qId: string, optId: string) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optId }));
  };

  const handleCheckAnswers = () => {
    setShowResults(true);
    setIsReadingTimerActive(false);

    let correctCount = 0;
    passage.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) correctCount++;
    });

    if (correctCount > 0) {
      addXP(correctCount * 15);
    }
  };

  const wpm = readingSeconds > 0 ? Math.round((passage.wordCount / readingSeconds) * 60) : 0;
  const correctCount = passage.questions.filter((q) => userAnswers[q.id] === q.correct).length;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8 pb-20">
      <Container size="lg" className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Quay lại Khóa học</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge tone="purple">Đọc hiểu Chuyên sâu</Badge>
            <Badge tone="orange">{passage.level} · {passage.levelName}</Badge>
          </div>
        </div>

        {/* Header & Passage Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kỹ Năng Đọc Hiểu (Reading Comprehension)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Nhấp vào các từ in đậm có gạch chân để tra cứu phiên âm IPA và nghĩa tiếng Việt ngay trong ngữ cảnh.
            </p>
          </div>

          {/* Passage Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {READING_PASSAGES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPassage(p.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedPassageId === p.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p.title.split(' ')[0]} {p.title.split(' ')[1]} ({p.level})
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout: Left Article, Right Questions & Vocabulary Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Passage Text Area */}
          <div className="lg:col-span-7 space-y-6">
            <Card tone="white" className="p-6 sm:p-8 border-slate-200 shadow-subtle space-y-6">
              {/* Passage Meta Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>{passage.wordCount} từ</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF5C28]" />
                    <span>~{passage.readTimeMin} phút</span>
                  </span>
                  <span>•</span>
                  <span className="text-purple-700 font-bold">{passage.topic}</span>
                </div>

                {/* Read aloud & Speed metric */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speakText(passage.paragraphs.join(' '))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors"
                    title="Nghe đọc toàn bài"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe audio</span>
                  </button>

                  <div className="px-2.5 py-1 rounded-xl bg-slate-50 text-slate-600 text-xs font-mono border border-slate-200">
                    ⏱ {readingSeconds}s {wpm > 0 && `(${wpm} WPM)`}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {passage.title}
              </h2>

              {/* Paragraphs with interactive vocabulary highlights */}
              <div className="space-y-4 text-slate-800 leading-relaxed text-sm sm:text-base font-normal">
                {passage.paragraphs.map((p, pIdx) => {
                  let renderedText: React.ReactNode = p;
                  // highlight registered vocabulary words
                  passage.vocabulary.forEach((v) => {
                    const regex = new RegExp(`\\b(${v.word})\\b`, 'gi');
                    if (typeof renderedText === 'string' && regex.test(renderedText)) {
                      const parts = renderedText.split(regex);
                      renderedText = parts.map((part, i) => {
                        if (part.toLowerCase() === v.word.toLowerCase()) {
                          const isSelected = selectedWord?.word.toLowerCase() === v.word.toLowerCase();
                          return (
                            <button
                              key={i}
                              onClick={() => setSelectedWord(v)}
                              className={`font-semibold px-1 rounded transition-colors text-purple-700 underline decoration-purple-400 decoration-2 underline-offset-2 ${
                                isSelected ? 'bg-purple-200 text-purple-900' : 'hover:bg-purple-100'
                              }`}
                            >
                              {part}
                            </button>
                          );
                        }
                        return part;
                      });
                    }
                  });

                  return (
                    <p key={pIdx} className="text-justify indent-4">
                      {renderedText}
                    </p>
                  );
                })}
              </div>

              {/* Vocabulary Quick Inspector if clicked */}
              {selectedWord && (
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-purple-950">{selectedWord.word}</span>
                      <span className="text-xs font-mono text-purple-700">{selectedWord.ipa}</span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">
                        {selectedWord.type}
                      </span>
                    </div>
                    <button
                      onClick={() => speakText(selectedWord.word)}
                      className="p-1.5 rounded-lg bg-white text-purple-700 hover:bg-purple-100 shadow-xs"
                      title="Phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-bold text-purple-900">
                    Nghĩa tiếng Việt: <span className="font-normal text-purple-800">{selectedWord.vi}</span>
                  </p>
                  <p className="text-xs text-purple-700 italic">
                    Definition: {selectedWord.definition}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Comprehension Questions */}
          <div className="lg:col-span-5 space-y-6">
            <Card tone="white" className="p-6 border-slate-200 shadow-subtle space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Câu hỏi Đọc hiểu ({passage.questions.length})</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {Object.keys(userAnswers).length}/{passage.questions.length} đã chọn
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {passage.questions.map((q, idx) => {
                  const selectedOpt = userAnswers[q.id];
                  const isChecked = showResults;
                  const isCorrect = selectedOpt === q.correct;

                  return (
                    <div key={q.id} className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {q.prompt}
                        </p>
                      </div>

                      {/* Options */}
                      <div className="space-y-2 pl-7">
                        {q.options.map((opt) => {
                          const isOptionSelected = selectedOpt === opt.id;
                          let optionStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700';

                          if (isChecked) {
                            if (opt.id === q.correct) {
                              optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isOptionSelected && !isCorrect) {
                              optionStyle = 'bg-red-50 border-red-300 text-red-800 line-through';
                            }
                          } else if (isOptionSelected) {
                            optionStyle = 'bg-purple-50 border-purple-500 text-purple-900 font-semibold';
                          }

                          return (
                            <button
                              key={opt.id}
                              onClick={() => handleOptionSelect(q.id, opt.id)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 ${optionStyle}`}
                            >
                              <span className="w-4 h-4 rounded-full font-bold uppercase text-[10px] flex items-center justify-center bg-white border border-slate-300 flex-shrink-0 mt-0.5">
                                {opt.id}
                              </span>
                              <span className="leading-relaxed">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box after check */}
                      {showResults && (
                        <div className="ml-7 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center gap-1 font-bold text-slate-900">
                            {isCorrect ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                            )}
                            <span className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                              {isCorrect ? 'Chính xác (+15 Xu)' : 'Chưa chính xác'}
                            </span>
                          </div>
                          <p className="text-slate-600">{q.explanation}</p>
                          <p className="text-[11px] text-purple-700 font-medium italic">
                            Dẫn chứng: {q.evidenceLine}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit & Reset actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {!showResults ? (
                  <Button
                    onClick={handleCheckAnswers}
                    disabled={Object.keys(userAnswers).length === 0}
                    tone="orange"
                    size="md"
                    className="w-full font-bold shadow-md shadow-[#FF5C28]/20"
                  >
                    Kiểm Tra Kết Quả ({Object.keys(userAnswers).length}/{passage.questions.length})
                  </Button>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="p-3 rounded-xl bg-purple-50 text-center text-xs font-bold text-purple-900">
                      Kết quả: {correctCount}/{passage.questions.length} câu đúng ({Math.round((correctCount / passage.questions.length) * 100)}%)
                    </div>
                    <Button
                      onClick={() => {
                        setShowResults(false);
                        setUserAnswers({});
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>Làm lại bài này</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
