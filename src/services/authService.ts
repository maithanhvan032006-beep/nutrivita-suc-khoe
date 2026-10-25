import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isGuest?: boolean;
}

const GUEST_STORAGE_KEY = 'nutrivita_guest_session';

export async function registerWithEmail(
  displayName: string,
  email: string,
  password: string
): Promise<AppUser> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName.trim()) {
      await updateProfile(cred.user, {
        displayName: displayName.trim(),
      });
    }

    // Clear guest session if any
    localStorage.removeItem(GUEST_STORAGE_KEY);

    return {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: displayName.trim() || cred.user.email || 'Người dùng',
      photoURL: cred.user.photoURL || undefined,
      isGuest: false,
    };
  } catch (error: any) {
    console.error('Registration Error:', error);
    let friendlyMessage = 'Đăng ký không thành công. Vui lòng thử lại.';
    if (error?.code === 'auth/email-already-in-use') {
      friendlyMessage = 'Email này đã được sử dụng. Vui lòng chuyển sang tab Đăng nhập.';
    } else if (error?.code === 'auth/weak-password') {
      friendlyMessage = 'Mật khẩu quá ngắn. Vui lòng nhập tối thiểu 6 ký tự.';
    } else if (error?.code === 'auth/invalid-email') {
      friendlyMessage = 'Định dạng email không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Phương thức Email/Password chưa được kích hoạt trong Firebase Console. Bạn có thể chọn "Trải nghiệm ngay (Đăng nhập sau)" để bắt đầu sử dụng tức thì!';
    } else if (error?.message) {
      friendlyMessage = error.message;
    }
    throw new Error(friendlyMessage);
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AppUser> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    localStorage.removeItem(GUEST_STORAGE_KEY);

    return {
      uid: cred.user.uid,
      email: cred.user.email || email,
      displayName: cred.user.displayName || cred.user.email || 'Người dùng',
      photoURL: cred.user.photoURL || undefined,
      isGuest: false,
    };
  } catch (error: any) {
    console.error('Login Error:', error);
    let friendlyMessage = 'Đăng nhập không thành công. Vui lòng thử lại.';
    if (
      error?.code === 'auth/user-not-found' ||
      error?.code === 'auth/wrong-password' ||
      error?.code === 'auth/invalid-credential'
    ) {
      friendlyMessage = 'Email hoặc mật khẩu không chính xác.';
    } else if (error?.code === 'auth/invalid-email') {
      friendlyMessage = 'Định dạng email không hợp lệ.';
    } else if (error?.code === 'auth/too-many-requests') {
      friendlyMessage = 'Quá nhiều lần thử thất bại. Vui lòng đợi trong giây lát và thử lại.';
    } else if (error?.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Phương thức Email/Password chưa bật trong Firebase Console. Bạn có thể dùng tính năng "Trải nghiệm ngay (Đăng nhập sau)".';
    } else if (error?.message) {
      friendlyMessage = error.message;
    }
    throw new Error(friendlyMessage);
  }
}

export function startGuestSession(name?: string): AppUser {
  let existing = getStoredGuestSession();
  if (existing) {
    if (name && name.trim()) {
      existing.displayName = name.trim();
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(existing));
    }
    return existing;
  }

  const guestUser: AppUser = {
    uid: 'guest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    email: '',
    displayName: (name && name.trim()) || 'Khách',
    isGuest: true,
  };

  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  return guestUser;
}

export function getStoredGuestSession(): AppUser | null {
  const saved = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  localStorage.removeItem(GUEST_STORAGE_KEY);
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (error: any) {
    console.error('Logout error:', error);
  }
}

export function subscribeToAuthChanges(callback: (user: AppUser | null) => void) {
  // Check guest session first
  const guest = getStoredGuestSession();
  if (guest && !auth.currentUser) {
    callback(guest);
  }

  return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Người dùng',
        photoURL: firebaseUser.photoURL || undefined,
        isGuest: false,
      });
    } else {
      const activeGuest = getStoredGuestSession();
      callback(activeGuest);
    }
  });
}
