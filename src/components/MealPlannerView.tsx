import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  CalendarCheck,
  Flame,
  ChefHat,
  BookmarkCheck,
} from 'lucide-react';
import { DailyMealPlan, PrivateProfile } from '../types';
import { requestAIMealPlan } from '../services/aiService';

interface MealPlannerViewProps {
  userId: string;
  profile: PrivateProfile | null;
  savedMealPlans: DailyMealPlan[];
  onSavePlan: (plan: Omit<DailyMealPlan, 'id'>) => Promise<void>;
  onDeletePlan: (planId: string) => Promise<void>;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  userId,
  profile,
  savedMealPlans,
  onSavePlan,
  onDeletePlan,
}) => {
  const [calorieTarget, setCalorieTarget] = useState<number>(profile?.dailyCalorieTarget || 1800);
  const [goalType, setGoalType] = useState<string>(profile?.goalType || 'lose_weight');
  const [customNotes, setCustomNotes] = useState<string>('Thực đơn cơm gia đình Việt Nam thanh đạm, giàu rau xanh');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<DailyMealPlan | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleGenerateAIPlan = async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const result = await requestAIMealPlan({
        calorieTarget,
        goalType,
        allergies: profile?.allergies || [],
        dietaryPreferences: profile?.dietaryPreferences || [],
        notes: customNotes,
      });

      setGeneratedPlan({
        name: result.name || `Thực đơn ${calorieTarget} kcal món Việt`,
        date: new Date().toISOString().split('T')[0],
        meals: result.meals || [],
        totalCalories: result.totalCalories || calorieTarget,
        totalProtein: result.totalProtein || 0,
        totalCarbs: result.totalCarbs || 0,
        totalFat: result.totalFat || 0,
        notes: customNotes,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err?.message || 'Không thể tạo thực đơn lúc này. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToPlans = async () => {
    if (!generatedPlan) return;
    try {
      const { id, ...rest } = generatedPlan;
      await onSavePlan(rest);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu thực đơn.');
    }
  };

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Bữa sáng',
    lunch: 'Bữa trưa',
    dinner: 'Bữa tối',
    snack: 'Bữa phụ',
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-left">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#3978AE] uppercase tracking-wider mb-1">
            <ChefHat className="w-4 h-4 text-[#F4A7C3]" />
            <span>Kế hoạch ăn uống thông minh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#343746] dark:text-white">
            Lập thực đơn món Việt bằng AI
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Hệ thống tự động thiết kế thực đơn phù hợp chuẩn lượng calo, loại trừ dị ứng và cân đối các nhóm đa lượng.
          </p>
        </div>

        <button
          onClick={handleGenerateAIPlan}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F4A7C3] to-[#83BDEB] hover:opacity-95 text-[#343746] text-xs sm:text-sm font-extrabold rounded-2xl shadow-sm transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#3978AE]" />
              <span>Nutrivita AI đang soạn thực đơn...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#3978AE]" />
              <span>Tạo thực đơn 1 ngày mới</span>
            </>
          )}
        </button>
      </div>

      {/* Generator Configuration Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm sm:text-base text-[#343746] dark:text-white">
          Tùy chỉnh thông số thực đơn
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mức Calo mục tiêu (kcal)
            </label>
            <input
              type="number"
              min="1000"
              max="4500"
              step="50"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mục tiêu
            </label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
            >
              <option value="lose_weight">Giảm cân lành mạnh</option>
              <option value="maintain">Duy trì cân nặng</option>
              <option value="gain_weight">Tăng cân an toàn</option>
              <option value="muscle_gain">Tăng cơ săn chắc</option>
              <option value="endurance">Cải thiện sức bền</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Yêu cầu ẩm thực / Ghi chú
            </label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="Vd: Ưu tiên món canh cá, ít dầu, không chiên rán..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
            />
          </div>
        </div>

        {profile?.allergies && profile.allergies.length > 0 && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>
              Tự động loại bỏ dị ứng từ hồ sơ: <b>{profile.allergies.join(', ')}</b>
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs sm:text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Generated AI Meal Plan Preview */}
      {generatedPlan && (
        <div className="bg-white dark:bg-gray-900 p-6 sm:p-7 rounded-3xl border border-purple-200 dark:border-purple-900/50 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
                  Gợi ý AI cho bạn
                </span>
                <span className="text-xs text-gray-400">· Ước tính dinh dưỡng</span>
              </div>
              <h3 className="text-lg font-extrabold text-[#343746] dark:text-white mt-1">
                {generatedPlan.name}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#FFF8EF] dark:bg-gray-800 px-3.5 py-2 rounded-xl text-xs border border-[#FCE8EF] dark:border-gray-700">
                <span className="text-gray-400">Tổng calo: </span>
                <span className="font-extrabold text-[#343746] dark:text-white">
                  {generatedPlan.totalCalories} kcal
                </span>
              </div>

              <button
                onClick={handleSaveToPlans}
                disabled={saveSuccess}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:bg-emerald-500"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đã lưu vào Kế hoạch!</span>
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Lưu vào Kế hoạch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meals of the Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedPlan.meals.map((meal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/40 border border-[#FCE8EF] dark:border-gray-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold text-[#3978AE] uppercase tracking-wider bg-white dark:bg-gray-900 px-2 py-0.5 rounded-md border border-[#F4A7C3]/30">
                      {mealTypeLabels[meal.mealType] || meal.mealType}
                    </span>
                    <span className="text-xs font-extrabold text-[#343746] dark:text-white">
                      {meal.calories} kcal
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-[#343746] dark:text-white mt-1">
                    {meal.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Khẩu phần: {meal.portion}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2 font-medium">
                    <span>Đạm: {meal.protein}g</span>
                    <span>·</span>
                    <span>Carb: {meal.carbs}g</span>
                    <span>·</span>
                    <span>Béo: {meal.fat}g</span>
                  </div>

                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#FCE8EF]/70 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300">
                      <span className="font-semibold text-gray-500">Nguyên liệu: </span>
                      {meal.ingredients.join(', ')}
                    </div>
                  )}

                  {meal.instructions && (
                    <p className="mt-1.5 text-[11px] text-gray-500 italic">
                      💡 {meal.instructions}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Meal Plans List */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-[#FCE8EF] dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#343746] dark:text-white">
          Thực đơn đã lưu của bạn ({savedMealPlans.length})
        </h3>

        {savedMealPlans.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            Bạn chưa lưu thực đơn nào. Hãy nhấn "Tạo thực đơn 1 ngày mới" bằng AI để khám phá!
          </div>
        ) : (
          <div className="space-y-3">
            {savedMealPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-[#FFF8EF]/50 dark:bg-gray-800/40 border border-[#FCE8EF] dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#343746] dark:text-white">
                    {plan.name}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                    <span>{plan.meals.length} bữa ăn</span>
                    <span>·</span>
                    <span>Tổng calo: {plan.totalCalories} kcal</span>
                    <span>·</span>
                    <span>Lưu ngày: {plan.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => plan.id && onDeletePlan(plan.id)}
                  className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-colors self-end sm:self-auto"
                  title="Xóa thực đơn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
