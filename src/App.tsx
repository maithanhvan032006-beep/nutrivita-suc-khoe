import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  subscribeToAuthChanges,
  loginWithGoogle,
  logoutUser,
} from './services/authService';
import {
  getUserProfile,
  saveUserProfile,
  getPrivateProfile,
  savePrivateProfile,
  deleteUserAccountAndData,
} from './services/userService';
import {
  subscribeFoodLogsByDate,
  addFoodLog,
  updateFoodLog,
  deleteFoodLog,
  copyMealsToAnotherDay,
} from './services/foodService';
import {
  subscribeWaterLogsByDate,
  addWaterLog,
  deleteWaterLog,
} from './services/waterService';
import {
  subscribeWorkoutLogsByDate,
  addWorkoutLog,
  deleteWorkoutLog,
  getWorkoutPlans,
  saveWorkoutPlan,
  deleteWorkoutPlan,
} from './services/workoutService';
import {
  getWeightLogs,
  addWeightLog,
  deleteWeightLog,
  getMealPlans,
  saveMealPlan,
  deleteMealPlan,
  exportAllUserData,
} from './services/progressService';
import {
  DailyMealPlan,
  FoodLog,
  MealType,
  PrivateProfile,
  UserProfile,
  WaterLog,
  WeightLog,
  WorkoutLog,
  WorkoutPlan,
} from './types';
import { LandingPage } from './components/LandingPage';
import { Navbar, NavTab } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { Dashboard } from './components/Dashboard';
import { FoodLogView } from './components/FoodLogView';
import { WorkoutView } from './components/WorkoutView';
import { MealPlannerView } from './components/MealPlannerView';
import { ProgressView } from './components/ProgressView';
import { AIAssistantView } from './components/AIAssistantView';
import { ProfileSettingsView } from './components/ProfileSettingsView';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // User Profile & Onboarding
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // App Navigation & Selected Date
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('nutrivita_theme') === 'dark';
  });

  // Synchronized Firestore Data
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [waterTotalMl, setWaterTotalMl] = useState<number>(0);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [workoutMinutes, setWorkoutMinutes] = useState<number>(0);
  const [workoutCaloriesBurned, setWorkoutCaloriesBurned] = useState<number>(0);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [mealPlans, setMealPlans] = useState<DailyMealPlan[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nutrivita_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nutrivita_theme', 'light');
    }
  }, [isDarkMode]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        setProfileLoading(true);
        try {
          // Fetch user profile from Firestore
          let profile = await getUserProfile(user.uid);
          if (!profile) {
            // First time login: create initial profile doc
            profile = {
              displayName: user.displayName || 'Người dùng mới',
              email: user.email || '',
              photoURL: user.photoURL || undefined,
              profileCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveUserProfile(user.uid, profile);
          }
          setUserProfile(profile);

          // Fetch private health profile
          const priv = await getPrivateProfile(user.uid);
          setPrivateProfile(priv);

          if (!profile.profileCompleted || !priv) {
            setShowOnboarding(true);
          } else {
            setShowOnboarding(false);
          }
        } catch (err: any) {
          console.error('Error loading user profile:', err);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setUserProfile(null);
        setPrivateProfile(null);
        setShowOnboarding(false);
        setFoodLogs([]);
        setWaterLogs([]);
        setWaterTotalMl(0);
        setWorkoutLogs([]);
        setWeightLogs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore real-time collections for the selected date
  useEffect(() => {
    if (!currentUser) return;

    // Food logs subscription
    const unsubFood = subscribeFoodLogsByDate(
      currentUser.uid,
      selectedDate,
      (logs) => setFoodLogs(logs),
      (err) => console.error('Food sync error:', err)
    );

    // Water logs subscription
    const unsubWater = subscribeWaterLogsByDate(
      currentUser.uid,
      selectedDate,
      (logs, total) => {
        setWaterLogs(logs);
        setWaterTotalMl(total);
      },
      (err) => console.error('Water sync error:', err)
    );

    // Workout logs subscription
    const unsubWorkout = subscribeWorkoutLogsByDate(
      currentUser.uid,
      selectedDate,
      (logs, minutes, burned) => {
        setWorkoutLogs(logs);
        setWorkoutMinutes(minutes);
        setWorkoutCaloriesBurned(burned);
      },
      (err) => console.error('Workout sync error:', err)
    );

    // Fetch Weight logs, Meal Plans, Workout Plans
    getWeightLogs(currentUser.uid).then((logs) => setWeightLogs(logs || []));
    getMealPlans(currentUser.uid).then((plans) => setMealPlans(plans || []));
    getWorkoutPlans(currentUser.uid).then((plans) => setWorkoutPlans(plans || []));

    return () => {
      unsubFood();
      unsubWater();
      unsubWorkout();
    };
  }, [currentUser, selectedDate]);

  // Auth actions
  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Đăng nhập không thành công.');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentTab('dashboard');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Onboarding completion
  const handleCompleteOnboarding = async (newProfile: PrivateProfile) => {
    if (!currentUser) return;
    await savePrivateProfile(currentUser.uid, newProfile);
    setPrivateProfile(newProfile);
    if (userProfile) {
      setUserProfile({ ...userProfile, profileCompleted: true });
    }
    setShowOnboarding(false);
  };

  // Quick Action Handlers
  const handleAddWaterQuick = async (amountMl: number) => {
    if (!currentUser) return;
    await addWaterLog(currentUser.uid, amountMl, selectedDate);
  };

  const handleAddFoodLog = async (food: Omit<FoodLog, 'id'>) => {
    if (!currentUser) return;
    await addFoodLog(currentUser.uid, food);
  };

  const handleUpdateFoodLog = async (logId: string, food: Partial<FoodLog>) => {
    if (!currentUser) return;
    await updateFoodLog(currentUser.uid, logId, food);
  };

  const handleDeleteFoodLog = async (logId: string) => {
    if (!currentUser) return;
    await deleteFoodLog(currentUser.uid, logId);
  };

  const handleCopyMeals = async (targetDate: string, mealType?: MealType) => {
    if (!currentUser) return 0;
    return await copyMealsToAnotherDay(currentUser.uid, selectedDate, targetDate, mealType);
  };

  const handleAddWorkoutLog = async (workout: Omit<WorkoutLog, 'id'>) => {
    if (!currentUser) return;
    await addWorkoutLog(currentUser.uid, workout);
  };

  const handleDeleteWorkoutLog = async (logId: string) => {
    if (!currentUser) return;
    await deleteWorkoutLog(currentUser.uid, logId);
  };

  const handleSaveWorkoutPlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    if (!currentUser) return;
    const newId = await saveWorkoutPlan(currentUser.uid, plan);
    setWorkoutPlans([...workoutPlans, { ...plan, id: newId }]);
  };

  const handleDeleteWorkoutPlan = async (planId: string) => {
    if (!currentUser) return;
    await deleteWorkoutPlan(currentUser.uid, planId);
    setWorkoutPlans(workoutPlans.filter((p) => p.id !== planId));
  };

  const handleAddWeightLog = async (log: Omit<WeightLog, 'id'>) => {
    if (!currentUser) return;
    const id = await addWeightLog(currentUser.uid, log);
    const updated = [{ ...log, id }, ...weightLogs];
    setWeightLogs(updated);

    // Also update currentWeightKg in private profile
    if (privateProfile) {
      await savePrivateProfile(currentUser.uid, {
        currentWeightKg: log.weightKg,
      });
      setPrivateProfile({ ...privateProfile, currentWeightKg: log.weightKg });
    }
  };

  const handleDeleteWeightLog = async (logId: string) => {
    if (!currentUser) return;
    await deleteWeightLog(currentUser.uid, logId);
    setWeightLogs(weightLogs.filter((w) => w.id !== logId));
  };

  const handleSaveMealPlan = async (plan: Omit<DailyMealPlan, 'id'>) => {
    if (!currentUser) return;
    const newId = await saveMealPlan(currentUser.uid, plan);
    setMealPlans([...mealPlans, { ...plan, id: newId }]);
  };

  const handleDeleteMealPlan = async (planId: string) => {
    if (!currentUser) return;
    await deleteMealPlan(currentUser.uid, planId);
    setMealPlans(mealPlans.filter((p) => p.id !== planId));
  };

  const handleUpdatePrivateProfile = async (data: Partial<PrivateProfile>) => {
    if (!currentUser) return;
    await savePrivateProfile(currentUser.uid, data);
    setPrivateProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    await deleteUserAccountAndData(currentUser.uid);
    await logoutUser();
  };

  const handleExportData = async () => {
    if (!currentUser) return '{}';
    return await exportAllUserData(currentUser.uid);
  };

  // Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8EF] dark:bg-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#F4A7C3] border-t-[#3978AE] animate-spin mb-4" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          Đang khởi tạo Nutrivita...
        </p>
      </div>
    );
  }

  // Not signed in: Show Landing Page
  if (!currentUser) {
    return (
      <LandingPage
        onLoginWithGoogle={handleGoogleLogin}
        authLoading={authLoading}
        authError={authError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8EF] dark:bg-gray-950 text-[#343746] dark:text-gray-100 flex flex-col transition-colors selection:bg-[#F4A7C3]/30">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        userName={currentUser.displayName || userProfile?.displayName || 'Tài khoản Google'}
        userPhoto={currentUser.photoURL || userProfile?.photoURL}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Onboarding Wizard for First-Time Users */}
        {showOnboarding && (
          <OnboardingModal
            userId={currentUser.uid}
            userDisplayName={currentUser.displayName || ''}
            onComplete={handleCompleteOnboarding}
          />
        )}

        {/* Tab 1: Dashboard (Tổng quan) */}
        {currentTab === 'dashboard' && (
          <Dashboard
            displayName={currentUser.displayName || userProfile?.displayName || 'bạn'}
            selectedDate={selectedDate}
            profile={privateProfile}
            foodLogs={foodLogs}
            waterLogs={waterLogs}
            waterTotalMl={waterTotalMl}
            workoutLogs={workoutLogs}
            workoutMinutes={workoutMinutes}
            workoutCaloriesBurned={workoutCaloriesBurned}
            recentWeightLogs={weightLogs}
            onTabChange={setCurrentTab}
            onAddWaterQuick={handleAddWaterQuick}
            onOpenQuickFoodModal={() => setCurrentTab('food_log')}
            onOpenQuickWorkoutModal={() => setCurrentTab('workout')}
          />
        )}

        {/* Tab 2: Food Log (Nhật ký ăn uống) */}
        {currentTab === 'food_log' && (
          <FoodLogView
            userId={currentUser.uid}
            selectedDate={selectedDate}
            foodLogs={foodLogs}
            onAddFood={handleAddFoodLog}
            onUpdateFood={handleUpdateFoodLog}
            onDeleteFood={handleDeleteFoodLog}
            onCopyMealsToDate={handleCopyMeals}
          />
        )}

        {/* Tab 3: Workout (Tập luyện) */}
        {currentTab === 'workout' && (
          <WorkoutView
            userId={currentUser.uid}
            selectedDate={selectedDate}
            currentWeightKg={privateProfile?.currentWeightKg || 55}
            workoutLogs={workoutLogs}
            workoutPlans={workoutPlans}
            onAddWorkout={handleAddWorkoutLog}
            onDeleteWorkout={handleDeleteWorkoutLog}
            onSavePlan={handleSaveWorkoutPlan}
            onDeletePlan={handleDeleteWorkoutPlan}
          />
        )}

        {/* Tab 4: Meal Plan (Kế hoạch ăn uống AI) */}
        {currentTab === 'meal_plan' && (
          <MealPlannerView
            userId={currentUser.uid}
            profile={privateProfile}
            savedMealPlans={mealPlans}
            onSavePlan={handleSaveMealPlan}
            onDeletePlan={handleDeleteMealPlan}
          />
        )}

        {/* Tab 5: Progress (Tiến trình) */}
        {currentTab === 'progress' && (
          <ProgressView
            userId={currentUser.uid}
            profile={privateProfile}
            weightLogs={weightLogs}
            onAddWeightLog={handleAddWeightLog}
            onDeleteWeightLog={handleDeleteWeightLog}
            onExportData={handleExportData}
          />
        )}

        {/* Tab 6: AI Assistant (Trợ lý AI) */}
        {currentTab === 'ai_assistant' && (
          <AIAssistantView
            userId={currentUser.uid}
            profile={privateProfile}
            todayFoodLogs={foodLogs}
            todayWaterTotal={waterTotalMl}
          />
        )}

        {/* Tab 7: Profile (Hồ sơ) or Tab 8: Settings (Cài đặt) */}
        {(currentTab === 'profile' || currentTab === 'settings') && (
          <ProfileSettingsView
            userId={currentUser.uid}
            userProfile={userProfile}
            privateProfile={privateProfile}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onUpdatePrivateProfile={handleUpdatePrivateProfile}
            onExportData={handleExportData}
            onDeleteAccount={handleDeleteAccount}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
}
