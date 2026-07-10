import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getServiceAccountFromEnv() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawJson) return null;

  try {
    return JSON.parse(rawJson);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.');
  }
}

export function createFirebaseAuthFromEnv() {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const serviceAccount = getServiceAccountFromEnv();

  if (!projectId && !serviceAccount && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }

  if (getApps().length === 0) {
    initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  }

  return getAuth();
}
