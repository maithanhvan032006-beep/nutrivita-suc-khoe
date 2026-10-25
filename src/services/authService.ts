import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    let friendlyMessage = 'Đăng nhập không thành công. Vui lòng thử lại.';
    if (error?.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Bạn đã đóng cửa sổ đăng nhập Google.';
    } else if (error?.code === 'auth/popup-blocked') {
      friendlyMessage = 'Cửa sổ popup bị trình duyệt chặn. Vui lòng cho phép popup để đăng nhập.';
    } else if (error?.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Yêu cầu đăng nhập đã bị hủy.';
    } else if (error?.code === 'auth/network-request-failed') {
      friendlyMessage = 'Lỗi kết nối mạng khi liên lạc với Google. Kiểm tra lại đường truyền internet.';
    } else if (error?.message) {
      friendlyMessage = error.message;
    }
    console.error('Google Sign-In Error:', error);
    throw new Error(friendlyMessage);
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Đăng xuất thất bại: ' + (error?.message || 'Lỗi không xác định'));
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentFirebaseUser(): FirebaseUser | null {
  return auth.currentUser;
}
