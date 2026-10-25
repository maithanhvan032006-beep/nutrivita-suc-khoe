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
import { isGuestUser, getGuestData, setGuestData } from './localGuestStore';
import { FoodLog, MealType } from '../types';

export async function getFoodLogsByDate(userId: string, date: string): Promise<FoodLog[]> {
  if (isGuestUser(userId)) {
    const all = getGuestData<FoodLog[]>(userId, 'foodLogs', []);
    return all.filter((item) => item.date === date);
  }

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
  if (isGuestUser(userId)) {
    const fetchLocal = () => {
      const all = getGuestData<FoodLog[]>(userId, 'foodLogs', []);
      onUpdate(all.filter((item) => item.date === date));
    };
    fetchLocal();

    const handler = (e: StorageEvent) => {
      if (e.key && e.key.includes(`nutrivita_${userId}_foodLogs`)) {
        fetchLocal();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

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
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const all = getGuestData<FoodLog[]>(userId, 'foodLogs', []);
    const newId = 'food_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newLog: FoodLog = {
      ...item,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setGuestData(userId, 'foodLogs', [newLog, ...all]);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  const path = `users/${userId}/foodLogs`;
  try {
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
  if (isGuestUser(userId)) {
    const all = getGuestData<FoodLog[]>(userId, 'foodLogs', []);
    const updated = all.map((log) =>
      log.id === logId ? { ...log, ...item, updatedAt: new Date().toISOString() } : log
    );
    setGuestData(userId, 'foodLogs', updated);
    window.dispatchEvent(new Event('storage'));
    return;
  }

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
  if (isGuestUser(userId)) {
    const all = getGuestData<FoodLog[]>(userId, 'foodLogs', []);
    setGuestData(userId, 'foodLogs', all.filter((l) => l.id !== logId));
    window.dispatchEvent(new Event('storage'));
    return;
  }

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
  const currentLogs = await getFoodLogsByDate(userId, sourceDate);
  const toCopy = filterMealType
    ? currentLogs.filter(l => l.mealType === filterMealType)
    : currentLogs;

  let count = 0;
  for (const log of toCopy) {
    const { id, ...rest } = log;
    await addFoodLog(userId, {
      ...rest,
      date: targetDate,
    });
    count++;
  }
  return count;
}
