// src/firebase/firebaseConfig.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const userProvidedFirebaseConfig = {
    apiKey: "AIzaSyBuuhiNfinjIqySaRYXIAW9qBqA1706Kzo",
    authDomain: "agwa-wsi.firebaseapp.com",
    projectId: "agwa-wsi",
    storageBucket: "agwa-wsi.appspot.com",
    messagingSenderId: "852740116552",
    appId: "1:852740116552:web:e5fc6b0735d85e0af8887d",
    measurementId: "G-78DWK78P2B"
};

let firebaseConfigToUse = userProvidedFirebaseConfig;

if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
        const envConfig = JSON.parse(__firebase_config);
        console.warn("FYI: __firebase_config detected from environment, but userProvidedFirebaseConfig for 'agwa-wsi' project is being prioritized.");
    } catch (e) {
        console.error("Error parsing __firebase_config from environment:", e);
    }
}

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfigToUse);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

const USE_EMULATOR = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (USE_EMULATOR) {
    console.warn("🔥🔥🔥 Connecting to Firebase Emulators 🔥🔥🔥");
    connectAuthEmulator(auth, `http://${import.meta.env.VITE_AUTH_EMULATOR_HOST || "127.0.0.1"}:${import.meta.env.VITE_AUTH_EMULATOR_PORT || 9099}`);
    connectFirestoreEmulator(db, import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || "127.0.0.1", parseInt(import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || "8080", 10));
    connectFunctionsEmulator(functions, import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || "127.0.0.1", parseInt(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || "5001", 10));
} else {
    console.log("🚀 Connecting to Production Firebase Services 🚀");
}

enableMultiTabIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore offline persistence enabled for multiple tabs.");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn("Firestore offline persistence failed: Multiple tabs open or other issues.");
    } else if (err.code === 'unimplemented') {
      console.warn("Firestore offline persistence failed: Browser does not support all features.");
    }
  });

export { app, auth, db, functions };