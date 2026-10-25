import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Flame,
  Droplets,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  User,
  Mail,
  Lock,
  UserCheck,
  LogIn,
} from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onRegisterWithEmail: (name: string, email: string, password: string) => Promise<void>;
  onLoginWithEmail: (email: string, password: string) => Promise<void>;
  onContinueAsGuest: (name?: string) => void;
  authLoading: boolean;
  authError: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onRegisterWithEmail,
  onLoginWithEmail,
  onContinueAsGuest,
  authLoading,
  authError,
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    if (authMode === 'register') {
      if (!displayName.trim()) {
        setInternalError('Vui lòng nhập họ và tên của bạn.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setInternalError('Vui lòng nhập địa chỉ email hợp lệ.');
        return;
      }
      if (password.length < 6) {
        setInternalError('Mật khẩu cần có tối thiểu 6 ký tự.');
        return;
      }
      if (password !== confirmPassword) {
        setInternalError('Mật khẩu xác nhận không khớp.');
        return;
      }

      try {
        await onRegisterWithEmail(displayName, email, password);
      } catch (err: any) {
        setInternalError(err?.message || 'Đăng ký không thành công.');
      }
    } else {
      if (!email.trim() || !password) {
        setInternalError('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }

      try {
        await onLoginWithEmail(email, password);
      } catch (err: any) {
        setInternalError(err?.message || 'Đăng nhập không thành công.');
      }
    }
  };

  const handleGuestEntry = () => {
    setInternalError(null);
    onContinueAsGuest(displayName.trim() || 'Bạn');
  };

  const errorMessage = internalError || authError;

  return (
    <div className="min-h-screen bg-[#FFF8EF] dark:bg-gray-950 text-[#343746] dark:text-gray-100 flex flex-col justify-between selection:bg-[#F4A7C3]/30">
      {/* Top Banner Navigation */}
      <header className="w-full border-b border-[#FCE8EF] dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" />

          <button
            onClick={handleGuestEntry}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#FCE8EF] hover:bg-[#F4A7C3]/40 text-[#3978AE] dark:bg-gray-800 dark:text-[#83BDEB] border border-[#F4A7C3]/30 transition-all shadow-xs"
          >
            <span>Trải nghiệm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col items-center text-center">
        {/* Subtle Announcement */}
        <div className="inline-flex items-center gap-2 bg-[#FCE8EF] dark:bg-gray-800/80 border border-[#F4A7C3]/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3978AE] dark:text-[#83BDEB] mb-5">
          <Sparkles className="w-3.5 h-3.5 text-[#F4A7C3]" />
          <span>Theo dõi dinh dưỡng & sức khỏe toàn diện bằng AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#343746] dark:text-white tracking-tight leading-tight max-w-3xl">
          Đồng hành cùng lối sống cân bằng,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A7C3] via-[#3978AE] to-[#83BDEB]">
            khỏe mạnh & rạng rỡ
          </span>
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl font-normal leading-relaxed">
          Nutrivita cung cấp giải pháp cá nhân hóa: tính toán khoa học BMR & TDEE theo công thức Mifflin–St Jeor, quản lý lượng calo từ món ăn Việt Nam, nhật ký nước uống, kế hoạch tập luyện và gợi ý thực đơn bằng trí tuệ nhân tạo Gemini.
        </p>

        {/* AUTH BOX: REGISTER / LOGIN / GUEST */}
        <div className="mt-8 w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-7 shadow-lg border border-[#FCE8EF] dark:border-gray-800 text-left transition-all">
          {/* Tabs Switcher: Đăng ký / Đăng nhập */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setInternalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white dark:bg-gray-700 text-[#3978AE] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Tự đăng ký tài khoản
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setInternalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-gray-700 text-[#3978AE] dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Đăng nhập
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Họ và tên của bạn
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Vd: Nguyễn Minh Châu"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
              </div>
            </div>

            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/40 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {authLoading ? (
                <span>Đang xử lý...</span>
              ) : authMode === 'register' ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Hoàn tất đăng ký & Bắt đầu</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập vào tài khoản</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <span className="relative bg-white dark:bg-gray-900 px-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              Hoặc
            </span>
          </div>

          {/* Skip / Guest Mode: "Tự đăng kí và đăng nhập sau" */}
          <button
            type="button"
            onClick={handleGuestEntry}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#FCE8EF] to-[#FFF8EF] dark:from-gray-800 dark:to-gray-800 hover:from-[#F4A7C3]/30 text-[#343746] dark:text-gray-100 font-bold rounded-xl text-xs border border-[#F4A7C3]/50 transition-all flex items-center justify-center gap-2 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-[#3978AE]" />
            <span>Trải nghiệm ngay (Đăng nhập sau)</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
          </button>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            Dùng ngay không cần đăng nhập · Bạn có thể tạo tài khoản bất kỳ lúc nào trong Hồ sơ.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1: Dinh dưỡng */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 flex items-center justify-center text-[#F4A7C3] mb-4">
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-[#343746] dark:text-white">
              Quản lý Calo & Món ăn Việt
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Theo dõi 4 bữa ăn với danh mục ẩm thực Việt Nam (Phở, Bún chả, Cơm tấm, v.v.). Tự động phân tách Carbs, Protein, Chất béo và Chất xơ theo khẩu phần chuẩn xác.
            </p>
          </div>

          {/* Card 2: BMR & Nước */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 flex items-center justify-center text-[#83BDEB] mb-4">
              <Droplets className="w-5 h-5 text-[#3978AE]" />
            </div>
            <h3 className="text-base font-bold text-[#343746] dark:text-white">
              BMR, TDEE & Nước uống
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Tính mức năng lượng cơ bản và tiêu hao hằng ngày theo công thức Mifflin–St Jeor chuẩn quốc tế. Cài đặt mục tiêu uống nước khoa học theo trọng lượng.
            </p>
          </div>

          {/* Card 3: AI & Tập luyện */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 flex items-center justify-center text-[#F4A7C3] mb-4">
              <Sparkles className="w-5 h-5 text-[#3978AE]" />
            </div>
            <h3 className="text-base font-bold text-[#343746] dark:text-white">
              Trợ lý AI & Lịch tập cá nhân
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Tạo thực đơn 1 ngày chuẩn món Việt phù hợp với mục tiêu giảm cân/tăng cơ. Hỏi đáp cùng Nutrivita AI để giải thích chỉ số và nhận lời khuyên dinh dưỡng hữu ích.
            </p>
          </div>
        </div>

        {/* Medical & Scientific Disclaimer */}
        <div className="mt-12 max-w-3xl p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-left text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-900 dark:text-amber-200">
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>Lưu ý sức khỏe & cam kết minh bạch</span>
          </div>
          <p className="leading-relaxed">
            Nutrivita cung cấp số liệu BMR, TDEE và calo ước tính dựa trên công thức dinh dưỡng tiêu chuẩn nhằm hỗ trợ lối sống lành mạnh. Ứng dụng không thay thế chẩn đoán y khoa hoặc điều trị bệnh lý.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#FCE8EF] dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 py-5 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 Nutrivita – AI Health & Nutrition Tracker. Tất cả dữ liệu thuộc quyền sở hữu của người dùng.</p>
      </footer>
    </div>
  );
};
