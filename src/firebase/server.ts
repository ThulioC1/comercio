
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This is a server-only file.

export function initializeFirebase() {
  if (!getApps().length) {
    // In server components, especially in non-Firebase hosting environments (like Vercel),
    // we must explicitly provide the configuration.
    initializeApp(firebaseConfig);
  }
  // If already initialized, just get the existing app instance.
  const app = getApp();
  return getSdks(app);
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
