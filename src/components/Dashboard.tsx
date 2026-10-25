import React from 'react';
import {
  Flame,
  Droplets,
  Dumbbell,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  FoodLog,
  PrivateProfile,
  WaterLog,
  WeightLog,
  WorkoutLog,
} from '../types';
import { calculateMacroTargets } from '../utils/nutritionCalculations';
import { NavTab } from './Navbar';

interface DashboardProps {
  displayName: string;
  selectedDate: string;
  profile: PrivateProfile | null;
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  waterTotalMl: number;
  workoutLogs: WorkoutLog[];
  workoutMinutes: number;
  workoutCaloriesBurned: number;
  recentWeightLogs: WeightLog[];
  onTabChange: (tab: NavTab) => void;
  onAddWaterQuick: (amountMl: number) => Promise<void>;
  onOpenQuickFoodModal: () => void;
  onOpenQuickWorkoutModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  displayName,
  selectedDate,
  profile,
  foodLogs,
  waterLogs,
  waterTotalMl,
  workoutLogs,
  workoutMinutes,
  workoutCaloriesBurned,
  recentWeightLogs,
  onTabChange,
  onAddWaterQuick,
  onOpenQuickFoodModal,
  onOpenQuickWorkoutModal,
}) => {
  // Aggregate nutrition from real food logs
  const caloriesConsumed = foodLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
  const proteinConsumed = foodLogs.reduce((sum, item) => sum + (item.protein || 0), 0);
  const carbsConsumed = foodLogs.reduce((sum, item) => sum + (item.carbs || 0), 0);
  const fatConsumed = foodLogs.reduce((sum, item) => sum + (item.fat || 0), 0);
  const fiberConsumed = foodLogs.reduce((sum, item) => sum + (item.fiber || 0), 0);

  // Targets
  const calorieTarget = profile?.dailyCalorieTarget || 2000;
  const waterTarget = profile?.dailyWaterTargetMl || 2000;
  const macroTargets = calculateMacroTargets(calorieTarget, profile?.goalType || 'maintain');

  // Remaining calories (Calories left = Target - Consumed + Burned)
  const caloriesRemaining = calorieTarget - caloriesConsumed + workoutCaloriesBurned;

  // Percentage for progress ring (max 100%)
  const caloriePercent = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100));
  const waterPercent = Math.min(100, Math.round((waterTotalMl / waterTarget) * 100));

  // Current weight comparison
  const latestWeight = recentWeightLogs[0]?.weightKg || profile?.currentWeightKg;
  const targetWeight = profile?.targetWeightKg;
  const weightDiff = targetWeight && latestWeight ? Math.round((targetWeight - latestWeight) * 10) / 10 : null;

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-white via-[#FFF8EF] to-[#FCE8EF] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 sm:p-8 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3978AE] dark:text-[#83BDEB] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#F4A7C3]" />
            <span>{isToday ? 'Hôm nay của bạn' : `Ngày ${selectedDate}`}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#343746] dark:text-white tracking-tight">
            Xin chào, {displayName || 'Bạn'}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
            {caloriesConsumed === 0
              ? 'Chưa có bản ghi nào hôm nay. Hãy bắt đầu ghi nhận bữa sáng hoặc ly nước đầu ngày!'
              : caloriesRemaining > 0
              ? `Bạn còn ${caloriesRemaining} kcal để đạt mục tiêu dinh dưỡng hôm nay.`
              : 'Bạn đã đạt trọn vẹn mục tiêu năng lượng hôm nay! Hãy giữ vững phong độ.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          <button
            onClick={onOpenQuickFoodModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#FCE8EF] hover:bg-[#F4A7C3]/30 text-[#3978AE] dark:text-[#83BDEB] dark:bg-gray-800 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Món ăn</span>
          </button>

          <button
            onClick={() => onAddWaterQuick(250)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-sky-500" />
            <span>+250ml Nước</span>
          </button>

          <button
            onClick={onOpenQuickWorkoutModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-500" />
            <span>Bài tập</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Energy & Calorie Ring Gauge */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#FCE8EF] dark:bg-gray-800 text-rose-500">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#343746] dark:text-white">
                  Năng lượng & Calo
                </h3>
                <span className="text-xs text-gray-400">
                  Mục tiêu đề xuất: {calorieTarget} kcal
                </span>
              </div>
            </div>

            <button
              onClick={() => onTabChange('food_log')}
              className="text-xs font-bold text-[#3978AE] hover:underline flex items-center gap-1"
            >
              Chi tiết nhật ký <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center my-2">
            {/* SVG Ring Progress */}
            <div className="flex flex-col items-center justify-center relative">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#FFF8EF"
                  strokeWidth="8"
                  className="dark:stroke-gray-800"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#calorie-gradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * caloriePercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="calorie-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F4A7C3" />
                    <stop offset="100%" stopColor="#83BDEB" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-[#343746] dark:text-white">
                  {caloriesConsumed}
                </span>
                <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                  Đã nạp (kcal)
                </span>
              </div>
            </div>

            {/* Calorie Stats Breakdown */}
            <div className="sm:col-span-2 space-y-3">
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800/80 border border-[#FCE8EF] dark:border-gray-700">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Mục tiêu</span>
                  <p className="text-base font-extrabold text-[#343746] dark:text-white mt-0.5">
                    {calorieTarget}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800/80 border border-[#FCE8EF] dark:border-gray-700">
                  <span className="text-[10px] text-gray-500 uppercase font-bold">Vận động</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    +{workoutCaloriesBurned}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800/80 border border-[#F4A7C3]/40">
                  <span className="text-[10px] text-[#3978AE] uppercase font-bold">Còn lại</span>
                  <p className={`text-base font-extrabold mt-0.5 ${caloriesRemaining < 0 ? 'text-rose-500' : 'text-[#3978AE]'}`}>
                    {caloriesRemaining}
                  </p>
                </div>
              </div>

              {/* Macro Bars */}
              <div className="space-y-2 pt-2">
                {/* Carbs */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Carbohydrate</span>
                    <span className="font-bold text-[#343746] dark:text-white">
                      {Math.round(carbsConsumed)}g <span className="font-normal text-gray-400">/ {macroTargets.carbsGrams}g</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (carbsConsumed / macroTargets.carbsGrams) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Protein */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Chất đạm (Protein)</span>
                    <span className="font-bold text-[#343746] dark:text-white">
                      {Math.round(proteinConsumed)}g <span className="font-normal text-gray-400">/ {macroTargets.proteinGrams}g</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (proteinConsumed / macroTargets.proteinGrams) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-600 dark:text-gray-300">Chất béo (Fat)</span>
                    <span className="font-bold text-[#343746] dark:text-white">
                      {Math.round(fatConsumed)}g <span className="font-normal text-gray-400">/ {macroTargets.fatGrams}g</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (fatConsumed / macroTargets.fatGrams) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Hydration (Water Tracker) */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#3978AE]">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#343746] dark:text-white">
                    Nước uống
                  </h3>
                  <span className="text-xs text-gray-400">
                    Mục tiêu: {waterTarget} ml
                  </span>
                </div>
              </div>

              <span className="text-xs font-extrabold text-[#3978AE]">
                {waterPercent}%
              </span>
            </div>

            {/* Visual Glass / Cup representation */}
            <div className="my-4 p-4 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 flex items-center justify-between border border-[#FCE8EF] dark:border-gray-700">
              <div>
                <span className="text-3xl font-black text-sky-600">
                  {waterTotalMl}
                </span>
                <span className="text-xs text-gray-400 font-semibold ml-1">/ {waterTarget} ml</span>
                <p className="text-[11px] text-gray-500 mt-1">
                  Đã ghi nhận {waterLogs.length} lần uống nước
                </p>
              </div>

              <div className="w-12 h-16 rounded-xl border-2 border-sky-400/60 p-1 flex items-end justify-center bg-white dark:bg-gray-900">
                <div
                  className="w-full bg-gradient-to-t from-sky-400 to-[#83BDEB] rounded-lg transition-all duration-500"
                  style={{ height: `${Math.min(100, waterPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Water Logging Buttons */}
          <div>
            <span className="block text-[11px] font-bold text-gray-500 uppercase mb-2">
              Thêm nhanh lượng nước:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[100, 200, 250, 500].map((ml) => (
                <button
                  key={ml}
                  onClick={() => onAddWaterQuick(ml)}
                  className="py-2 px-1 text-center bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 text-sky-700 dark:text-sky-300 rounded-xl text-xs font-bold transition-colors border border-sky-200/50"
                >
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Workout Summary, Recent Meals & Weight Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Activity Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#343746] dark:text-white">
                    Tập luyện hôm nay
                  </h3>
                  <span className="text-xs text-gray-400">
                    {workoutMinutes} phút · {workoutCaloriesBurned} kcal
                  </span>
                </div>
              </div>

              <button
                onClick={() => onTabChange('workout')}
                className="text-xs font-bold text-[#3978AE] hover:underline"
              >
                Xem tất cả
              </button>
            </div>

            {/* List of today's workouts */}
            {workoutLogs.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-dashed border-[#F4A7C3]/50 my-2">
                <Dumbbell className="w-8 h-8 mx-auto text-gray-400 mb-2 opacity-50" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Chưa có bài tập nào hôm nay
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Vận động 15-30 phút giúp kích hoạt trao đổi chất và tăng BMR.
                </p>
                <button
                  onClick={onOpenQuickWorkoutModal}
                  className="mt-3 px-3.5 py-1.5 bg-[#3978AE] text-white text-xs font-bold rounded-xl hover:bg-[#3978AE]/90"
                >
                  Ghi nhận bài tập
                </button>
              </div>
            ) : (
              <div className="space-y-2 my-2">
                {workoutLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800/80 border border-[#FCE8EF] dark:border-gray-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#343746] dark:text-white">
                        {log.exerciseName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {log.durationMinutes} phút
                        </span>
                        <span>·</span>
                        <span>Đốt ~{log.estimatedCaloriesBurned} kcal</span>
                      </div>
                    </div>
                    {log.feelingAfter && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                        {log.feelingAfter}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onTabChange('workout')}
            className="mt-4 w-full py-2.5 text-center bg-gray-50 dark:bg-gray-800 hover:bg-[#FCE8EF]/40 text-[#3978AE] rounded-xl text-xs font-bold transition-colors"
          >
            Mở Thư viện bài tập & Lịch tập tuần
          </button>
        </div>

        {/* Recent Meals Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#343746] dark:text-white">
                Bữa ăn gần nhất
              </h3>
              <button
                onClick={() => onTabChange('food_log')}
                className="text-xs font-bold text-[#3978AE] hover:underline"
              >
                Nhật ký ăn
              </button>
            </div>

            {foodLogs.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-dashed border-[#F4A7C3]/50 my-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Chưa ghi nhận món ăn nào
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Theo dõi đều đặn giúp bạn kiểm soát calo thâm hụt hiệu quả.
                </p>
                <button
                  onClick={onOpenQuickFoodModal}
                  className="mt-3 px-3.5 py-1.5 bg-[#F4A7C3] text-[#343746] text-xs font-bold rounded-xl hover:bg-[#F4A7C3]/90"
                >
                  Thêm món ngay
                </button>
              </div>
            ) : (
              <div className="space-y-2 my-2">
                {foodLogs.slice(0, 4).map((log) => {
                  const mealLabels: Record<string, string> = {
                    breakfast: 'Sáng',
                    lunch: 'Trưa',
                    dinner: 'Tối',
                    snack: 'Phụ',
                  };
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800/80 border border-[#FCE8EF] dark:border-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#3978AE] uppercase">
                            {mealLabels[log.mealType] || log.mealType}
                          </span>
                          <span className="text-xs font-bold text-[#343746] dark:text-white">
                            {log.foodName}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {log.quantity} {log.unit}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-[#343746] dark:text-white">
                        {log.calories} kcal
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={onOpenQuickFoodModal}
            className="mt-4 w-full py-2.5 text-center bg-gray-50 dark:bg-gray-800 hover:bg-[#FCE8EF]/40 text-[#3978AE] rounded-xl text-xs font-bold transition-colors"
          >
            + Thêm món ăn vào nhật ký
          </button>
        </div>

        {/* Weight & Goal Progress Card */}
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#343746] dark:text-white">
                    Tiến trình cân nặng
                  </h3>
                  <span className="text-xs text-gray-400">
                    Mục tiêu: {targetWeight} kg
                  </span>
                </div>
              </div>

              <button
                onClick={() => onTabChange('progress')}
                className="text-xs font-bold text-[#3978AE] hover:underline"
              >
                Chi tiết
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#FCE8EF] dark:border-gray-700 my-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Cân nặng hiện tại</span>
                  <p className="text-2xl font-black text-[#343746] dark:text-white mt-0.5">
                    {latestWeight} <span className="text-xs font-normal text-gray-400">kg</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Mục tiêu</span>
                  <p className="text-2xl font-black text-[#3978AE] mt-0.5">
                    {targetWeight} <span className="text-xs font-normal text-gray-400">kg</span>
                  </p>
                </div>
              </div>

              {weightDiff !== null && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Chênh lệch còn lại:</span>
                  <span className={`font-bold ${weightDiff === 0 ? 'text-emerald-500' : 'text-[#3978AE]'}`}>
                    {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onTabChange('progress')}
            className="mt-4 w-full py-2.5 text-center bg-gray-50 dark:bg-gray-800 hover:bg-[#FCE8EF]/40 text-[#3978AE] rounded-xl text-xs font-bold transition-colors"
          >
            Ghi nhận cân nặng mới & Xem biểu đồ
          </button>
        </div>
      </div>
    </div>
  );
};
