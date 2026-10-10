'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Users,
  Settings,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Volume2,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  Award,
  Lock,
  Unlock,
  Eye,
  FileText,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import {
  AdminUserItem,
  AdminActivityLog,
  AdminGrammarLessonItem,
  getAdminVocabWords,
  saveAdminVocabWord,
  saveAdminVocabWordsBulk,
  deleteAdminVocabWord,
  getAdminQuestions,
  saveAdminQuestion,
  deleteAdminQuestion,
  getAdminUsers,
  saveAdminUser,
  deleteAdminUser,
  toggleAdminUserStatus,
  getAdminLessons,
  saveAdminLesson,
  deleteAdminLesson,
  getAdminCollections,
  saveAdminCollection,
  getAdminActivityLogs,
  getAdminDashboardStats,
  resetAdminDataToDefaults,
} from '@/lib/adminStorage';
import { VocabularyWord, Question, VocabularySense, VocabularyCollection } from '@/types';
import { VOCABULARY_COLLECTIONS } from '@/lib/data/mockData';
import { AdminPagination } from '@/components/admin/AdminPagination';
import { TrafficAnalyticsSection } from '@/components/admin/TrafficAnalyticsSection';
import { TopRankingsSection } from '@/components/admin/TopRankingsSection';
import { CefrDistributionChart } from '@/components/admin/CefrDistributionChart';
import { BulkVocabModal } from '@/components/admin/BulkVocabModal';
import { LessonDetailModal } from '@/components/admin/LessonDetailModal';
import { LessonPreviewModal } from '@/components/admin/LessonPreviewModal';
import { Modal } from '@/design-system/components/Modal';
import { CoinIcon } from '@/components/CoinIcon';
import { speakText } from '@/lib/tts';
import { GrammarAdminHub } from '@/components/admin/grammar/GrammarAdminHub';

type AdminTab = 'overview' | 'vocab' | 'lessons' | 'users';

