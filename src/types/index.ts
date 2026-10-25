export type SexForCalculation = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
export type GoalType = 'lose_weight' | 'maintain' | 'gain_weight' | 'endurance' | 'muscle_gain';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type WorkoutIntensity = 'light' | 'moderate' | 'high';
export type WorkoutFeeling = 'great' | 'good' | 'tired' | 'exhausted';

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PrivateProfile {
  birthDate: string; // YYYY-MM-DD
  sexForCalculation: SexForCalculation;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  dietaryPreferences: string[];
  allergies: string[];
  healthRestrictions: string[];
  dailyCalorieTarget: number;
  dailyWaterTargetMl: number;
  bmr: number;
  tdee: number;
  aiConsent: boolean;
  updatedAt: string;
}

export interface FoodLog {
  id?: string;
  foodName: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  source: 'manual' | 'ai' | 'database';
  createdAt: string;
  updatedAt?: string;
}

export interface WaterLog {
  id?: string;
  amountMl: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface WorkoutLog {
  id?: string;
  workoutType: string;
  exerciseName: string;
  durationMinutes: number;
  intensity: WorkoutIntensity;
  estimatedCaloriesBurned: number;
  feelingAfter?: WorkoutFeeling;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface WeightLog {
  id?: string;
  weightKg: number;
  bodyFatPercent?: number;
  waistCm?: number;
  notes?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface Goal {
  id?: string;
  type: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: string;
  met: number; // Metabolic Equivalent of Task
  muscleGroups: string[];
  equipment: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  instructions: string[];
  safetyNotes: string;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: string;
  defaultServing: number;
  unit: string;
  calories: number; // per 100g or per standard unit
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  isPer100g: boolean;
  source: string;
  verified: boolean;
}

export interface PlannedMeal {
  mealType: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  ingredients: string[];
  instructions?: string;
}

export interface DailyMealPlan {
  id?: string;
  name: string;
  date: string;
  meals: PlannedMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  notes?: string;
  createdAt: string;
}

export interface WorkoutPlan {
  id?: string;
  name: string;
  days: {
    day: string;
    title: string;
    exercises: {
      name: string;
      sets: string;
      reps: string;
      duration: string;
      estimatedCalories: number;
      notes: string;
    }[];
  }[];
  durationMinutes?: number;
  createdAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  calorieTarget: number;
  caloriesBurned: number;
  waterIntakeMl: number;
  waterTargetMl: number;
  workoutMinutes: number;
}
