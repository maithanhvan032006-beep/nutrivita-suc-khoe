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
import { isGuestUser, getGuestData, setGuestData } from './localGuestStore';
import { WorkoutLog, WorkoutPlan } from '../types';

export async function getWorkoutLogsByDate(userId: string, date: string): Promise<WorkoutLog[]> {
  if (isGuestUser(userId)) {
    const all = getGuestData<WorkoutLog[]>(userId, 'workoutLogs', []);
    return all.filter((item) => item.date === date);
  }

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
  if (isGuestUser(userId)) {
    const fetchLocal = () => {
      const all = getGuestData<WorkoutLog[]>(userId, 'workoutLogs', []);
      const filtered = all.filter((item) => item.date === date);
      const totalMinutes = filtered.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
      const totalBurned = filtered.reduce((sum, item) => sum + (item.estimatedCaloriesBurned || 0), 0);
      onUpdate(filtered, totalMinutes, totalBurned);
    };
    fetchLocal();

    const handler = (e: StorageEvent) => {
      if (e.key && e.key.includes(`nutrivita_${userId}_workoutLogs`)) {
        fetchLocal();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

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
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const all = getGuestData<WorkoutLog[]>(userId, 'workoutLogs', []);
    const newId = 'workout_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newLog: WorkoutLog = {
      ...log,
      id: newId,
      createdAt: now,
    };
    setGuestData(userId, 'workoutLogs', [newLog, ...all]);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  const path = `users/${userId}/workoutLogs`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'workoutLogs'), {
      ...log,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWorkoutLog(userId: string, logId: string): Promise<void> {
  if (isGuestUser(userId)) {
    const all = getGuestData<WorkoutLog[]>(userId, 'workoutLogs', []);
    setGuestData(userId, 'workoutLogs', all.filter((l) => l.id !== logId));
    window.dispatchEvent(new Event('storage'));
    return;
  }

  const path = `users/${userId}/workoutLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
  if (isGuestUser(userId)) {
    return getGuestData<WorkoutPlan[]>(userId, 'workoutPlans', []);
  }

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
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const all = getGuestData<WorkoutPlan[]>(userId, 'workoutPlans', []);
    const newId = 'wplan_' + Date.now().toString(36);
    const newPlan = { ...plan, id: newId, createdAt: now };
    setGuestData(userId, 'workoutPlans', [newPlan, ...all]);
    return newId;
  }

  const path = `users/${userId}/workoutPlans`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'workoutPlans'), {
      ...plan,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWorkoutPlan(userId: string, planId: string): Promise<void> {
  if (isGuestUser(userId)) {
    const all = getGuestData<WorkoutPlan[]>(userId, 'workoutPlans', []);
    setGuestData(userId, 'workoutPlans', all.filter((p) => p.id !== planId));
    return;
  }

  const path = `users/${userId}/workoutPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'workoutPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
