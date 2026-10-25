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
import { isGuestUser, getGuestData, setGuestData, clearGuestData } from './localGuestStore';
import { PrivateProfile, UserProfile } from '../types';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isGuestUser(userId)) {
    return getGuestData<UserProfile | null>(userId, 'profile', null);
  }

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
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const existing = getGuestData<UserProfile | null>(userId, 'profile', null);
    const updated: UserProfile = {
      displayName: data.displayName || existing?.displayName || 'Khách',
      email: data.email || existing?.email || '',
      photoURL: data.photoURL || existing?.photoURL || '',
      profileCompleted: data.profileCompleted ?? existing?.profileCompleted ?? false,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    setGuestData(userId, 'profile', updated);
    return;
  }

  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const existing = await getDoc(docRef);

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
  if (isGuestUser(userId)) {
    return getGuestData<PrivateProfile | null>(userId, 'private_profile', null);
  }

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
  const now = new Date().toISOString();

  if (isGuestUser(userId)) {
    const existing = getGuestData<Partial<PrivateProfile>>(userId, 'private_profile', {});
    const updated = {
      ...existing,
      ...data,
      updatedAt: now,
    };
    setGuestData(userId, 'private_profile', updated);

    // Also mark user profile as completed
    const uProfile = getGuestData<UserProfile | null>(userId, 'profile', null);
    if (uProfile) {
      uProfile.profileCompleted = true;
      uProfile.updatedAt = now;
      setGuestData(userId, 'profile', uProfile);
    }
    return;
  }

  const path = `users/${userId}/private/profile`;
  try {
    const docRef = doc(db, 'users', userId, 'private', 'profile');
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
  if (isGuestUser(userId)) {
    clearGuestData(userId);
    return;
  }

  const userDocPath = `users/${userId}`;
  try {
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

    await deleteDoc(doc(db, 'users', userId, 'private', 'profile'));
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userDocPath);
  }
}
