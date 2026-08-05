import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, type Firestore } from 'firebase/firestore';
import { getDatabase, ref, set, get, onValue, type Database } from 'firebase/database';
import { getAnalytics, isSupported } from 'firebase/analytics';
import type { FirebaseConfigInput } from '../types';

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigInput = {
  apiKey: "AIzaSyCxBlyCh0yfrD5_COuF1wvCDv6eraVvUdw",
  authDomain: "speedup-erp-live.firebaseapp.com",
  databaseURL: "https://speedup-erp-live-default-rtdb.firebaseio.com",
  projectId: "speedup-erp-live",
  storageBucket: "speedup-erp-live.firebasestorage.app",
  messagingSenderId: "148235410650",
  appId: "1:148235410650:web:b92ca468a2cb9c1d90d9e3",
  measurementId: "G-XWV1THGB79"
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

export const syncToFirestore = async (collectionName: string, data: any[]) => {
  if (!db || !Array.isArray(data)) return;
  try {
    for (const item of data) {
      if (item && item.id) {
        const docRef = doc(db, collectionName, String(item.id));
        await setDoc(docRef, item, { merge: true });
      }
    }
  } catch (err) {
    console.error(`Firestore Sync Error at ${collectionName}:`, err);
  }
};

export const deleteFromFirestore = async (collectionName: string, docId: string) => {
  if (!db || !docId) return;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`Firestore Delete Error at ${collectionName}/${docId}:`, err);
  }
};

export const fetchFromFirebase = async (path: string) => {
  if (!rtdb) return null;
  try {
    const dbRef = ref(rtdb, path);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (err) {
    console.error(`Firebase Fetch Error at ${path}:`, err);
    return null;
  }
};

export const subscribeToFirebase = (path: string, callback: (data: any) => void) => {
  if (!rtdb) return () => {};
  const dbRef = ref(rtdb, path);
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  });
};



