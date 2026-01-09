
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// This is a server-only file.

let app: FirebaseApp;

// Standard singleton pattern to ensure only one app instance is created
function createFirebaseApp() {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    } else {
        return getApp();
    }
}

export function initializeFirebase() {
    if (!app) {
        app = createFirebaseApp();
    }
    return getSdks(app);
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}
