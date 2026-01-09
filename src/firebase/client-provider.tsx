'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This is the primary client-side initialization function.
function initializeClientApp() {
    // If there are no apps, initialize one.
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    // Otherwise, return the already-initialized app.
    return getApp();
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    const app = initializeClientApp();
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
