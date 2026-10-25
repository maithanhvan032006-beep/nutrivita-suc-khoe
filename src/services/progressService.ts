import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreError';
import { DailyMealPlan, Goal, WeightLog } from '../types';

export async function getWeightLogs(userId: string): Promise<WeightLog[]> {
  const path = `users/${userId}/weightLogs`;
  try {
    const q = query(
      collection(db, 'users', userId, 'weightLogs'),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as WeightLog[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addWeightLog(
  userId: string,
  log: Omit<WeightLog, 'id'>
): Promise<string> {
  const path = `users/${userId}/weightLogs`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'weightLogs'), {
      ...log,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWeightLog(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/weightLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'weightLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Goals
export async function getGoals(userId: string): Promise<Goal[]> {
  const path = `users/${userId}/goals`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'goals'));
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Goal[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<string> {
  const path = `users/${userId}/goals`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'goals'), {
      ...goal,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGoal(
  userId: string,
  goalId: string,
  goal: Partial<Goal>
): Promise<void> {
  const path = `users/${userId}/goals/${goalId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'goals', goalId), goal);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Meal Plans
export async function getMealPlans(userId: string): Promise<DailyMealPlan[]> {
  const path = `users/${userId}/mealPlans`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'mealPlans'));
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as DailyMealPlan[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveMealPlan(
  userId: string,
  plan: Omit<DailyMealPlan, 'id'>
): Promise<string> {
  const path = `users/${userId}/mealPlans`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'mealPlans'), {
      ...plan,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteMealPlan(userId: string, planId: string): Promise<void> {
  const path = `users/${userId}/mealPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'mealPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Data Export
export async function exportAllUserData(userId: string): Promise<string> {
  try {
    const [weightLogs, goals, mealPlans] = await Promise.all([
      getWeightLogs(userId),
      getGoals(userId),
      getMealPlans(userId),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId,
      weightLogs,
      goals,
      mealPlans,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Không thể xuất dữ liệu: ' + (error instanceof Error ? error.message : ''));
  }
}
