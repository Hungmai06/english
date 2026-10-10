'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Zap,
  Sparkles,
  Clock,
  Award,
  ChevronUp,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  Users,
  Calendar,
  MessageSquare,
  Send,
  RefreshCw,
  Heart,
  Share2,
  Link2,
  Check,
  ArrowRight,
  TrendingUp,
  Filter,
} from 'lucide-react';
import { Container } from '@/design-system/components/Section';
import { Button } from '@/design-system/components/Button';
import { getUserStats, updateUserStats, addXP } from '@/lib/storage';
import { UserProgressStats } from '@/types';
import { CoinIcon } from '@/components/CoinIcon';

interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatarText: string;
  avatarBg: string;
  avatarImg?: string;
  level: number;
  xp: number;
  streak: number;
  lessonsDone: number;
  badgeTitle: string;
  trend: 'up' | 'down' | 'same';
  trendCount?: number;
  isCurrentUser?: boolean;
}

interface ChatMessage {
  id: string;
  userName: string;
  avatarText: string;
  avatarBg: string;
  timeAgo: string;
  message: string;
  streakCount: number;
  likes: number;
  isLiked?: boolean;
}

const CHECKIN_STORAGE_KEY = 'elp_checkin_history';

// Helper to format date YYYY-MM-DD
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function LeaderboardPage() {
  const [stats, setStats] = useState<UserProgressStats | null>(null);
  const [activeTab, setActiveTab] = useState<'streak' | 'xp'>('streak');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');
  const [checkinDates, setCheckinDates] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sideTab, setSideTab] = useState<'streak_duo' | 'invites' | 'sent' | 'ranks'>('streak_duo');

  // Community Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      userName: 'Hồng Ngân',
      avatarText: 'HN',
      avatarBg: 'bg-amber-500 text-white',
      timeAgo: '2 phút trước',
      message: 'Mục tiêu tuần này là cán mốc streak 300 ngày! Mọi người cùng cố gắng nhé 🔥',
      streakCount: 284,
      likes: 12,
    },
    {
      id: 'msg-2',
      userName: 'Nguyễn Huy Hoàng',
      avatarText: 'HH',
      avatarBg: 'bg-indigo-500 text-white',
      timeAgo: '15 phút trước',
      message: 'Quan trọng là duy trì học đều đặn mỗi ngày 15 phút, không bỏ bữa nào là lên trình ngay.',
      streakCount: 280,
      likes: 8,
    },
    {
      id: 'msg-3',
      userName: 'Ánh Ánh',
      avatarText: 'AA',
      avatarBg: 'bg-rose-500 text-white',
      timeAgo: '42 phút trước',
      message: 'Vừa học xong bài thì Hiện tại hoàn thành, được cộng thêm 50 xu thưởng!',
      streakCount: 272,
      likes: 5,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Initial load
  useEffect(() => {
    const loadedStats = getUserStats();
    setStats(loadedStats);

    // Load check-in history from localStorage with realistic fallback
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(CHECKIN_STORAGE_KEY);
        if (raw) {
          setCheckinDates(JSON.parse(raw));
        } else {
          // Initialize mock check-in days for the past 2 weeks
          const initDates: string[] = [];
          const today = new Date();
          for (let i = 0; i < 14; i++) {
            if (i !== 3 && i !== 8) {
              const d = new Date(today);
              d.setDate(d.getDate() - i);
              initDates.push(toDateKey(d));
            }
          }
          localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(initDates));
          setCheckinDates(initDates);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const isCheckedInToday = checkinDates.includes(todayKey);

  const userStreak = stats?.streakDays || 5;
  const userCoins = stats?.xp || 1420;
  const totalWords = 120;
  const masteredWords = 85;
  const progressPercent = Math.round((masteredWords / totalWords) * 100);

  // Check-in action
  const handleCheckin = () => {
    if (isCheckedInToday) return;

    const nextDates = [...checkinDates, todayKey];
    setCheckinDates(nextDates);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(nextDates));
    }

    // Add +20 Coins and increment streak
    const nextStreak = userStreak + 1;
    const nextXP = userCoins + 20;
    const updated = updateUserStats({ streakDays: nextStreak, xp: nextXP });
    setStats(updated);

    setToastMessage('🎉 Điểm danh thành công! Bạn nhận được +20 Xu thưởng.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Mock Leaderboard Users matching Screenshot 2
  const leaderboardUsers: LeaderboardUser[] = useMemo(() => {
    return [
      {
        id: 'u-1',
        rank: 1,
        name: 'Hồng Ngân',
        avatarText: 'HN',
        avatarBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-900',
        level: 9,
        xp: 3420,
        streak: 284,
        lessonsDone: 68,
        badgeTitle: 'Huyền Thoại Bền Bỉ',
        trend: 'same',
      },
      {
        id: 'u-2',
        rank: 2,
        name: '15. Nguyễn Huy Hoàng',
        avatarText: 'HH',
        avatarBg: 'bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-900',
        level: 8,
        xp: 3210,
        streak: 280,
        lessonsDone: 62,
        badgeTitle: 'Bậc Thầy Ngữ Pháp',
        trend: 'up',
        trendCount: 1,
      },
      {
        id: 'u-3',
        rank: 3,
        name: 'Minh Đức Nguyễn',
        avatarText: 'MĐ',
        avatarBg: 'bg-gradient-to-tr from-amber-700 to-amber-500 text-white',
        level: 8,
        xp: 3180,
        streak: 280,
        lessonsDone: 59,
        badgeTitle: 'Chiến Binh Kiên Trì',
        trend: 'same',
      },
      {
        id: 'u-4',
        rank: 4,
        name: 'Ánh Ánh',
        avatarText: 'AA',
        avatarBg: 'bg-purple-100 text-purple-700',
        level: 7,
        xp: 2980,
        streak: 272,
        lessonsDone: 54,
        badgeTitle: 'Chuyên Cần Cao Cấp',
        trend: 'down',
        trendCount: 1,
      },
      {
        id: 'u-5',
        rank: 5,
        name: 'Lê Hiếu',
        avatarText: 'LH',
        avatarBg: 'bg-blue-600 text-white',
        level: 7,
        xp: 2850,
        streak: 269,
        lessonsDone: 51,
        badgeTitle: 'Cao Thủ Từ Vựng',
        trend: 'up',
        trendCount: 2,
      },
      {
        id: 'u-6',
        rank: 6,
        name: 'Chi Phương',
        avatarText: 'CP',
        avatarBg: 'bg-pink-100 text-pink-700',
        level: 6,
        xp: 2720,
        streak: 257,
        lessonsDone: 47,
        badgeTitle: 'Tập Trung Cao Độ',
        trend: 'same',
      },
      {
        id: 'u-7',
        rank: 7,
        name: 'Như PTQ',
        avatarText: 'NP',
        avatarBg: 'bg-emerald-100 text-emerald-800',
        level: 6,
        xp: 2640,
        streak: 251,
        lessonsDone: 44,
        badgeTitle: 'Ngôi Sao Triển Vọng',
        trend: 'down',
        trendCount: 1,
      },
      {
        id: 'u-8',
        rank: 8,
        name: 'Little world of Hà',
        avatarText: 'LH',
        avatarBg: 'bg-amber-100 text-amber-800',
        level: 6,
        xp: 2590,
        streak: 250,
        lessonsDone: 42,
        badgeTitle: 'Siêng Năng Vượt Trội',
        trend: 'same',
      },
      {
        id: 'u-9',
        rank: 9,
        name: 'Aclar',
        avatarText: 'AC',
        avatarBg: 'bg-slate-800 text-white',
        level: 5,
        xp: 2480,
        streak: 249,
        lessonsDone: 39,
        badgeTitle: 'Tân Binh Quyết Tâm',
        trend: 'up',
        trendCount: 1,
      },
      {
        id: 'u-10',
        rank: 10,
        name: 'Đặng Tuấn Kiệt',
        avatarText: 'TK',
        avatarBg: 'bg-teal-100 text-teal-800',
        level: 5,
        xp: 2390,
        streak: 242,
        lessonsDone: 38,
        badgeTitle: 'Nỗ Lực Không Ngừng',
        trend: 'down',
        trendCount: 2,
      },
    ];
  }, []);

  // Sorted list based on active tab
  const sortedUsers = useMemo(() => {
    const list = [...leaderboardUsers];
    if (activeTab === 'streak') {
      return list.sort((a, b) => b.streak - a.streak).map((u, i) => ({ ...u, rank: i + 1 }));
    }
    return list.sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
  }, [leaderboardUsers, activeTab]);

  // Last 7 days for the Orange Streak Card (Screenshot 1)
  const last7Days = useMemo(() => {
    const days = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const isToday = i === 0;
      const isChecked = checkinDates.includes(key);
      days.push({
        name: dayNames[d.getDay()],
        key,
        isToday,
        isChecked,
      });
    }
    return days;
  }, [checkinDates]);

  // Activity Heatmap Grid generator (16 weeks x 7 days - Screenshot 2)
  const heatmapData = useMemo(() => {
    const weeks: { weekIdx: number; monthLabel?: string; days: { dateKey: string; count: number; level: number }[] }[] = [];
    const today = new Date();
    const totalDays = 16 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + (7 - today.getDay()));

    let currentWeek: { weekIdx: number; monthLabel?: string; days: { dateKey: string; count: number; level: number }[] } = {
      weekIdx: 0,
      days: [],
    };

    const monthNames = [
      'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
      'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12',
    ];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const key = toDateKey(d);
      const isCheck = checkinDates.includes(key);

      // Random / deterministic count for mock history
      const hash = (d.getFullYear() * 1000 + (d.getMonth() + 1) * 31 + d.getDate()) % 7;
      const count = isCheck ? (hash > 3 ? hash : 3) : (hash === 2 ? 1 : 0);
      const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;

      if (d.getDate() <= 7 && currentWeek.days.length === 0) {
        currentWeek.monthLabel = monthNames[d.getMonth()];
      }

      currentWeek.days.push({ dateKey: key, count, level });

      if (currentWeek.days.length === 7) {
        weeks.push(currentWeek);
        currentWeek = { weekIdx: weeks.length, days: [] };
      }
    }

    if (currentWeek.days.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [checkinDates]);

  // Send a chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userName: 'Bạn',
      avatarText: 'ME',
      avatarBg: 'bg-[#FF5C28] text-white',
      timeAgo: 'Vừa xong',
      message: chatInput.trim(),
      streakCount: userStreak,
      likes: 0,
    };

    setMessages([newMsg, ...messages]);
    setChatInput('');
  };

  const handleToggleLike = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              likes: m.isLiked ? m.likes - 1 : m.likes + 1,
              isLiked: !m.isLiked,
            }
          : m
      )
    );
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-6 sm:py-10 pb-28">
      <Container size="lg" className="space-y-6">

        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-black text-sm shrink-0">
                ✓
              </div>
              <span className="text-sm font-bold">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* TOP SEGMENTED TAB SWITCHER (Ảnh 2: Lượt chơi game vs Streak) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('xp')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-extrabold transition-all ${
                activeTab === 'xp'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Xu Tích Lũy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('streak')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all ${
                activeTab === 'streak'
                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Streak 🔥</span>
            </button>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center justify-end gap-2 text-xs">
            <span className="text-slate-400 font-bold hidden md:inline">Kỳ xếp hạng:</span>
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeframe === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Tuần này
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeframe === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Tháng này
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                  timeframe === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MAIN LAYOUT:
            LEFT: BẢNG XẾP HẠNG THEO STREAK (ẢNH 2)
            RIGHT: GÓC FOR ME (ẢNH 1 & 2)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ========================================================
              LEFT COLUMN (col-span-7 or 8): BẢNG XẾP HẠNG STREAK
              ======================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Table Header */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 grid grid-cols-12 items-center text-[11px] font-black uppercase tracking-wider text-slate-400 select-none">
                <div className="col-span-2 text-center">HẠNG</div>
                <div className="col-span-7">NGƯỜI DÙNG</div>
                <div className="col-span-3 text-right pr-2">
                  {activeTab === 'streak' ? 'STREAK' : 'TỔNG XU'}
                </div>
              </div>

              {/* Table Rows (Top 1, 2, 3 medals, etc.) */}
              <div className="divide-y divide-slate-100">
                {sortedUsers.map((user) => {
                  const isTop1 = user.rank === 1;
                  const isTop2 = user.rank === 2;
                  const isTop3 = user.rank === 3;

                  return (
                    <div
                      key={user.id}
                      className={`px-4 sm:px-5 py-3.5 grid grid-cols-12 items-center transition-colors hover:bg-purple-50/30 ${
                        isTop1 ? 'bg-amber-50/30' : isTop2 ? 'bg-slate-50/40' : isTop3 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Rank Column */}
                      <div className="col-span-2 flex items-center justify-center">
                        {isTop1 ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-sm shadow-md ring-2 ring-amber-200" title="Quán quân">
                            🥇
                          </div>
                        ) : isTop2 ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 flex items-center justify-center font-black text-sm shadow-md ring-2 ring-slate-200" title="Á quân">
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-amber-300" title="Hạng ba">
                            🥉
                          </div>
                        ) : (
                          <span className="font-extrabold text-sm text-slate-600">
                            {user.rank}
                          </span>
                        )}
                      </div>

                      {/* User Info Column */}
                      <div className="col-span-7 flex items-center gap-3 min-w-0 pr-2">
                        <div className={`w-10 h-10 rounded-2xl ${user.avatarBg} flex items-center justify-center font-bold text-xs shadow-2xs shrink-0 ring-1 ring-black/5`}>
                          {user.avatarText}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 truncate">
                              {user.name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block truncate">
                            {user.badgeTitle} • Cấp {user.level}
                          </span>
                        </div>
                      </div>

                      {/* Streak / Metric Column */}
                      <div className="col-span-3 text-right pr-2">
                        {activeTab === 'streak' ? (
                          <span className="inline-flex items-center gap-1 font-black text-sm sm:text-base text-slate-900">
                            <span>{user.streak}</span>
                            <span className="text-orange-500 text-base">🔥</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-black text-sm sm:text-base text-slate-900">
                            <CoinIcon className="w-4 h-4" />
                            <span>{user.xp}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current User Fixed Row Banner (Vị trí của bạn) */}
              <div className="p-4 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-t-2 border-[#FF5C28]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    #4
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-slate-900">Vị trí của bạn</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FF5C28] text-white text-[10px] font-black uppercase">
                        Bạn
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Hạng 4 • Chuỗi {userStreak} ngày liên tục
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Xu của bạn</span>
                    <span className="text-sm font-black text-slate-900 flex items-center justify-end gap-1">
                      <CoinIcon className="w-3.5 h-3.5" />
                      <span>{userCoins}</span>
                    </span>
                  </div>

                  <Link href="/learn/grammar">
                    <button
                      type="button"
                      className="px-3.5 py-1.5 bg-[#FF5C28] hover:bg-[#e04f20] text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap"
                    >
                      Học ngay
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN (col-span-5): GÓC "FOR ME" & CÁ NHÂN & CỘNG ĐỒNG
              ======================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5">
            
            {/* 1. THẺ CHUỖI NGÀY HỌC (ẢNH 1 - CAM RỰC RỠ) */}
            <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white p-5 sm:p-6 shadow-xl shadow-orange-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-2xs">
                    🔥
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-orange-100">
                    CHUỖI NGÀY HỌC
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckin}
                  disabled={isCheckedInToday}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                    isCheckedInToday
                      ? 'bg-white/20 text-white cursor-default'
                      : 'bg-white text-orange-600 hover:bg-orange-50 shadow-md transform hover:scale-105 active:scale-95'
                  }`}
                >
                  {isCheckedInToday ? '✓ Đã điểm danh' : '⚡ Điểm danh (+20 Xu)'}
                </button>
              </div>

              {/* Big Streak Number */}
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {userStreak}
                </span>
                <span className="text-lg sm:text-xl font-bold text-orange-100">
                  ngày
                </span>
              </div>

              {/* 7 Days Row (T6, T7, CN, T2, T3, T4, T5 như ảnh 1) */}
              <div className="grid grid-cols-7 gap-2 text-center pt-1 border-t border-white/20">
                {last7Days.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    {/* Circle */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        d.isChecked
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'bg-orange-400/60 text-white/70'
                      } ${d.isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-orange-500 font-black' : ''}`}
                    >
                      {d.isChecked ? '✓' : ''}
                    </div>
                    {/* Day Label */}
                    <span className="text-[11px] font-bold text-orange-100">
                      {d.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. 4 THẺ THỐNG KÊ MINI (ẢNH 1) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Tổng từ */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                  {totalWords}
                </span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">
                  Tổng từ đã học
                </span>
              </div>

              {/* Đã thuộc */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-500">
                  {masteredWords}
                </span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">
                  Đã thuộc làu
                </span>
              </div>

              {/* Tiến độ */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-cyan-600">
                  {progressPercent}%
                </span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">
                  Tiến độ hoàn thành
                </span>
              </div>

              {/* Số Xu tích lũy */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-purple-600 flex items-center justify-center gap-1">
                  <CoinIcon className="w-5 h-5" />
                  <span>{userCoins}</span>
                </span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">
                  Số Xu tích lũy
                </span>
              </div>
            </div>

            {/* 3. HEATMAP HOẠT ĐỘNG / ĐIỂM DANH (ẢNH 2 - GITHUB/DUOLINGO STYLE) */}
            <div className="rounded-3xl bg-white border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Lịch Hoạt Động & Điểm Danh
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-400">
                  {checkinDates.length} ngày hoạt động
                </span>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto pb-1">
                <div className="inline-block min-w-full">
                  {/* Month Headers */}
                  <div className="flex text-[10px] text-slate-400 font-bold mb-1 pl-6 gap-6">
                    <span>Thg 7</span>
                    <span>Thg 8</span>
                    <span>Thg 9</span>
                    <span>Thg 10</span>
                  </div>

                  <div className="flex gap-1.5 items-center">
                    {/* Day of week labels */}
                    <div className="flex flex-col gap-1 text-[9px] font-bold text-slate-400 pr-1 select-none">
                      <span className="h-3 leading-3">T2</span>
                      <span className="h-3 leading-3">T4</span>
                      <span className="h-3 leading-3">T6</span>
                    </div>

                    {/* Columns of weeks */}
                    <div className="flex gap-1">
                      {heatmapData.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1">
                          {week.days.map((day, dIdx) => {
                            const levelColors = [
                              'bg-slate-100 hover:ring-1 hover:ring-slate-300',
                              'bg-purple-200 hover:ring-1 hover:ring-purple-400',
                              'bg-purple-400 hover:ring-1 hover:ring-purple-500',
                              'bg-purple-600 hover:ring-1 hover:ring-purple-700',
                              'bg-purple-800 hover:ring-1 hover:ring-purple-900',
                            ];
                            return (
                              <div
                                key={dIdx}
                                title={`${day.dateKey}: ${day.count > 0 ? `${day.count} hoạt động học tập` : 'Chưa học'}`}
                                className={`w-3 h-3 rounded-[3px] transition-transform hover:scale-125 cursor-pointer ${
                                  levelColors[day.level]
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400 font-semibold mt-2.5">
                    <span>Ít</span>
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-200" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-400" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-600" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-purple-800" />
                    <span>Nhiều</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CHUỖI CHUNG (STREAK DUO / MỜI BẠN HỌC - ẢNH 2) */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
              {/* Subtabs */}
              <div className="p-1.5 bg-slate-50/80 border-b border-slate-200/80 grid grid-cols-4 gap-1 text-[11px] font-bold text-center">
                <button
                  type="button"
                  onClick={() => setSideTab('streak_duo')}
                  className={`py-1.5 px-1 rounded-xl transition-all ${
                    sideTab === 'streak_duo'
                      ? 'bg-purple-600 text-white shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🔗 Chuỗi chung
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('invites')}
                  className={`py-1.5 px-1 rounded-xl transition-all ${
                    sideTab === 'invites'
                      ? 'bg-purple-600 text-white shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ✉️ Lời mời
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('sent')}
                  className={`py-1.5 px-1 rounded-xl transition-all ${
                    sideTab === 'sent'
                      ? 'bg-purple-600 text-white shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  📤 Đã gửi
                </button>
                <button
                  type="button"
                  onClick={() => setSideTab('ranks')}
                  className={`py-1.5 px-1 rounded-xl transition-all ${
                    sideTab === 'ranks'
                      ? 'bg-purple-600 text-white shadow-2xs font-black'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🏆 Xếp hạng
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Link2 className="w-6 h-6 -rotate-45" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    Chưa có chuỗi chung
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Kết bạn và cùng học mỗi ngày để cùng nhau giữ chuỗi chung không bị đứt đoạn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setToastMessage('📋 Đã sao chép liên kết mời học vào khay nhớ tạm!');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs rounded-xl transition-colors border border-purple-200"
                >
                  + Mời bạn bè cùng học
                </button>
              </div>
            </div>

            {/* 5. TRÒ CHUYỆN CỘNG ĐỒNG (ẢNH 2) */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Trò Chuyện Cộng Đồng
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Đã làm mới tin nhắn mới nhất!');
                    setTimeout(() => setToastMessage(null), 2000);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Làm mới cuộc trò chuyện"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Message List */}
              <div className="p-4 space-y-3.5 max-h-72 overflow-y-auto divide-y divide-slate-100">
                {messages.map((msg) => (
                  <div key={msg.id} className="pt-3 first:pt-0 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${msg.avatarBg} flex items-center justify-center font-bold text-[10px]`}>
                          {msg.avatarText}
                        </div>
                        <span className="font-bold text-slate-900">{msg.userName}</span>
                        <span className="text-[10px] text-orange-500 font-extrabold flex items-center gap-0.5">
                          🔥 {msg.streakCount}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timeAgo}</span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium pl-8 leading-relaxed">
                      {msg.message}
                    </p>

                    <div className="pl-8 flex items-center gap-3 pt-0.5 text-[11px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleToggleLike(msg.id)}
                        className={`flex items-center gap-1 font-semibold hover:text-rose-500 transition-colors ${
                          msg.isLiked ? 'text-rose-500 font-black' : ''
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${msg.isLiked ? 'fill-current' : ''}`} />
                        <span>{msg.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Gửi lời động viên hoặc chia sẻ tiến độ..."
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-2xs"
                  title="Gửi tin nhắn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </Container>
    </div>
  );
}
