import React from 'react';
import {
  LayoutDashboard,
  Utensils,
  Dumbbell,
  Sparkles,
  CalendarCheck,
  TrendingUp,
  User,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'food_log', label: 'Ăn uống', icon: Utensils },
    { id: 'workout', label: 'Tập luyện', icon: Dumbbell },
    { id: 'ai_assistant', label: 'Trợ lý AI', icon: Sparkles },
    { id: 'meal_plan', label: 'Kế hoạch', icon: CalendarCheck },
    { id: 'progress', label: 'Tiến trình', icon: TrendingUp },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-[#FCE8EF] dark:border-gray-800 px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'text-[#3978AE] dark:text-[#83BDEB] font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'bg-[#FCE8EF] dark:bg-gray-800' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[50px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
