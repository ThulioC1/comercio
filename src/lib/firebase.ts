import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCFvxHt9CRflEwzh4Lih22BiY9ybSHEYK4",
  authDomain: "comercio-24f54.firebaseapp.com",
  projectId: "comercio-24f54",
  storageBucket: "comercio-24f54.appspot.com",
  messagingSenderId: "495215037632",
  appId: "1:495215037632:web:5ffb5cd3b27925f3593125"
};


let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

// Conectando ao emulador de autenticação em ambiente de desenvolvimento
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectAuthEmulator(auth, "http://localhost:9099");
}


export { app, auth, db };
