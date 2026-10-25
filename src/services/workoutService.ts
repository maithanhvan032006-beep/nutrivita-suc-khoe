import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreError';
import { WorkoutLog, WorkoutPlan } from '../types';

export async function getWorkoutLogsByDate(userId: string, date: string): Promise<WorkoutLog[]> {
  const path = `users/${userId}/workoutLogs`;
  try {
    const q = query(
      collection(db, 'users', userId, 'workoutLogs'),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as WorkoutLog[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeWorkoutLogsByDate(
  userId: string,
  date: string,
  onUpdate: (logs: WorkoutLog[], totalMinutes: number, totalBurned: number) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/workoutLogs`;
  const q = query(
    collection(db, 'users', userId, 'workoutLogs'),
    where('date', '==', date)
  );

  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as WorkoutLog[];
      const totalMinutes = logs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
      const totalBurned = logs.reduce((sum, item) => sum + (item.estimatedCaloriesBurned || 0), 0);
      onUpdate(logs, totalMinutes, totalBurned);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addWorkoutLog(
  userId: string,
  log: Omit<WorkoutLog, 'id'>
): Promise<string> {
  const path = `users/${userId}/workoutLogs`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'workoutLogs'), {
      ...log,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWorkoutLog(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/workoutLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  const path = `users/${userId}/workoutPlans`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'workoutPlans'));
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as WorkoutPlan[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveWorkoutPlan(
  userId: string,
  plan: Omit<WorkoutPlan, 'id'>
): Promise<string> {
  const path = `users/${userId}/workoutPlans`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'workoutPlans'), {
      ...plan,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWorkoutPlan(userId: string, planId: string): Promise<void> {
  const path = `users/${userId}/workoutPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
