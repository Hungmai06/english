'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  BookOpen,
  User as UserIcon,
  Flame,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  BookmarkCheck,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/authContext';
import { CoinIcon } from '@/components/CoinIcon';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/learn/grammar', label: 'Ngữ pháp' },
    { href: '/learn/vocabulary', label: 'Từ vựng' },
    { href: '/leaderboard', label: 'Bảng xếp hạng' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7DED2]/60 transition-all">
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 lg:px-12 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Left: Brand Logo & Subtitle */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5C28] flex items-center justify-center text-white shadow-md shadow-[#FF5C28]/25 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-[#102A43] group-hover:text-[#FF5C28] transition-colors leading-none">
              LinguaCore<span className="text-[#FF5C28]">.</span>
            </span>
            <span className="text-[11px] font-medium text-[#718096] mt-1">
              Học tiếng Anh dễ dàng hơn
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  if (link.href === '/learn/grammar' && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reset-grammar-view'));
                  }
                }}
                className={cn(
                  'transition-colors py-1',
                  isActive
                    ? 'text-[#102A43] font-bold border-b-2 border-[#FF5C28]'
                    : 'text-[#718096] hover:text-[#102A43]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search, Divider, Login, CTA Button */}
        <div className="hidden md:flex items-center gap-4 text-sm font-semibold">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('open-search-modal'));
              }
            }}
            className="p-1.5 text-[#718096] hover:text-[#102A43] transition-colors rounded-lg hover:bg-slate-100"
            aria-label="Tìm kiếm"
            title="Tìm kiếm bài học, từ vựng"
          >
            <Search className="w-4 h-4" />
          </button>

          <span className="text-[#E7DED2]">|</span>

          {isAuthenticated && user ? (
            /* Logged in state with user dropdown */
            <div className="relative" ref={userMenuRef}>
              <div className="flex items-center gap-2">
                {/* Streak Badge */}
                <div
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0E7] text-[#FF5C28] text-xs font-bold"
                  title={`Chuỗi học liên tục ${user.streakDays || 5} ngày`}
                >
                  <Flame className="w-3.5 h-3.5 fill-[#FF5C28]" />
                  <span>{user.streakDays || 5}d</span>
                </div>

                {/* Coin Balance Badge */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/90 text-amber-900 text-xs font-black shadow-2xs hover:bg-amber-100/90 transition-colors select-none"
                  title={`Số dư: ${user.totalXP || 1420} Xu`}
                >
                  <CoinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{user.totalXP || 1420}</span>
                </div>

                {/* User Trigger */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-[#102A43] max-w-[110px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 text-[#718096] transition-transform duration-200',
                      isUserMenuOpen && 'rotate-180'
                    )}
                  />
                </button>
              </div>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E7DED2] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-[#102A43] truncate">{user.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500 font-medium">Cấp {user.level || 4}</span>
                      <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CoinIcon className="w-3.5 h-3.5" />
                        <span>{user.totalXP || 1420} Xu</span>
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#102A43] hover:bg-[#FFF0E7] hover:text-[#FF5C28] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Bảng điều khiển cá nhân</span>
                  </Link>

                  <Link
                    href="/review/mistakes"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#102A43] hover:bg-[#FFF0E7] hover:text-[#FF5C28] transition-colors"
                  >
                    <BookmarkCheck className="w-4 h-4 text-slate-400" />
                    <span>Sổ tay ôn tập & Lỗi sai</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 transition-colors mt-0.5"
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Trang Quản Trị (Admin)</span>
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged out state */
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-[#718096] hover:text-[#102A43] transition-colors font-semibold"
              >
                Đăng nhập
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-3.5 py-1.5 rounded-full border border-[#FF5C28] text-[#FF5C28] hover:bg-[#FFF0E7] text-xs font-bold transition-all"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-[#102A43] hover:bg-[#EEF4F7] rounded-lg transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#E7DED2] bg-white px-6 py-5 space-y-4 animate-in fade-in duration-150">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (link.href === '/learn/grammar' && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reset-grammar-view'));
                  }
                }}
                className="text-base font-semibold py-1.5 text-[#718096] hover:text-[#102A43]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-[#E7DED2] flex flex-col gap-3">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#FFF0E7]/60 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#102A43] text-white flex items-center justify-center font-bold text-sm">
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#102A43]">{user.displayName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#FF5C28] text-xs font-bold shadow-xs">
                      <Flame className="w-3.5 h-3.5 fill-[#FF5C28]" />
                      <span>{user.streakDays || 5}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                      <CoinIcon className="w-3.5 h-3.5" />
                      <span>{user.totalXP || 1420}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#102A43] py-1"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>Bảng điều khiển cá nhân</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm font-bold text-amber-700 py-1"
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Trang Quản Trị (Admin)</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-rose-600 py-1 text-left w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="w-full text-left text-base text-[#718096] hover:text-[#102A43] font-semibold py-1.5"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="w-full py-2.5 rounded-2xl border border-[#FF5C28] text-[#FF5C28] font-bold text-sm text-center hover:bg-[#FFF0E7]"
                >
                  Đăng ký tài khoản
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};




