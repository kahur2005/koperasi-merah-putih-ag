import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
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
