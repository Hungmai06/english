'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Award,
  BookOpen,
  HelpCircle,
  Flame,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BarChart2,
  Target,
  FileText,
} from 'lucide-react';
import {
  TOP_LEARNED_WORDS,
  TOP_GRAMMAR_LESSONS,
  TOP_QUESTION_TYPES,
  HARDEST_QUESTIONS,
  TopLearnedWord,
  TopGrammarLessonStat,
} from '@/lib/data/analyticsData';
import { AdminUserItem } from '@/lib/adminStorage';
import { CoinIcon } from '@/components/CoinIcon';
import { speakText } from '@/lib/tts';

interface TopRankingsSectionProps {
  usersList: AdminUserItem[];
  onNavigateTab: (tab: 'vocab' | 'users' | 'lessons') => void;
}

export function TopRankingsSection({ usersList, onNavigateTab }: TopRankingsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'words' | 'students' | 'lessons' | 'questions'>('words');

  // Sort users by totalXP (Coins) descending to get top learners
  const topUsers = [...usersList]
    .sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0))
    .slice(0, 5);

  const maxLessonCompletions = Math.max(...TOP_GRAMMAR_LESSONS.map((l) => l.completionsCount));
  const maxWordViews = Math.max(...TOP_LEARNED_WORDS.map((w) => w.viewsCount));

  return (
    <div className="space-y-6">
      {/* Header with Navigation Pills */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Bảng Thống Kê Các Số Lượng Lớn Nhất (Top Rankings)</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Khám phá từ vựng được tra cứu nhiều nhất, học viên tích lũy xu dẫn đầu và các bài học phổ biến nhất
            </p>
          </div>

          {/* Subtabs selector */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab('words')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'words'
                  ? 'bg-white text-[#FF5C28] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Top Từ Vựng</span>
            </button>

            <button
              onClick={() => setActiveSubTab('students')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'students'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top Học Viên</span>
            </button>

            <button
              onClick={() => setActiveSubTab('lessons')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'lessons'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Top Bài Học</span>
            </button>

            <button
              onClick={() => setActiveSubTab('questions')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'questions'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Dạng Câu Hỏi</span>
            </button>
          </div>
        </div>

        {/* -------------------------------------------------------------
            SUB-TAB 1: TOP TỪ VỰNG ĐƯỢC HỌC NHIỀU NHẤT
        ------------------------------------------------------------- */}
        {activeSubTab === 'words' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-bold">Từ Vựng & Độ Khó</span>
              <span className="font-bold">Số Lượt Học & Tỷ Lệ Ghi Nhớ</span>
            </div>

            <div className="space-y-3">
              {TOP_LEARNED_WORDS.map((item, index) => {
                const ratio = Math.round((item.viewsCount / maxWordViews) * 100);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-100/90 hover:border-orange-200 hover:bg-orange-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5 ${
                          index === 0
                            ? 'bg-amber-400 text-slate-900 shadow-xs'
                            : index === 1
                            ? 'bg-slate-300 text-slate-800'
                            : index === 2
                            ? 'bg-amber-700/30 text-amber-900'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        #{index + 1}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-slate-900 tracking-tight">
                            {item.lemma}
                          </span>
                          <button
                            onClick={() => speakText(item.lemma)}
                            className="p-1 rounded-md text-slate-400 hover:text-[#FF5C28] hover:bg-orange-100/50 transition-colors"
                            title="Phát âm từ"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs text-slate-400 font-mono">{item.ipa}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
                            {item.level}
                          </span>
                          <span className="text-[10px] text-slate-400 italic">({item.pos})</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{item.definition}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-[240px] flex-shrink-0">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-800">
                            {item.viewsCount.toLocaleString()} lượt tra cứu
                          </span>
                          <span className="font-bold text-emerald-600">
                            {item.masteryRate}% nhớ
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#FF5C28] transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right text-[11px] text-slate-400 whitespace-nowrap hidden sm:block">
                        <div>{item.practicedCount.toLocaleString()} lượt giải</div>
                        <div>{item.savedCount} lưu sổ từ</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('vocab')}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1.5"
              >
                <span>Xem toàn bộ từ vựng trong kho</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            SUB-TAB 2: TOP HỌC VIÊN TÍCH CỰC & XU DẪN ĐẦU (LEADERBOARD)
        ------------------------------------------------------------- */}
        {activeSubTab === 'students' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-bold">Học Viên & Cấp Độ</span>
              <span className="font-bold">Streak & Tổng Xu (XP)</span>
            </div>

            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="p-4 rounded-xl bg-slate-50/80 border border-slate-100/90 hover:border-emerald-200 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                          : index === 1
                          ? 'bg-slate-300 text-slate-800'
                          : index === 2
                          ? 'bg-amber-700/30 text-amber-900'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 truncate">
                          {user.displayName}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            user.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800'
                              : user.role === 'TEACHER'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{user.streakDays} ngày</span>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-600 flex items-center justify-end gap-1">
                        <span>{(user.totalXP || 0).toLocaleString()}</span>
                        <CoinIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cấp {user.level} • {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm khóa'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('users')}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1.5"
              >
                <span>Quản lý danh sách tài khoản học viên</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            SUB-TAB 3: TOP BÀI HỌC NGỮ PHÁP ĐƯỢC HỌC NHIỀU NHẤT
        ------------------------------------------------------------- */}
        {activeSubTab === 'lessons' && (
          <div className="space-y-4 pt-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
              <span className="font-bold">Bài Học & Chủ Đề</span>
              <span className="font-bold">Lượt Hoàn Thành & Tỷ Lệ Điểm</span>
            </div>

            <div className="space-y-3">
              {TOP_GRAMMAR_LESSONS.map((lesson, idx) => {
                const ratio = Math.round((lesson.completionsCount / maxLessonCompletions) * 100);
                return (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-xl bg-slate-50/80 border border-slate-100/90 hover:border-blue-200 hover:bg-blue-50/20 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {lesson.title}
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {lesson.topicTitle} • Chuẩn {lesson.level} • {lesson.estimatedMinutes}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-black text-slate-900">
                          {lesson.completionsCount.toLocaleString()} học viên
                        </div>
                        <span className="text-[11px] text-emerald-600 font-bold">
                          Điểm TB: {lesson.avgScore}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('lessons')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1.5"
              >
                <span>Quản lý kho bài học ngữ pháp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            SUB-TAB 4: DẠNG CÂU HỎI & CÂU HỎI THỬ THÁCH NHẤT
        ------------------------------------------------------------- */}
        {activeSubTab === 'questions' && (
          <div className="space-y-6 pt-2 animate-in fade-in duration-150">
            {/* Top Question Types Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Phân Bố Số Lượng Luyện Tập Theo Dạng Bài
              </h4>
              <div className="space-y-2.5">
                {TOP_QUESTION_TYPES.map((qt) => (
                  <div key={qt.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{qt.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900">
                          {qt.count.toLocaleString()} lượt ({qt.percentage}%)
                        </span>
                        <span className="text-emerald-600 font-bold text-[11px]">
                          Chính xác: {qt.avgAccuracy}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${qt.percentage * 2}%`, backgroundColor: qt.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardest Questions Warning List */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Top Câu Hỏi Có Tỷ Lệ Làm Sai Cao Nhất (Cần Lưu Ý Giảng Dạy)</span>
                </h4>
                <span className="text-[11px] text-slate-400">Dựa trên 4,500+ lượt nộp bài</span>
              </div>

              <div className="space-y-2.5">
                {HARDEST_QUESTIONS.map((hq) => (
                  <div
                    key={hq.id}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 uppercase">
                        {hq.category} • {hq.level}
                      </span>
                      <span className="font-extrabold text-rose-600">
                        {hq.incorrectRate}% học viên chọn sai
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 italic">"{hq.prompt}"</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        Đáp án chuẩn: <b className="text-emerald-700">{hq.correctAnswer}</b>
                      </span>
                      <span>Đã thử sức: {hq.attemptsCount} lần</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigateTab('lessons')}
                className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1.5"
              >
                <span>Xem bài học & bài tập chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
