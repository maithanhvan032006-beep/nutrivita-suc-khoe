import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestoreError';
import { PrivateProfile, UserProfile } from '../types';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const existing = await getDoc(docRef);
    const now = new Date().toISOString();

    if (existing.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: now,
      });
    } else {
      await setDoc(docRef, {
        displayName: data.displayName || '',
        email: data.email || '',
        photoURL: data.photoURL || '',
        profileCompleted: data.profileCompleted ?? false,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getPrivateProfile(userId: string): Promise<PrivateProfile | null> {
  const path = `users/${userId}/private/profile`;
  try {
    const docSnap = await getDoc(doc(db, 'users', userId, 'private', 'profile'));
    if (docSnap.exists()) {
      return docSnap.data() as PrivateProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePrivateProfile(
  userId: string,
  data: Partial<PrivateProfile>
): Promise<void> {
  const path = `users/${userId}/private/profile`;
  try {
    const docRef = doc(db, 'users', userId, 'private', 'profile');
    const now = new Date().toISOString();
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: now,
      },
      { merge: true }
    );

    // Also mark user profile as completed
    await updateDoc(doc(db, 'users', userId), {
      profileCompleted: true,
      updatedAt: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserAccountAndData(userId: string): Promise<void> {
  const userDocPath = `users/${userId}`;
  try {
    // Delete subcollections: foodLogs, waterLogs, workoutLogs, weightLogs, goals, workoutPlans, mealPlans
    const subcollections = [
      'foodLogs',
      'waterLogs',
      'workoutLogs',
      'weightLogs',
      'goals',
      'workoutPlans',
      'mealPlans',
    ];

    for (const sub of subcollections) {
      const snap = await getDocs(collection(db, 'users', userId, sub));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    }

    // Delete private profile
    await deleteDoc(doc(db, 'users', userId, 'private', 'profile'));

    // Delete root user doc
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userDocPath);
  }
}
