import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { FirebaseConfigInput } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigInput = {
  apiKey: "AIzaSyB2IkqgZE8fk79RBkEw5W8VGD38Aq0TI-U",
  authDomain: "speeduperp.firebaseapp.com",
  projectId: "speeduperp",
  storageBucket: "speeduperp.firebasestorage.app",
  messagingSenderId: "1092085780628",
  appId: "1:1092085780628:web:02e117815ffb3cfe892481",
  measurementId: "G-XSDRC509DC"
};

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;

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

    db = getFirestore(firebaseApp);

    if (activeConfig.measurementId && typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && firebaseApp) {
          getAnalytics(firebaseApp);
        }
      }).catch(() => {});
    }

    return { success: true, message: 'تم الربط مع Firebase (speeduperp) بنجاح!' };
  } catch (error: any) {
    console.error('Firebase Init Error:', error);
    return { success: false, message: error.message || 'فشل الاتصال بـ Firebase' };
  }
};

export const getFirestoreDb = () => db;
export const isFirebaseActive = () => db !== null;

