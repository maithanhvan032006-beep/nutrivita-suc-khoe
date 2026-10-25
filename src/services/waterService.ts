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
import { WaterLog } from '../types';

export async function getWaterLogsByDate(userId: string, date: string): Promise<WaterLog[]> {
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
  const path = `users/${userId}/waterLogs`;
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'waterLogs'), {
      amountMl,
      date,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteWaterLog(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/waterLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'waterLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
