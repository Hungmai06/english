import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FFF8F0] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-orange-200/80 shadow-float">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <p className="text-4xl font-black text-orange-500">404</p>
          <h1 className="text-2xl font-black text-slate-900">
            Trang Không Tồn Tại
          </h1>
          <p className="text-sm text-slate-600">
            Nội dung bạn tìm kiếm hiện chưa có hoặc đường dẫn đã thay đổi. Hãy quay lại trang chủ để tiếp tục học nhé!
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ</span>
          </Link>
          <Link
            href="/learn/grammar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all"
          >
            <span>Học Ngữ Pháp</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
