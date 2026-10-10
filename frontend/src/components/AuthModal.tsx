'use client';

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    login,
    register,
    loginDemo,
  } = useAuth();

  // Mode: 'login' | 'register' | 'forgot'
  const [view, setView] = useState<'auth' | 'forgot'>('auth');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [forgotEmail, setForgotEmail] = useState('');

  if (!isAuthModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!registerName || !registerEmail || !registerPassword) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Bạn cần đồng ý với điều khoản sử dụng để tiếp tục.');
      return;
    }

    setIsSubmitting(true);
    const res = await register(registerEmail, registerPassword, registerName);
    setIsSubmitting(false);

    if (!res.success && res.error) {
      setErrorMsg(res.error);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrorMsg('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotSuccess(true);
    }, 800);
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', score: 0, color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Yếu', score: 1, color: 'bg-rose-500' };
    if (score <= 4) return { label: 'Khá', score: 2, color: 'bg-amber-500' };
    return { label: 'Mạnh', score: 3, color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(registerPassword);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div
        className="fixed inset-0"
        onClick={() => {
          closeAuthModal();
          setErrorMsg('');
          setView('auth');
        }}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl border border-[#E7DED2]/80 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="relative px-7 pt-7 pb-4 bg-gradient-to-b from-[#FFF0E7]/40 to-transparent">
          <button
            onClick={() => {
              closeAuthModal();
              setErrorMsg('');
              setView('auth');
            }}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-[#102A43] rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#FF5C28] flex items-center justify-center text-white shadow-sm shadow-[#FF5C28]/25">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg text-[#102A43]">
              LinguaCore<span className="text-[#FF5C28]">.</span>
            </span>
          </div>

          {view === 'auth' ? (
            <div>
              <h2 className="text-2xl font-bold text-[#102A43] tracking-tight">
                {authModalTab === 'login' ? 'Chào mừng bạn trở lại' : 'Bắt đầu học ngay hôm nay'}
              </h2>
              <p className="text-xs text-[#718096] mt-1">
                {authModalTab === 'login'
                  ? 'Đăng nhập để lưu tiến độ và thi đua bảng xếp hạng.'
                  : 'Tạo tài khoản miễn phí để tiếp cận toàn bộ lộ trình học.'}
              </p>

              {/* Tab Selector */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-[#F4EFEA] rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-sm font-semibold rounded-xl transition-all ${
                    authModalTab === 'login'
                      ? 'bg-white text-[#102A43] shadow-sm'
                      : 'text-[#718096] hover:text-[#102A43]'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setErrorMsg('');
                  }}
                  className={`py-2 text-sm font-semibold rounded-xl transition-all ${
                    authModalTab === 'register'
                      ? 'bg-white text-[#102A43] shadow-sm'
                      : 'text-[#718096] hover:text-[#102A43]'
                  }`}
                >
                  Đăng ký tài khoản
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-[#102A43] tracking-tight">
                Khôi phục mật khẩu
              </h2>
              <p className="text-xs text-[#718096] mt-1">
                Nhập email đã đăng ký của bạn để nhận liên kết đặt lại mật khẩu.
              </p>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-7 pt-2 overflow-y-auto flex-1">
          {/* Error Message banner */}
          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' ? (
            <div>
              {forgotSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#102A43]">Đã gửi email khôi phục!</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu tới <strong>{forgotEmail}</strong>. Hãy kiểm tra hộp thư của bạn.
                  </p>
                  <button
                    onClick={() => {
                      setView('auth');
                      setForgotSuccess(false);
                      setAuthModalTab('login');
                    }}
                    className="mt-6 w-full py-3 bg-[#FF5C28] hover:bg-[#ea501e] text-white font-bold text-sm rounded-2xl shadow-md transition-all"
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="learner@example.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#FF5C28] hover:bg-[#ea501e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-[#FF5C28]/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Gửi liên kết khôi phục</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setView('auth');
                      setErrorMsg('');
                    }}
                    className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-[#102A43] transition-colors"
                  >
                    Quay lại Đăng nhập
                  </button>
                </form>
              )}
            </div>
          ) : authModalTab === 'login' ? (
            /* TAB: LOGIN */
            <div>
              {/* Quick Demo Login Option */}
              <button
                type="button"
                onClick={loginDemo}
                className="w-full mb-5 p-3 rounded-2xl border border-dashed border-[#FF5C28]/60 bg-[#FFF7F2] hover:bg-[#FFEFE6] text-[#FF5C28] font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Đăng nhập nhanh 1 chạm (Tài khoản mẫu)</span>
              </button>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1.5">
                    Email hoặc Tên tài khoản
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#102A43]">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setForgotEmail(loginEmail);
                        setErrorMsg('');
                      }}
                      className="text-xs text-[#FF5C28] hover:underline font-semibold"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#FF5C28] rounded border-slate-300 focus:ring-[#FF5C28]"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 select-none cursor-pointer">
                    Ghi nhớ đăng nhập trên thiết bị này
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-[#FF5C28] hover:bg-[#ea501e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-[#FF5C28]/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Đăng nhập ngay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Separator */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 font-medium">hoặc tiếp tục với</span>
                </div>
              </div>

              {/* Social Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={loginDemo}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={loginDemo}
                  className="flex items-center justify-center gap-2.5 py-2.5 px-4 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              {/* Bottom toggle */}
              <div className="mt-6 text-center text-xs text-slate-500">
                Chưa có tài khoản LinguaCore?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('register');
                    setErrorMsg('');
                  }}
                  className="font-bold text-[#FF5C28] hover:underline"
                >
                  Đăng ký miễn phí
                </button>
              </div>
            </div>
          ) : (
            /* TAB: REGISTER */
            <div>
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    Họ và tên
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {registerPassword && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full ${
                            strength.score >= 1 ? strength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            strength.score >= 2 ? strength.color : 'bg-slate-200'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full ${
                            strength.score >= 3 ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#102A43] mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#FF5C28] focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms agreement */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#FF5C28] rounded border-slate-300 focus:ring-[#FF5C28]"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[11px] text-slate-600 select-none cursor-pointer leading-tight"
                  >
                    Tôi đồng ý với{' '}
                    <span className="text-[#FF5C28] underline">Điều khoản sử dụng</span> và{' '}
                    <span className="text-[#FF5C28] underline">Chính sách bảo mật</span> của LinguaCore.
                  </label>
                </div>

                {/* Register Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 bg-[#FF5C28] hover:bg-[#ea501e] disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-md shadow-[#FF5C28]/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Tạo tài khoản học viên</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom toggle */}
              <div className="mt-5 text-center text-xs text-slate-500">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-[#FF5C28] hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
