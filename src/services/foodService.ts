import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreError';
import { FoodLog, MealType } from '../types';

export async function getFoodLogsByDate(userId: string, date: string): Promise<FoodLog[]> {
  const path = `users/${userId}/foodLogs`;
  try {
    const q = query(
      collection(db, 'users', userId, 'foodLogs'),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as FoodLog[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeFoodLogsByDate(
  userId: string,
  date: string,
  onUpdate: (logs: FoodLog[]) => void,
  onError?: (err: any) => void
) {
  const path = `users/${userId}/foodLogs`;
  const q = query(
    collection(db, 'users', userId, 'foodLogs'),
    where('date', '==', date)
  );

  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as FoodLog[];
      onUpdate(logs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addFoodLog(userId: string, item: Omit<FoodLog, 'id'>): Promise<string> {
  const path = `users/${userId}/foodLogs`;
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'users', userId, 'foodLogs'), {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateFoodLog(
  userId: string,
  logId: string,
  item: Partial<FoodLog>
): Promise<void> {
  const path = `users/${userId}/foodLogs/${logId}`;
  try {
    const docRef = doc(db, 'users', userId, 'foodLogs', logId);
    await updateDoc(docRef, {
      ...item,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFoodLog(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/foodLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'foodLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function copyMealsToAnotherDay(
  userId: string,
  sourceDate: string,
  targetDate: string,
  filterMealType?: MealType
): Promise<number> {
  const path = `users/${userId}/foodLogs`;
  try {
    const currentLogs = await getFoodLogsByDate(userId, sourceDate);
    const toCopy = filterMealType
      ? currentLogs.filter(l => l.mealType === filterMealType)
      : currentLogs;

    let count = 0;
    const now = new Date().toISOString();
    for (const log of toCopy) {
      const { id, ...rest } = log;
      await addDoc(collection(db, 'users', userId, 'foodLogs'), {
        ...rest,
        date: targetDate,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
