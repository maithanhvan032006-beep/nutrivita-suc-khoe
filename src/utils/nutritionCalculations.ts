import { ActivityLevel, GoalType, SexForCalculation } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { factor: number; label: string; description: string }> = {
  sedentary: { factor: 1.2, label: 'Ít vận động', description: 'Công việc văn phòng, ít hoặc không tập thể dục' },
  light: { factor: 1.375, label: 'Vận động nhẹ', description: 'Tập thể dục nhẹ nhàng 1 - 3 buổi/tuần' },
  moderate: { factor: 1.55, label: 'Vận động vừa', description: 'Tập luyện cường độ trung bình 3 - 5 buổi/tuần' },
  heavy: { factor: 1.725, label: 'Vận động nhiều', description: 'Tập luyện chăm chỉ 6 - 7 buổi/tuần' },
  very_heavy: { factor: 1.9, label: 'Rất nhiều', description: 'Vận động viên, lao động nặng hoặc tập 2 lần/ngày' },
};

export const GOAL_LABELS: Record<GoalType, { label: string; description: string; calorieOffset: number }> = {
  lose_weight: { label: 'Giảm cân lành mạnh', description: 'Thâm hụt calo an toàn (~0.4 - 0.7kg/tuần)', calorieOffset: -450 },
  maintain: { label: 'Duy trì cân nặng', description: 'Cân bằng năng lượng nạp và tiêu thụ', calorieOffset: 0 },
  gain_weight: { label: 'Tăng cân an toàn', description: 'Thặng dư calo tích cực từ dinh dưỡng lành mạnh', calorieOffset: 350 },
  muscle_gain: { label: 'Tăng cơ săn chắc', description: 'Tối ưu lượng protein và năng lượng cho cơ bắp', calorieOffset: 250 },
  endurance: { label: 'Cải thiện sức bền', description: 'Bổ sung carbohydrate phức hợp cho hoạt động bền bỉ', calorieOffset: 150 },
};

export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 25;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return 25;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(12, Math.min(100, age));
}

/**
 * Mifflin–St Jeor Equation
 * Nam: BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age + 5
 * Nữ: BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age - 161
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: SexForCalculation
): number {
  if (!weightKg || !heightCm) return 1400;

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;

  if (sex === 'male') {
    return Math.round(base + 5);
  } else if (sex === 'female') {
    return Math.round(base - 161);
  } else {
    // Other / not specified: mean between male and female
    return Math.round(base - 78);
  }
}

/**
 * Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]?.factor || 1.375;
  return Math.round(bmr * multiplier);
}

/**
 * Calorie target based on goal and safety floors
 */
export function calculateDailyCalorieTarget(
  tdee: number,
  goalType: GoalType,
  sex: SexForCalculation
): { target: number; minSafe: number; maxSafe: number } {
  const offset = GOAL_LABELS[goalType]?.calorieOffset || 0;
  const calculated = tdee + offset;

  // Safe floors: Females >= 1200 kcal, Males >= 1500 kcal
  const minFloor = sex === 'male' ? 1500 : 1200;
  const target = Math.max(minFloor, Math.round(calculated));

  return {
    target,
    minSafe: Math.round(target * 0.9),
    maxSafe: Math.round(target * 1.1),
  };
}

/**
 * Recommended daily water intake (ml) based on body weight
 * Formula: weight (kg) * 35ml, rounded to nearest 50ml
 */
export function calculateDailyWaterTarget(weightKg: number): number {
  if (!weightKg || weightKg <= 0) return 2000;
  const raw = weightKg * 35;
  return Math.max(1500, Math.round(raw / 50) * 50);
}

/**
 * Body Mass Index (BMI)
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: string;
  colorClass: string;
} {
  if (!weightKg || !heightCm) return { bmi: 0, category: 'Chưa có dữ liệu', colorClass: 'text-gray-500' };
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  // Asian-Pacific BMI criteria
  if (bmi < 18.5) {
    return { bmi, category: 'Thiếu cân', colorClass: 'text-sky-500' };
  } else if (bmi < 23) {
    return { bmi, category: 'Cân đối lý tưởng', colorClass: 'text-emerald-500' };
  } else if (bmi < 25) {
    return { bmi, category: 'Thừa cân nhẹ', colorClass: 'text-amber-500' };
  } else {
    return { bmi, category: 'Nguy cơ béo phì', colorClass: 'text-rose-500' };
  }
}

/**
 * Macro nutrient distribution in grams based on calorie target & goal
 */
export function calculateMacroTargets(calories: number, goalType: GoalType): {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
} {
  let proteinRatio = 0.25;
  let carbRatio = 0.50;
  let fatRatio = 0.25;

  if (goalType === 'lose_weight') {
    proteinRatio = 0.30;
    carbRatio = 0.40;
    fatRatio = 0.30;
  } else if (goalType === 'muscle_gain') {
    proteinRatio = 0.30;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (goalType === 'gain_weight' || goalType === 'endurance') {
    proteinRatio = 0.20;
    carbRatio = 0.55;
    fatRatio = 0.25;
  }

  return {
    proteinGrams: Math.round((calories * proteinRatio) / 4),
    carbsGrams: Math.round((calories * carbRatio) / 4),
    fatGrams: Math.round((calories * fatRatio) / 9),
    fiberGrams: Math.max(25, Math.round((calories / 1000) * 14)),
  };
}

/**
 * Estimate weeks to reach target weight safely
 * 1kg body fat ~ 7700 kcal
 */
export function estimateWeeksToGoal(
  currentWeightKg: number,
  targetWeightKg: number,
  calorieTarget: number,
  tdee: number
): { weeks: number; diffKg: number; isSafe: boolean } {
  const diffKg = Math.round((targetWeightKg - currentWeightKg) * 10) / 10;
  const dailyDeficitOrSurplus = tdee - calorieTarget;

  if (Math.abs(diffKg) < 0.2 || dailyDeficitOrSurplus === 0) {
    return { weeks: 0, diffKg, isSafe: true };
  }

  const totalKcal = Math.abs(diffKg) * 7700;
  const days = totalKcal / Math.abs(dailyDeficitOrSurplus);
  const weeks = Math.max(1, Math.round(days / 7));

  // Safe rate: between 0.3kg and 1.0kg per week
  const weeklyRate = Math.abs(diffKg) / weeks;
  const isSafe = weeklyRate <= 1.0;

  return { weeks, diffKg, isSafe };
}
