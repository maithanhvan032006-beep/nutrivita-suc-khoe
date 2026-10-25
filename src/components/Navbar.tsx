import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';

export type NavTab =
  | 'dashboard'
  | 'food_log'
  | 'workout'
  | 'meal_plan'
  | 'progress'
  | 'ai_assistant'
  | 'profile'
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  userName?: string;
  userPhoto?: string;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  selectedDate,
  onDateChange,
  userName,
  userPhoto,
  onLogout,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const navItems: { id: NavTab; label: string; iconBadge?: boolean }[] = [
    { id: 'dashboard', label: 'Tổng quan' },
    { id: 'food_log', label: 'Nhật ký ăn uống' },
    { id: 'workout', label: 'Tập luyện' },
    { id: 'meal_plan', label: 'Kế hoạch' },
    { id: 'progress', label: 'Tiến trình' },
    { id: 'ai_assistant', label: 'Trợ lý AI', iconBadge: true },
    { id: 'profile', label: 'Hồ sơ cá nhân' },
    { id: 'settings', label: 'Cài đặt' },
  ];

  // Helper for shifting date
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-[#FCE8EF] dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onTabChange('dashboard')}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A7C3] rounded-xl text-left"
            >
              <Logo size="md" />
            </button>

            {/* Date Quick Selector (Visible on tablet & desktop) */}
            <div className="hidden md:flex items-center gap-1 bg-[#FFF8EF] dark:bg-gray-800/80 px-2.5 py-1.5 rounded-xl border border-[#F4A7C3]/30">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1 text-gray-500 hover:text-[#343746] dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Ngày trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-[#343746] dark:text-gray-200">
                <Calendar className="w-3.5 h-3.5 text-[#3978AE]" />
                <span>{isToday ? 'Hôm nay' : formatDisplayDate(selectedDate)}</span>
                <span className="text-gray-400 font-normal">({selectedDate})</span>
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-1 text-gray-500 hover:text-[#343746] dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Ngày kế"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  onClick={() => onDateChange(new Date().toISOString().split('T')[0])}
                  className="ml-1 text-[11px] font-bold text-[#3978AE] hover:underline"
                >
                  Hôm nay
                </button>
              )}
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Dark mode switch */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-[#FCE8EF]/60 dark:hover:bg-gray-800 transition-colors"
              title={isDarkMode ? 'Chuyển giao diện sáng' : 'Chuyển giao diện tối'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#3978AE]" />}
            </button>

            {/* User profile dropdown info */}
            {userName && (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => onTabChange('profile')}
                  className="flex items-center gap-2 group text-left"
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt={userName}
                      className="w-8 h-8 rounded-full border border-[#F4A7C3] object-cover ring-2 ring-white dark:ring-gray-800"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#FCE8EF] text-[#343746] font-bold text-xs flex items-center justify-center border border-[#F4A7C3]">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-[#343746] dark:text-gray-200 leading-tight group-hover:text-[#3978AE] transition-colors">
                      {userName}
                    </p>
                    <p className="text-[10px] text-gray-400">Tài khoản Google</p>
                  </div>
                </button>

                <button
                  onClick={onLogout}
                  className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors ml-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 border-t border-[#FCE8EF]/70 dark:border-gray-800/80 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FCE8EF] dark:bg-gray-800 text-[#3978AE] dark:text-[#83BDEB] shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#343746] dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-gray-800/60'
                }`}
              >
                {item.iconBadge && (
                  <Sparkles className="w-3.5 h-3.5 text-[#3978AE] dark:text-[#83BDEB]" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
