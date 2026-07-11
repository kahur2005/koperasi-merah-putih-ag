import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  // Firebase web config is public client configuration. The fallbacks keep
  // Google login working on Cloud Run Docker builds where Vite env injection
  // can be unavailable.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDQ-g1c8bTykrqYIub2buQo8SZlwrJuers',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'koperasi-merah-putih-c76b5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'koperasi-merah-putih-c76b5',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:707690022219:web:e616acdb52a7ba8c5414ce',
};

const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogleAndGetIdToken() {
  if (!firebaseAuth) {
    throw new Error('Firebase belum dikonfigurasi. Isi VITE_FIREBASE_* di .env.');
  }

  const credential = await signInWithPopup(firebaseAuth, googleProvider);
  return credential.user.getIdToken();
}

export async function signOutFromFirebase() {
  if (!firebaseAuth) return;
  await signOut(firebaseAuth);
}

export function hasFirebaseConfig() {
  return isFirebaseConfigured;
}
