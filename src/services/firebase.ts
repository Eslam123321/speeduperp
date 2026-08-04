import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, ref, set, get, onValue, type Database } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { FirebaseConfigInput } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigInput = {
  apiKey: "AIzaSyB2IkqgZE8fk79RBkEw5W8VGD38Aq0TI-U",
  authDomain: "speeduperp.firebaseapp.com",
  databaseURL: "https://speeduperp-default-rtdb.firebaseio.com",
  projectId: "speeduperp",
  storageBucket: "speeduperp.firebasestorage.app",
  messagingSenderId: "1092085780628",
  appId: "1:1092085780628:web:02e117815ffb3cfe892481",
  measurementId: "G-XSDRC509DC"
};

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

export const initializeFirebaseService = (config: FirebaseConfigInput = DEFAULT_FIREBASE_CONFIG): { success: boolean; message: string } => {
  try {
    const activeConfig = config && config.apiKey ? config : DEFAULT_FIREBASE_CONFIG;
    if (!activeConfig.apiKey || !activeConfig.projectId) {
      return { success: false, message: 'مفاتيح Firebase غير مكتملة' };
    }

    if (getApps().length > 0) {
      firebaseApp = getApps()[0];
    } else {
      firebaseApp = initializeApp(activeConfig);
    }

    try {
      db = getFirestore(firebaseApp);
    } catch (e) {
      console.warn('Firestore init skipped:', e);
    }

    try {
      rtdb = getDatabase(firebaseApp);
    } catch (e) {
      console.warn('Realtime Database init skipped:', e);
    }

    if (activeConfig.measurementId && typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && firebaseApp) {
          getAnalytics(firebaseApp);
        }
      }).catch(() => {});
    }

    return { success: true, message: 'تم الربط مع Firebase (Realtime Database & Firestore) بنجاح!' };
  } catch (error: any) {
    console.error('Firebase Init Error:', error);
    return { success: false, message: error.message || 'فشل الاتصال بـ Firebase' };
  }
};

export const getFirestoreDb = () => db;
export const getRealtimeDb = () => rtdb;
export const isFirebaseActive = () => db !== null || rtdb !== null;

export const syncToFirebase = async (path: string, data: any) => {
  if (!rtdb) return;
  try {
    const dbRef = ref(rtdb, path);
    await set(dbRef, data);
  } catch (err) {
    console.error(`Firebase Sync Error at ${path}:`, err);
  }
};


