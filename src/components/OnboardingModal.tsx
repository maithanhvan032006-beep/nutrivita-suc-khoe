import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Heart,
  Activity,
  Target,
  User,
  ShieldAlert,
} from 'lucide-react';
import {
  ActivityLevel,
  GoalType,
  PrivateProfile,
  SexForCalculation,
} from '../types';
import {
  calculateAge,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalorieTarget,
  calculateDailyWaterTarget,
  calculateBMI,
  ACTIVITY_MULTIPLIERS,
  GOAL_LABELS,
  estimateWeeksToGoal,
} from '../utils/nutritionCalculations';

interface OnboardingModalProps {
  userId: string;
  userDisplayName?: string;
  onComplete: (profile: PrivateProfile) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  userId,
  userDisplayName,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Personal info
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');
  const [sex, setSex] = useState<SexForCalculation>('female');
  const [heightCm, setHeightCm] = useState<number>(160);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(55);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(50);

  // Step 2: Goal
  const [goalType, setGoalType] = useState<GoalType>('lose_weight');

  // Step 3: Activity Level
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('light');

  // Step 4: Habits & restrictions
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>(['Cơm gia đình Việt Nam']);
  const [customDiet, setCustomDiet] = useState<string>('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState<string>('');
  const [healthRestrictions, setHealthRestrictions] = useState<string[]>([]);
  const [customRestriction, setCustomRestriction] = useState<string>('');
  const [aiConsent, setAiConsent] = useState<boolean>(true);

  // Calculations for Step 5
  const age = calculateAge(birthDate);
  const bmr = calculateBMR(currentWeightKg, heightCm, age, sex);
  const tdee = calculateTDEE(bmr, activityLevel);
  const caloriePlan = calculateDailyCalorieTarget(tdee, goalType, sex);
  const waterTarget = calculateDailyWaterTarget(currentWeightKg);
  const bmiInfo = calculateBMI(currentWeightKg, heightCm);
  const goalEstimation = estimateWeeksToGoal(
    currentWeightKg,
    targetWeightKg,
    caloriePlan.target,
    tdee
  );

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (heightCm < 80 || heightCm > 250) {
        setError('Chiều cao phải từ 80cm đến 250cm.');
        return;
      }
      if (currentWeightKg < 25 || currentWeightKg > 300) {
        setError('Cân nặng hiện tại phải từ 25kg đến 300kg.');
        return;
      }
      if (targetWeightKg < 25 || targetWeightKg > 300) {
        setError('Cân nặng mục tiêu phải từ 25kg đến 300kg.');
        return;
      }
    }
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const profileData: PrivateProfile = {
        birthDate,
        sexForCalculation: sex,
        heightCm,
        currentWeightKg,
        targetWeightKg,
        activityLevel,
        goalType,
        dietaryPreferences,
        allergies,
        healthRestrictions,
        dailyCalorieTarget: caloriePlan.target,
        dailyWaterTargetMl: waterTarget,
        bmr,
        tdee,
        aiConsent,
        updatedAt: new Date().toISOString(),
      };