export default function AdminDashboardPage() {
  // Navigation
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data
  const [vocabList, setVocabList] = useState<VocabularyWord[]>([]);
  const [collectionsList, setCollectionsList] = useState<VocabularyCollection[]>([]);
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [lessonsList, setLessonsList] = useState<AdminGrammarLessonItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Reload all from storage
  const reloadData = () => {
    setVocabList(getAdminVocabWords());
    setCollectionsList(getAdminCollections());
    setQuestionsList(getAdminQuestions());
    setUsersList(getAdminUsers());
    setLessonsList(getAdminLessons());
    setActivityLogs(getAdminActivityLogs());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // =========================================================================
  // 1. VOCABULARY TAB STATE & LOGIC
  // =========================================================================
  const [vocabSearch, setVocabSearch] = useState('');
  const [vocabColFilter, setVocabColFilter] = useState<string>('ALL');
  const [vocabPage, setVocabPage] = useState(1);
  const [vocabPageSize, setVocabPageSize] = useState(10);

  // Vocab Modal State
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [isBulkVocabModalOpen, setIsBulkVocabModalOpen] = useState(false);
  const [editingVocab, setEditingVocab] = useState<VocabularyWord | null>(null);
  const [isCreatingColInSingleModal, setIsCreatingColInSingleModal] = useState(false);
  const [newColTitleInSingleModal, setNewColTitleInSingleModal] = useState('');
  const [vocabFormData, setVocabFormData] = useState({
    id: '',
    lemma: '',
    ipa: '',
    collectionId: 'col-oxford',
    viDefinition: '',
  });

  const handleBulkVocabImport = (
    importedWords: VocabularyWord[],
    newCollection?: VocabularyCollection
  ) => {
    if (newCollection) {
      saveAdminCollection(newCollection);
    }
    saveAdminVocabWordsBulk(importedWords);
    reloadData();
    showToast(
      newCollection
        ? `Đã tạo bộ từ "${newCollection.title}" và thêm ${importedWords.length} từ mới!`
        : `Đã thêm thành công ${importedWords.length} từ vựng mới vào kho!`,
      'success'
    );
  };

  const filteredVocab = useMemo(() => {
    return vocabList.filter((item) => {
      const q = vocabSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.lemma.toLowerCase().includes(q) ||
        item.ipa.toLowerCase().includes(q) ||
        item.senses?.some((s) => s.viDefinition.toLowerCase().includes(q) || s.definition.toLowerCase().includes(q));

      const matchCol = vocabColFilter === 'ALL' || item.collectionId === vocabColFilter;

      return matchSearch && matchCol;
    });
  }, [vocabList, vocabSearch, vocabColFilter]);

  const paginatedVocab = useMemo(() => {
    const start = (vocabPage - 1) * vocabPageSize;
    return filteredVocab.slice(start, start + vocabPageSize);
  }, [filteredVocab, vocabPage, vocabPageSize]);

  const handleOpenAddVocab = () => {
    setEditingVocab(null);
    setIsCreatingColInSingleModal(false);
    setNewColTitleInSingleModal('');
    setVocabFormData({
      id: `w-${Date.now()}`,
      lemma: '',
      ipa: '',
      collectionId: collectionsList[0]?.id || 'col-oxford',
      viDefinition: '',
    });
    setIsVocabModalOpen(true);
  };

  const handleOpenEditVocab = (word: VocabularyWord) => {
    setEditingVocab(word);
    setIsCreatingColInSingleModal(false);
    setNewColTitleInSingleModal('');
    const sense = word.senses?.[0];
    setVocabFormData({
      id: word.id,
      lemma: word.lemma,
      ipa: word.ipa || '',
      collectionId: word.collectionId || collectionsList[0]?.id || 'col-oxford',
      viDefinition: sense?.viDefinition || sense?.definition || '',
    });
    setIsVocabModalOpen(true);
  };

  const handleSaveVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabFormData.lemma.trim() || !vocabFormData.viDefinition.trim()) {
      showToast('Vui lòng nhập từ vựng và nghĩa tiếng Việt', 'error');
      return;
    }

    let targetCollectionId = vocabFormData.collectionId;
    if (isCreatingColInSingleModal && newColTitleInSingleModal.trim()) {
      const slug = newColTitleInSingleModal
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      targetCollectionId = `col-${Date.now()}`;
      const newCol: VocabularyCollection = {
        id: targetCollectionId,
        title: newColTitleInSingleModal.trim(),
        slug: slug || `col-${Date.now()}`,
        description: `Bộ từ vựng ${newColTitleInSingleModal.trim()}`,
        category: 'Custom',
        icon: 'BookOpen',
        wordsCount: 1,
      };
      saveAdminCollection(newCol);
    }

    const wordToSave: VocabularyWord = {
      id: vocabFormData.id || `w-${Date.now()}`,
      lemma: vocabFormData.lemma.trim(),
      ipa: vocabFormData.ipa.trim() || `/${vocabFormData.lemma.trim()}/`,
      level: 'B1',
      collectionId: targetCollectionId,
      senses: [
        {
          id: `s-${Date.now()}`,
          partOfSpeech: 'verb',
          definition: vocabFormData.viDefinition.trim(),
          viDefinition: vocabFormData.viDefinition.trim(),
          examples: [],
        },
      ],
      collocations: [],
    };

    saveAdminVocabWord(wordToSave);
    reloadData();
    setIsVocabModalOpen(false);
    setIsCreatingColInSingleModal(false);
    setNewColTitleInSingleModal('');
    showToast(editingVocab ? `Đã cập nhật từ "${wordToSave.lemma}"` : `Đã thêm mới từ "${wordToSave.lemma}"`, 'success');
  };

  const handleDeleteVocab = (word: VocabularyWord) => {
    if (confirm(`Bạn có chắc muốn xóa từ vựng "${word.lemma}" khỏi cơ sở dữ liệu?`)) {
      deleteAdminVocabWord(word.id);
      reloadData();
      showToast(`Đã xóa từ "${word.lemma}"`, 'info');
    }
  };



  // =========================================================================
  // 3. USERS MANAGEMENT TAB STATE & LOGIC
  // =========================================================================
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [userFormData, setUserFormData] = useState({
    id: '',
    email: '',
    displayName: '',
    role: 'STUDENT' as AdminUserItem['role'],
    level: 1,
    streakDays: 0,
    totalXP: 100,
    status: 'ACTIVE' as AdminUserItem['status'],
  });

  const filteredUsers = useMemo(() => {
    return usersList.filter((item) => {
      const q = userSearch.toLowerCase().trim();
      const matchSearch =
        !q || item.displayName.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);

      const matchRole = userRoleFilter === 'ALL' || item.role === userRoleFilter;
      const matchStatus = userStatusFilter === 'ALL' || item.status === userStatusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [usersList, userSearch, userRoleFilter, userStatusFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * userPageSize;
    return filteredUsers.slice(start, start + userPageSize);
  }, [filteredUsers, userPage, userPageSize]);

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      id: `usr-${Date.now()}`,
      email: '',
      displayName: '',
      role: 'STUDENT',
      level: 1,
      streakDays: 0,
      totalXP: 200,
      status: 'ACTIVE',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AdminUserItem) => {
    setEditingUser(user);
    setUserFormData({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      level: user.level,
      streakDays: user.streakDays,
      totalXP: user.totalXP,
      status: user.status,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.email.trim() || !userFormData.displayName.trim()) {
      showToast('Vui lòng điền họ tên và email', 'error');
      return;
    }

    const userToSave: AdminUserItem = {
      id: userFormData.id || `usr-${Date.now()}`,
      email: userFormData.email.trim(),
      displayName: userFormData.displayName.trim(),
      role: userFormData.role,
      level: Number(userFormData.level) || 1,
      streakDays: Number(userFormData.streakDays) || 0,
      totalXP: Number(userFormData.totalXP) || 0,
      status: userFormData.status,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    saveAdminUser(userToSave);
    reloadData();
    setIsUserModalOpen(false);
    showToast(editingUser ? `Cập nhật tài khoản ${userToSave.email}` : `Đã tạo tài khoản ${userToSave.email}`, 'success');
  };

  const handleToggleUserStatus = (user: AdminUserItem) => {
    toggleAdminUserStatus(user.id);
    reloadData();
    showToast(`Đã thay đổi trạng thái tài khoản ${user.email}`, 'info');
  };

  const handleDeleteUser = (user: AdminUserItem) => {
    if (confirm(`Xác nhận xóa vĩnh viễn tài khoản "${user.email}"?`)) {
      deleteAdminUser(user.id);
      reloadData();
      showToast(`Đã xóa tài khoản ${user.email}`, 'info');
    }
  };

  // =========================================================================
  // 4. GRAMMAR LESSONS TAB STATE & LOGIC
  // =========================================================================
  const [lessonSearch, setLessonSearch] = useState('');
  const [lessonStatusFilter, setLessonStatusFilter] = useState('ALL');
  const [lessonPage, setLessonPage] = useState(1);
  const [lessonPageSize, setLessonPageSize] = useState(10);

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<AdminGrammarLessonItem | null>(null);
  const [previewLesson, setPreviewLesson] = useState<AdminGrammarLessonItem | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const filteredLessons = useMemo(() => {
    return lessonsList.filter((item) => {
      const q = lessonSearch.toLowerCase().trim();
      const matchSearch =
        !q || item.title.toLowerCase().includes(q) || item.topicTitle.toLowerCase().includes(q);
      const matchStatus = lessonStatusFilter === 'ALL' || item.status === lessonStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [lessonsList, lessonSearch, lessonStatusFilter]);

  const paginatedLessons = useMemo(() => {
    const start = (lessonPage - 1) * lessonPageSize;
    return filteredLessons.slice(start, start + lessonPageSize);
  }, [filteredLessons, lessonPage, lessonPageSize]);

  const handleOpenAddLesson = () => {
    setEditingLesson(null);
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (item: AdminGrammarLessonItem) => {
    setEditingLesson(item);
    setIsLessonModalOpen(true);
  };

  const handleOpenPreviewLesson = (item: AdminGrammarLessonItem) => {
    setPreviewLesson(item);
    setIsPreviewModalOpen(true);
  };

  const handleSaveLesson = (lessonToSave: AdminGrammarLessonItem) => {
    saveAdminLesson(lessonToSave);
    reloadData();
    setIsLessonModalOpen(false);
    showToast(
      editingLesson
        ? `Đã cập nhật bài học "${lessonToSave.title}"`
        : `Đã tạo bài học mới "${lessonToSave.title}"`,
      'success'
    );
  };

  const handleDeleteLesson = (item: AdminGrammarLessonItem) => {
    if (confirm(`Bạn có chắc muốn xóa bài học "${item.title}"?`)) {
      deleteAdminLesson(item.id);
      reloadData();
      showToast(`Đã xóa bài học "${item.title}"`, 'info');
    }
  };

  // Dashboard Metrics
  const stats = useMemo(() => getAdminDashboardStats(), [vocabList, questionsList, usersList, lessonsList]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500 shadow-rose-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
            {toast.type === 'info' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* =========================================================================
          LEFT VERTICAL SIDEBAR (CỘT DỌC TRUYỀN THỐNG)
      ========================================================================= */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-50 md:z-30 w-72 md:w-64 lg:w-72 bg-white border-r border-slate-200 flex flex-col h-screen transition-transform duration-200 ease-in-out flex-shrink-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#102A43] to-[#243B53] text-white flex items-center justify-center font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div className="leading-tight">
              <span className="font-black text-slate-900 text-lg tracking-tight block">
                Lingua<span className="text-[#FF5C28]">Core</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-0.5">
                ADMIN PORTAL
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Status Sub-banner */}
        <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Hệ thống trực tuyến</span>
          </div>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
            v2.5
          </span>
        </div>

        {/* Vertical Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Danh Mục Quản Trị
            </div>
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Tổng Quan Hệ Thống', icon: LayoutDashboard, count: null },
                { id: 'vocab', label: 'Quản Lý Từ Vựng', icon: BookOpen, count: vocabList.length },
                { id: 'lessons', label: '21 Chuyên Đề Ngữ Pháp', icon: FileText, count: 21 },
                { id: 'users', label: 'Quản Lý Học Viên', icon: Users, count: usersList.length },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdminTab);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-[#FF5C28] border-r-4 border-[#FF5C28] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#FF5C28] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-left font-bold">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.count !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                            isActive
                              ? 'bg-[#FF5C28]/15 text-[#FF5C28]'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isActive
                            ? 'text-[#FF5C28] translate-x-0.5'
                            : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Thao Tác Nhanh
            </div>
            <div className="space-y-1">
              <Link
                href="/"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span>Về trang học viên</span>
              </Link>

              <button
                onClick={() => {
                  if (confirm('Khôi phục toàn bộ cơ sở dữ liệu mẫu ban đầu?')) {
                    resetAdminDataToDefaults();
                    reloadData();
                    showToast('Đã khôi phục dữ liệu mẫu mặc định', 'info');
                  }
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left"
                title="Đặt lại dữ liệu ban đầu"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span>Reset Dữ Liệu Mẫu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Bottom Profile */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-[#FF5C28] text-white flex items-center justify-center font-black text-xs shadow-xs">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">Quản trị viên</div>
              <div className="text-[10px] text-slate-400 font-medium truncate">admin@linguacore.edu.vn</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white flex-shrink-0" title="Đang hoạt động" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT COLUMN: TOPBAR + MAIN CONTENT AREA (MỞ RA BÊN PHẢI)
      ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Mở menu quản trị"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <div className="flex items-center gap-2">
                <span className="text-slate-900 font-black text-sm sm:text-base">
                  {activeTab === 'overview' && 'Tổng Quan Hệ Thống'}
                  {activeTab === 'vocab' && 'Quản Lý Kho Từ Vựng'}
                  {activeTab === 'lessons' && 'Quản Lý Bài Học Ngữ Pháp'}
                  {activeTab === 'users' && 'Quản Lý Tài Khoản Học Viên'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#FF5C28] border border-orange-200/60 hidden sm:inline-block">
                  {activeTab === 'overview' && 'Chỉ số & KPI'}
                  {activeTab === 'vocab' && `${vocabList.length} mục`}
                  {activeTab === 'lessons' && `${lessonsList.length} bài`}
                  {activeTab === 'users' && `${usersList.length} học viên`}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area (Right Pane) */}
        <main className="flex-1 max-w-7xl w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* ================================================================
            TAB 1: OVERVIEW DASHBOARD
        ================================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 4 KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Vocab */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tổng Từ Vựng
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5C28] flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalWords}</div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">A1-C2</span> chuẩn khung Châu Âu
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('vocab')}
                  className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Xem danh sách từ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stat 2: Lessons (Replaces Questions Bank) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Bài Học Ngữ Pháp
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5C28] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{lessonsList.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Chuẩn 4 mục: Lí thuyết, Ví dụ, Bài tập, Thi online</p>
                </div>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Quản lý bài học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stat 3: Users */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Người Dùng & Học Viên
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    {stats.activeUsers} tài khoản đang hoạt động
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Quản lý học viên</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Stat 4: Coins in Circulation */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Tổng Xu Lưu Hành
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <CoinIcon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-amber-600 flex items-center gap-1.5">
                    <span>{stats.totalCoinsInCirculation.toLocaleString()}</span>
                    <span className="text-xs font-bold text-amber-800">Xu</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Thưởng qua bài học & streak</p>
                </div>
                <button
                  onClick={() => setActiveTab('lessons')}
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1 pt-1"
                >
                  <span>Xem {stats.totalLessons} bài học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SECTION 1: WEBSITE TRAFFIC & USER VISITS ANALYTICS */}
            <TrafficAnalyticsSection />

            {/* SECTION 2: TOP RANKINGS & HIGHEST QUANTITY STATS */}
            <TopRankingsSection
              usersList={usersList}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* SECTION 3: CEFR DISTRIBUTION, QUICK SHORTCUTS & AUDIT LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: CEFR Chart & Fast Action Shortcuts */}
              <div className="lg:col-span-5 space-y-4">
                {/* Visual CEFR Distribution Chart */}
                <CefrDistributionChart vocabList={vocabList} questionsList={questionsList} />

                {/* Quick Actions */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF5C28]" />
                    <span>Thao Tác Nhanh Quản Trị</span>
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('vocab');
                        handleOpenAddVocab();
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-[#FF5C28]" />
                        <span>Thêm Từ Vựng Mới</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('vocab');
                        setIsBulkVocabModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-amber-600" />
                        <span>Thêm Hàng Loạt Từ Mới</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('users');
                        handleOpenAddUser();
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>Thêm Tài Khoản Học Viên</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('lessons');
                        handleOpenAddLesson();
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left text-xs font-bold text-slate-800 flex items-center justify-between transition-all"
                    >
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span>Tạo Bài Học Ngữ Pháp</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Activity Audit Trail */}
              <div className="lg:col-span-7">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Nhật Ký Hoạt Động & Thay Đổi (Audit Trail)</span>
                    </h3>
                    <span className="text-xs text-slate-400">{activityLogs.length} ghi nhận</span>
                  </div>

                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/80 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-black text-[10px] uppercase mt-0.5 ${
                              log.action === 'CREATE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.action === 'UPDATE'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'DELETE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {log.action}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900">{log.detail}</p>
                            <span className="text-[11px] text-slate-400">
                              Người thực hiện: {log.performedBy}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 2: VOCABULARY CRUD & PAGINATION
        ================================================================ */}
        {activeTab === 'vocab' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vocabSearch}
                    onChange={(e) => {
                      setVocabSearch(e.target.value);
                      setVocabPage(1);
                    }}
                    placeholder="Tìm theo từ, phiên âm, nghĩa tiếng Việt..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#FF5C28] focus:bg-white transition-all"
                  />
                </div>

                {/* Collection Filter */}
                <select
                  value={vocabColFilter}
                  onChange={(e) => {
                    setVocabColFilter(e.target.value);
                    setVocabPage(1);
                  }}
                  className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                >
                  <option value="ALL">Tất cả Bộ từ</option>
                  {collectionsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkVocabModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  title="Nhập nhiều từ cùng lúc"
                >
                  <Layers className="w-4 h-4" />
                  <span>Thêm Hàng Loạt</span>
                </button>

                <button
                  onClick={handleOpenAddVocab}
                  className="px-4 py-2 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Từ Vựng Mới</span>
                </button>
              </div>
            </div>

            {/* Vocab Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Từ Vựng & IPA</th>
                      <th className="py-3 px-4">Định Nghĩa Tiếng Việt</th>
                      <th className="py-3 px-3">Bộ Sưu Tập</th>
                      <th className="py-3 px-3 text-center">Phát Âm</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {paginatedVocab.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Không tìm thấy từ vựng nào phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      paginatedVocab.map((w) => {
                        const sense = w.senses?.[0];
                        return (
                          <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block text-sm">{w.lemma}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{w.ipa}</span>
                            </td>
                            <td className="py-3.5 px-4 max-w-sm">
                              <p className="font-semibold text-slate-800 line-clamp-2">
                                {sense?.viDefinition || sense?.definition || 'Chưa cập nhật'}
                              </p>
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 inline-block">
                                {collectionsList.find((c) => c.id === w.collectionId)?.title ||
                                  w.collectionId}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              <button
                                onClick={() => speakText(w.lemma)}
                                className="p-1.5 text-slate-400 hover:text-[#FF5C28] hover:bg-orange-50 rounded-lg transition-colors inline-block"
                                title="Nghe phát âm mẫu"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditVocab(w)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa từ vựng"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteVocab(w)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Xóa từ vựng"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={vocabPage}
                totalItems={filteredVocab.length}
                pageSize={vocabPageSize}
                onPageChange={(p) => setVocabPage(p)}
                onPageSizeChange={(s) => {
                  setVocabPageSize(s);
                  setVocabPage(1);
                }}
                itemLabel="từ vựng"
              />
            </div>
          </div>
        )}



        {/* ================================================================
            TAB 4: USER MANAGEMENT CRUD & PAGINATION
        ================================================================ */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setUserPage(1);
                    }}
                    placeholder="Tìm theo tên học viên, email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={userRoleFilter}
                  onChange={(e) => {
                    setUserRoleFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="ALL">Mọi Vai Trò</option>
                  <option value="STUDENT">Học viên (STUDENT)</option>
                  <option value="TEACHER">Giáo viên (TEACHER)</option>
                  <option value="ADMIN">Quản trị (ADMIN)</option>
                </select>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => {
                    setUserStatusFilter(e.target.value);
                    setUserPage(1);
                  }}
                  className="py-2 px-3 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="ALL">Mọi Trạng Thái</option>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="BANNED">Đang khóa (BANNED)</option>
                </select>
              </div>

              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Tài Khoản</span>
              </button>
            </div>

            {/* Users Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Tài Khoản / Email</th>
                      <th className="py-3 px-3">Vai Trò</th>
                      <th className="py-3 px-3">Cấp Độ</th>
                      <th className="py-3 px-3">Chuỗi Ngày</th>
                      <th className="py-3 px-3">Số Dư Xu</th>
                      <th className="py-3 px-3">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Không tìm thấy tài khoản người dùng nào.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                {u.displayName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{u.displayName}</span>
                                <span className="text-[11px] text-slate-400">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                u.role === 'ADMIN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : u.role === 'TEACHER'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-slate-800">Cấp {u.level}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-semibold text-orange-600">{u.streakDays} ngày</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-amber-700 flex items-center gap-1">
                              <CoinIcon className="w-3.5 h-3.5" />
                              <span>{u.totalXP.toLocaleString()}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}
                              />
                              <span>{u.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.status === 'ACTIVE'
                                    ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                    : 'text-rose-500 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Kích hoạt lại'}
                              >
                                {u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Chỉnh sửa tài khoản"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={userPage}
                totalItems={filteredUsers.length}
                pageSize={userPageSize}
                onPageChange={(p) => setUserPage(p)}
                onPageSizeChange={(s) => {
                  setUserPageSize(s);
                  setUserPage(1);
                }}
                itemLabel="người dùng"
              />
            </div>
          </div>
        )}

        {/* ================================================================
            TAB 5: GRAMMAR 21 TOPICS & LESSONS (COURSE -> 21 TOPICS -> LESSONS -> 4 TABS)
        ================================================================ */}
        {activeTab === 'lessons' && (
          <div className="animate-in fade-in duration-200">
            <GrammarAdminHub />
          </div>
        )}

      </main>
      </div>

      {/* =========================================================================
          MODAL 1: ADD / EDIT VOCABULARY
      ========================================================================= */}
      <Modal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        title={editingVocab ? `Chỉnh Sửa Từ Vựng: ${editingVocab.lemma}` : 'Thêm Từ Vựng Mới Vào Kho'}
        description="Điền thông tin từ vựng tiếng Anh, phiên âm quốc tế IPA và nghĩa tiếng Việt."
        size="lg"
      >
        <form onSubmit={handleSaveVocab} className="space-y-4">
          <div className="space-y-4">
            {/* 1. Từ tiếng Anh */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Từ Tiếng Anh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vocabFormData.lemma}
                onChange={(e) => setVocabFormData({ ...vocabFormData, lemma: e.target.value })}
                placeholder="Ví dụ: accomplish, resilient..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            {/* 2. Phiên âm IPA */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phiên Âm (IPA)
              </label>
              <input
                type="text"
                value={vocabFormData.ipa}
                onChange={(e) => setVocabFormData({ ...vocabFormData, ipa: e.target.value })}
                placeholder="Ví dụ: /əˈkʌm.plɪʃ/ (tự động tạo nếu để trống)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            {/* 3. Nghĩa tiếng Việt */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nghĩa Tiếng Việt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={vocabFormData.viDefinition}
                onChange={(e) => setVocabFormData({ ...vocabFormData, viDefinition: e.target.value })}
                placeholder="Ví dụ: hoàn thành, đạt được sau nỗ lực..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
              />
            </div>

            {/* 4. Bộ sưu tập từ vựng & Tạo mới */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Bộ Sưu Tập Từ Vựng
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingColInSingleModal(!isCreatingColInSingleModal)}
                  className="text-xs font-bold text-[#FF5C28] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingColInSingleModal ? 'Chọn bộ có sẵn' : 'Tạo bộ từ mới'}</span>
                </button>
              </div>

              {!isCreatingColInSingleModal ? (
                <select
                  value={vocabFormData.collectionId}
                  onChange={(e) => {
                    if (e.target.value === '__CREATE_NEW__') {
                      setIsCreatingColInSingleModal(true);
                    } else {
                      setVocabFormData({ ...vocabFormData, collectionId: e.target.value });
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                >
                  {collectionsList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.category})
                    </option>
                  ))}
                  <option value="__CREATE_NEW__">+ Tạo bộ từ mới...</option>
                </select>
              ) : (
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Nhập tên bộ sưu tập từ mới:
                  </span>
                  <input
                    type="text"
                    required
                    value={newColTitleInSingleModal}
                    onChange={(e) => setNewColTitleInSingleModal(e.target.value)}
                    placeholder="Ví dụ: 100 Từ Vựng Giao Tiếp Chuyên Ngành..."
                    className="w-full p-2 bg-white border border-orange-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#FF5C28]"
                  />
                </div>
              )}
            </div>

            {/* Quick Bulk Import shortcut notice */}
            {!editingVocab && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-600 font-medium">
                  💡 Bạn cần thêm 10, 20 hay hàng loạt từ vựng cùng lúc?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsVocabModalOpen(false);
                    setIsCreatingColInSingleModal(false);
                    setNewColTitleInSingleModal('');
                    setIsBulkVocabModalOpen(true);
                  }}
                  className="font-bold text-[#FF5C28] hover:underline flex items-center gap-1 whitespace-nowrap self-start sm:self-auto"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Chuyển sang Thêm Hàng Loạt</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsVocabModalOpen(false);
                setIsCreatingColInSingleModal(false);
                setNewColTitleInSingleModal('');
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#FF5C28] hover:bg-[#ea501e] text-xs font-bold text-white shadow-sm transition-all"
            >
              {editingVocab ? 'Cập Nhật Từ Vựng' : 'Lưu Từ Vựng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 3: ADD / EDIT USER
      ========================================================================= */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title={editingUser ? `Sửa Tài Khoản: ${editingUser.displayName}` : 'Tạo Tài Khoản Người Dùng Mới'}
        description="Cấu hình thông tin đăng nhập, vai trò phân quyền và số dư Xu thưởng."
        size="md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và Tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={userFormData.displayName}
              onChange={(e) => setUserFormData({ ...userFormData, displayName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Đăng Nhập <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              placeholder="hocvien@gmail.com"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Vai Trò Phân Quyền
              </label>
              <select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
              >
                <option value="STUDENT">Học viên (STUDENT)</option>
                <option value="TEACHER">Giáo viên (TEACHER)</option>
                <option value="ADMIN">Quản trị viên (ADMIN)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Trạng Thái Tài Khoản
              </label>
              <select
                value={userFormData.status}
                onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
              >
                <option value="ACTIVE">Hoạt Động (ACTIVE)</option>
                <option value="BANNED">Đang Khóa (BANNED)</option>
                <option value="PENDING">Chờ Kích Hoạt (PENDING)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp Độ (Level)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={userFormData.level}
                onChange={(e) => setUserFormData({ ...userFormData, level: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chuỗi Streak
              </label>
              <input
                type="number"
                min={0}
                value={userFormData.streakDays}
                onChange={(e) => setUserFormData({ ...userFormData, streakDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số Dư Xu Thưởng
              </label>
              <input
                type="number"
                min={0}
                value={userFormData.totalXP}
                onChange={(e) => setUserFormData({ ...userFormData, totalXP: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-amber-700 text-center"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all"
            >
              {editingUser ? 'Cập Nhật Người Dùng' : 'Lưu Tài Khoản'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 4: ADD / EDIT LESSON (4 SECTIONS STANDARD)
      ========================================================================= */}
      <LessonDetailModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        editingLesson={editingLesson}
        onSave={handleSaveLesson}
      />

      {/* =========================================================================
          MODAL 4B: PREVIEW LESSON (IDENTICAL TO USER VIEW)
      ========================================================================= */}
      <LessonPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        lesson={previewLesson}
        onEdit={(l) => handleOpenEditLesson(l)}
      />

      {/* =========================================================================
          MODAL 5: BULK IMPORT VOCABULARY
      ========================================================================= */}
      <BulkVocabModal
        isOpen={isBulkVocabModalOpen}
        onClose={() => setIsBulkVocabModalOpen(false)}
        collections={collectionsList}
        onImportSuccess={handleBulkVocabImport}
      />
    </div>
  );
}
