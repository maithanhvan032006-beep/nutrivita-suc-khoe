import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Flame,
  Droplets,
  Dumbbell,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Logo } from './Logo';

interface LandingPageProps {
  onLoginWithGoogle: () => Promise<void>;
  authLoading: boolean;
  authError: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginWithGoogle,
  authLoading,
  authError,
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);

  const handleLoginClick = async () => {
    setInternalError(null);
    try {
      await onLoginWithGoogle();
    } catch (err: any) {
      setInternalError(err.message || 'Đăng nhập không thành công.');
    }
  };

  const errorMessage = authError || internalError;

  return (
    <div className="min-h-screen bg-[#FFF8EF] dark:bg-gray-950 text-[#343746] dark:text-gray-100 flex flex-col justify-between selection:bg-[#F4A7C3]/30">
      {/* Top Banner Navigation */}
      <header className="w-full border-b border-[#FCE8EF] dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" />

          <button
            onClick={handleLoginClick}
            disabled={authLoading}
            className="flex items-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:border-[#F4A7C3] dark:hover:border-[#F4A7C3] text-[#343746] dark:text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{authLoading ? 'Đang xử lý...' : 'Tiếp tục với Google'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center text-center">
        {/* Subtle Announcement */}
        <div className="inline-flex items-center gap-2 bg-[#FCE8EF] dark:bg-gray-800/80 border border-[#F4A7C3]/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#3978AE] dark:text-[#83BDEB] mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#F4A7C3]" />
          <span>Theo dõi dinh dưỡng & sức khỏe toàn diện bằng AI</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#343746] dark:text-white tracking-tight leading-tight sm:leading-tight max-w-4xl">
          Đồng hành cùng lối sống cân bằng,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F4A7C3] via-[#3978AE] to-[#83BDEB]">
            khoẻ mạnh & rạng rỡ
          </span>{' '}
          mỗi ngày
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl font-normal leading-relaxed">
          Nutrivita cung cấp giải pháp cá nhân hóa: tính toán khoa học BMR & TDEE theo công thức Mifflin–St Jeor, quản lý lượng calo từ món ăn Việt Nam, nhật ký nước uống, kế hoạch tập luyện và gợi ý thực đơn thông minh bằng trí tuệ nhân tạo Gemini.
        </p>

        {/* Error Notification Banner if any */}
        {errorMessage && (
          <div className="mt-6 w-full max-w-md p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs sm:text-sm text-left">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="font-bold">Đăng nhập chưa hoàn tất</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* CTA Button Box */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center">
          <button
            onClick={handleLoginClick}
            disabled={authLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-[#F4A7C3] to-[#83BDEB] hover:opacity-95 text-[#343746] font-bold px-7 py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base disabled:opacity-50"
          >
            <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{authLoading ? 'Đang kết nối Google...' : 'Bắt đầu với Google'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Security & Verification Badges */}
        <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Xác thực Google OAuth thật</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3978AE]" />
            <span>Không lưu mật khẩu, bảo mật Firestore</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Card 1: Dinh dưỡng */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 flex items-center justify-center text-[#F4A7C3] mb-4">
              <Flame className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-[#343746] dark:text-white">
              Quản lý Calo & Món ăn Việt
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Theo dõi 4 bữa ăn trong ngày với cơ sở dữ liệu ẩm thực Việt Nam (Phở, Bún chả, Cơm tấm, v.v.). Tự động phân tách Carbs, Protein, Chất béo và Chất xơ theo khẩu phần chuẩn xác.
            </p>
          </div>

          {/* Card 2: BMR & Nước */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 flex items-center justify-center text-[#83BDEB] mb-4">
              <Droplets className="w-5 h-5 text-[#3978AE]" />
            </div>
            <h3 className="text-base font-bold text-[#343746] dark:text-white">
              BMR, TDEE & Hydration Khoa học
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Tính mức năng lượng cơ bản và tiêu hao hằng ngày theo công thức Mifflin–St Jeor chuẩn quốc tế. Cài đặt mục tiêu uống nước phù hợp với trọng lượng cơ thể.
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
        <div className="mt-14 max-w-3xl p-5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-left text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-bold mb-1 text-amber-900 dark:text-amber-200">
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>Lưu ý sức khỏe & cam kết minh bạch</span>
          </div>
          <p className="leading-relaxed">
            Nutrivita cung cấp số liệu BMR, TDEE và calo ước tính dựa trên công thức dinh dưỡng tiêu chuẩn nhằm hỗ trợ xây dựng lối sống lành mạnh. Ứng dụng không thay thế chẩn đoán y khoa, không kê đơn thuốc hoặc điều trị bệnh lý. Người dùng dưới 18 tuổi, phụ nữ đang mang thai hoặc cho con bú, hoặc người có bệnh lý nền cần tham khảo ý kiến bác sĩ chuyên môn trước khi áp dụng chế độ ăn kiêng hay thâm hụt calo.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#FCE8EF] dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>© 2026 Nutrivita – AI Health & Nutrition Tracker. Tất cả dữ liệu thuộc quyền sở hữu của người dùng.</p>
      </footer>
    </div>
  );
};
