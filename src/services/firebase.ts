import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Temporary firebase config that can be replaced by the user.
// Safe fallbacks are used so the app works locally without configuring Firebase.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "mock-app-id"
};

// Check if a real configuration is provided
const isRealConfig = 
  firebaseConfig.apiKey !== "mock-api-key" &&
  firebaseConfig.projectId !== "mock-project-id";

let app;
let db: any = null;
let auth: any = null;

if (isRealConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log("Firebase initialized successfully with config.");
  } catch (error) {
    console.warn("Failed to initialize Firebase with provided config:", error);
  }
} else {
  console.log("Using offline/local mock database. Firebase config not set.");
}

export { db, auth, isRealConfig };
export default app;
