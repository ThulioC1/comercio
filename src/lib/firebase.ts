import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
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

// Adicionando localhost aos domínios autorizados para desenvolvimento
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    auth.config.emulator.host = 'localhost';
}


export { app, auth, db };