      await onComplete(profileData);
    } catch (err: any) {
      setError(err?.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  const addTag = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = item.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setInput('');
    }
  };

  const removeTag = (
    itemToRemove: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((x) => x !== itemToRemove));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-[#FCE8EF] dark:border-gray-800 p-6 sm:p-8 my-8 text-left transition-all">
        {/* Progress Bar & Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-[#3978AE] uppercase tracking-wider mb-2">
            <span>Thiết lập hồ sơ sức khỏe</span>
            <span>Bước {step} / 5</span>
          </div>

          <div className="w-full bg-[#FFF8EF] dark:bg-gray-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#F4A7C3] to-[#83BDEB] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs sm:text-sm text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#343746] dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#F4A7C3]" />
                Chào mừng {userDisplayName || 'bạn'}! Hãy cho Nutrivita biết về bạn
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Các chỉ số này phục vụ công thức Mifflin–St Jeor để tính chính xác nhu cầu năng lượng của bạn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FFF8EF]/50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Giới tính sinh học (cho công thức BMR)
                </label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as SexForCalculation)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FFF8EF]/50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                >
                  <option value="female">Nữ (Công thức BMR Nữ)</option>
                  <option value="male">Nam (Công thức BMR Nam)</option>
                  <option value="other">Khác / Không công khai (Tính trung bình)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  min="80"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FFF8EF]/50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cân nặng hiện tại (kg)
                </label>
                <input
                  type="number"
                  min="25"
                  max="300"
                  step="0.5"
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FFF8EF]/50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cân nặng mục tiêu (kg)
                </label>
                <input
                  type="number"
                  min="25"
                  max="300"
                  step="0.5"
                  value={targetWeightKg}
                  onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-[#FFF8EF]/50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4A7C3]"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Chênh lệch: {Math.round((targetWeightKg - currentWeightKg) * 10) / 10} kg so với hiện tại.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#343746] dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#3978AE]" />
                Mục tiêu chính của bạn là gì?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Nutrivita sẽ điều chỉnh thâm hụt hoặc thặng dư calo an toàn theo mục tiêu này.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(Object.keys(GOAL_LABELS) as GoalType[]).map((key) => {
                const item = GOAL_LABELS[key];
                const isSelected = goalType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setGoalType(key)}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
                      isSelected
                        ? 'border-[#3978AE] bg-[#FCE8EF]/40 dark:bg-gray-800 ring-2 ring-[#3978AE]/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#F4A7C3]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#343746] dark:text-white">
                        {item.label}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#3978AE] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Activity Level */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-[#343746] dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#F4A7C3]" />
                Mức độ vận động hằng ngày của bạn?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Hệ số vận động nhân với BMR để ra chỉ số TDEE (tổng calo đốt mỗi ngày).
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((key) => {
                const item = ACTIVITY_MULTIPLIERS[key];
                const isSelected = activityLevel === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActivityLevel(key)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#F4A7C3] bg-[#FCE8EF]/40 dark:bg-gray-800 ring-2 ring-[#F4A7C3]/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#F4A7C3]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#343746] dark:text-white">
                        {item.label} (Hệ số x{item.factor})
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-[#F4A7C3] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Habits & Restrictions */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#343746] dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Thói quen, Dị ứng & Hạn chế sức khỏe
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Các thông tin này giúp Nutrivita AI lọc món ăn nguy hiểm và gợi ý thực đơn an toàn.
              </p>
            </div>

            {/* Dietary preferences */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Sở thích & chế độ ăn (Ăn chay, Eat clean, Low carb, v.v.)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Thêm chế độ (vd: Ít tinh bột, Eat clean...)"
                  value={customDiet}
                  onChange={(e) => setCustomDiet(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(customDiet, dietaryPreferences, setDietaryPreferences, setCustomDiet)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={() => addTag(customDiet, dietaryPreferences, setDietaryPreferences, setCustomDiet)}
                  className="px-3.5 py-2 bg-[#FCE8EF] text-[#3978AE] rounded-xl text-xs font-bold hover:bg-[#F4A7C3]/40"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dietaryPreferences.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => removeTag(tag, dietaryPreferences, setDietaryPreferences)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-lg cursor-pointer hover:line-through"
                  >
                    {tag} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Dị ứng thực phẩm (Hải sản, Đậu phộng, Trứng, Sữa bò...)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Thêm dị ứng (vd: Dị ứng tôm, cua...)"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(customAllergy, allergies, setAllergies, setCustomAllergy)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={() => addTag(customAllergy, allergies, setAllergies, setCustomAllergy)}
                  className="px-3.5 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergies.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">Không có dị ứng nào</span>
                ) : (
                  allergies.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => removeTag(tag, allergies, setAllergies)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-lg cursor-pointer hover:line-through border border-rose-200"
                    >
                      {tag} ✕
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Health Restrictions */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Lưu ý sức khỏe đặc biệt (Đau khớp gối, Đau lưng, Huyết áp...)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Thêm lưu ý sức khỏe..."
                  value={customRestriction}
                  onChange={(e) => setCustomRestriction(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(customRestriction, healthRestrictions, setHealthRestrictions, setCustomRestriction)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs bg-[#FFF8EF]/50 dark:bg-gray-800"
                />
                <button
                  type="button"
                  onClick={() => addTag(customRestriction, healthRestrictions, setHealthRestrictions, setCustomRestriction)}
                  className="px-3.5 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold hover:bg-amber-100"
                >
                  Thêm
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {healthRestrictions.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">Không có hạn chế đặc biệt</span>
                ) : (
                  healthRestrictions.map((tag) => (
                    <span
                      key={tag}
                      onClick={() => removeTag(tag, healthRestrictions, setHealthRestrictions)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs rounded-lg cursor-pointer hover:line-through border border-amber-200"
                    >
                      {tag} ✕
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* AI Consent checkbox */}
            <div className="p-3.5 bg-[#FFF8EF] dark:bg-gray-800/80 rounded-2xl border border-[#F4A7C3]/40 flex items-start gap-3">
              <input
                id="ai-consent"
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#3978AE] focus:ring-[#3978AE]"
              />
              <label htmlFor="ai-consent" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed">
                <span className="font-bold">Cho phép Trợ lý AI Nutrivita cá nhân hóa:</span> Đồng ý gửi dữ liệu mục tiêu và sở thích ăn uống để AI gợi ý thực đơn chính xác (bạn có thể tắt trong Cài đặt bất kỳ lúc nào).
              </label>
            </div>
          </div>
        )}

        {/* STEP 5: Preview & Confirmation */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#343746] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#3978AE]" />
                Kết quả tính toán sơ bộ cho bạn
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Xem lại các chỉ số khoa học trước khi hoàn tất lưu vào cơ sở dữ liệu riêng của bạn.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#FCE8EF] dark:border-gray-700">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Chỉ số BMR</span>
                <p className="text-xl font-extrabold text-[#343746] dark:text-white mt-1">
                  {bmr} <span className="text-xs font-normal text-gray-500">kcal</span>
                </p>
                <span className="text-[10px] text-gray-400">Năng lượng tĩnh</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#FCE8EF] dark:border-gray-700">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Chỉ số TDEE</span>
                <p className="text-xl font-extrabold text-[#3978AE] mt-1">
                  {tdee} <span className="text-xs font-normal text-gray-500">kcal</span>
                </p>
                <span className="text-[10px] text-gray-400">Tiêu hao/ngày</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FCE8EF] dark:bg-gray-800 border border-[#F4A7C3]/50">
                <span className="text-[10px] font-bold text-[#3978AE] uppercase">Mục tiêu Calo</span>
                <p className="text-xl font-extrabold text-[#343746] dark:text-white mt-1">
                  {caloriePlan.target} <span className="text-xs font-normal text-gray-500">kcal</span>
                </p>
                <span className="text-[10px] text-[#3978AE]">Đề xuất hằng ngày</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF8EF] dark:bg-gray-800 border border-[#FCE8EF] dark:border-gray-700">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Mục tiêu Nước</span>
                <p className="text-xl font-extrabold text-sky-600 mt-1">
                  {waterTarget} <span className="text-xs font-normal text-gray-500">ml</span>
                </p>
                <span className="text-[10px] text-gray-400">~{Math.round(waterTarget / 250)} ly nước</span>
              </div>
            </div>

            {/* BMI & Progression Estimate */}
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">BMI hiện tại:</span>
                <span className={`font-bold ${bmiInfo.colorClass}`}>
                  {bmiInfo.bmi} ({bmiInfo.category})
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Mục tiêu cân nặng:</span>
                <span className="font-bold text-[#343746] dark:text-white">
                  {currentWeightKg} kg ➔ {targetWeightKg} kg ({goalEstimation.diffKg > 0 ? `+${goalEstimation.diffKg}` : goalEstimation.diffKg} kg)
                </span>
              </div>

              {goalEstimation.weeks > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-gray-500">Dự kiến tham khảo:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Khoảng {goalEstimation.weeks} tuần với tốc độ an toàn
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
              <span>
                Các chỉ số trên là ước tính khoa học theo phương pháp Mifflin–St Jeor. Nhu cầu thực tế có thể thay đổi tùy cơ địa. Bạn có thể điều chỉnh mục tiêu calo bất kỳ lúc nào trong Hồ sơ.
              </span>
            </div>
          </div>
        )}

        {/* Buttons Footer */}
        <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[#3978AE] hover:bg-[#3978AE]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              Tiếp tục <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-7 py-2.5 bg-gradient-to-r from-[#F4A7C3] to-[#83BDEB] hover:opacity-95 text-[#343746] text-xs font-extrabold rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {saving ? 'Đang lưu hồ sơ...' : 'Xác nhận & Bắt đầu sử dụng'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
