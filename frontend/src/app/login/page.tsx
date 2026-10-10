'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, openAuthModal } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      openAuthModal('login');
      router.push('/');
    }
  }, [isAuthenticated, openAuthModal, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="flex items-center gap-3 text-slate-500 font-medium">
        <span className="w-5 h-5 border-2 border-[#FF5C28] border-t-transparent rounded-full animate-spin" />
        <span>Đang mở trang đăng nhập...</span>
      </div>
    </div>
  );
}
