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
import { WaterLog } from '../types';

export async function getWaterLogsByDate(userId: string, date: string): Promise<WaterLog[]> {
  if (isGuestUser(userId)) {
    const all = getGuestData<WaterLog[]>(userId, 'waterLogs', []);
    return all.filter((item) => item.date === date);
  }

  const path = `users/${userId}/waterLogs`;
  try {
    const q = query(
      collection(db, 'users', userId, 'waterLogs'),
      where('date', '==', date)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as WaterLog[];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeWaterLogsByDate(
  userId: string,
  date: string,
  onUpdate: (logs: WaterLog[], totalMl: number) => void,
  onError?: (err: any) => void
) {
  if (isGuestUser(userId)) {
    const fetchLocal = () => {
      const all = getGuestData<WaterLog[]>(userId, 'waterLogs', []);
      const filtered = all.filter((item) => item.date === date);
      const total = filtered.reduce((sum, item) => sum + (item.amountMl || 0), 0);
      onUpdate(filtered, total);
    };
    fetchLocal();

    const handler = (e: StorageEvent) => {
      if (e.key && e.key.includes(`nutrivita_${userId}_waterLogs`)) {
        fetchLocal();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  const path = `users/${userId}/waterLogs`;
  const q = query(
    collection(db, 'users', userId, 'waterLogs'),
    where('date', '==', date)
  );

  return onSnapshot(
    q,
    (snap) => {
      const logs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })) as WaterLog[];
      const total = logs.reduce((sum, item) => sum + (item.amountMl || 0), 0);
      onUpdate(logs, total);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function addWaterLog(
  userId: string,
  amountMl: number,
  date: string
): Promise<string> {
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const all = getGuestData<WaterLog[]>(userId, 'waterLogs', []);
    const newId = 'water_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newLog: WaterLog = {
      id: newId,
      amountMl,
      date,
      createdAt: now,
    };
    setGuestData(userId, 'waterLogs', [newLog, ...all]);
    window.dispatchEvent(new Event('storage'));
    return newId;
  }

  const path = `users/${userId}/waterLogs`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'waterLogs'), {
      amountMl,
      date,
      createdAt: now,
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWaterLog(userId: string, logId: string): Promise<void> {
  if (isGuestUser(userId)) {
    const all = getGuestData<WaterLog[]>(userId, 'waterLogs', []);
    setGuestData(userId, 'waterLogs', all.filter((w) => w.id !== logId));
    window.dispatchEvent(new Event('storage'));
    return;
  }

  const path = `users/${userId}/waterLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'waterLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
