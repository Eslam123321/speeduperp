import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, type Firestore } from 'firebase/firestore';
import { getDatabase, ref, set, get, remove, onValue, type Database } from 'firebase/database';
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

// Auto-initialize default Firebase service on module load
try {
  initializeFirebaseService(DEFAULT_FIREBASE_CONFIG);
} catch (e) {
  console.warn('Auto Firebase init error:', e);
}

export const getFirestoreDb = () => db;
export const getRealtimeDb = () => rtdb;
export const isFirebaseActive = () => db !== null || rtdb !== null;

export const sanitizeForFirebase = (data: any): any => {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirebase(item));
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      cleanObj[key] = sanitizeForFirebase(val);
    }
  }
  return cleanObj;
};

export const syncSingleToFirebase = async (path: string, item: any) => {
  if (!rtdb || !item) return;
  try {
    const cleanItem = sanitizeForFirebase(item);
    const id = cleanItem && cleanItem.id ? String(cleanItem.id) : null;
    if (id) {
      const itemRef = ref(rtdb, `${path}/${id}`);
      await set(itemRef, cleanItem);
    } else {
      const dbRef = ref(rtdb, path);
      await set(dbRef, cleanItem);
    }
  } catch (err) {
    console.error(`Firebase Single Sync Error at ${path}:`, err);
  }
};

export const syncSingleToFirestore = async (collectionName: string, item: any) => {
  if (!db || !item || !item.id) return;
  try {
    const cleanItem = sanitizeForFirebase(item);
    const docRef = doc(db, collectionName, String(cleanItem.id));
    await setDoc(docRef, cleanItem, { merge: true });
  } catch (err) {
    console.error(`Firestore Single Sync Error at ${collectionName}/${item.id}:`, err);
  }
};

export const deleteFromFirebase = async (path: string, itemId: string) => {
  if (!rtdb || !itemId) return;
  try {
    const itemRef = ref(rtdb, `${path}/${String(itemId)}`);
    await remove(itemRef);
  } catch (err) {
    console.error(`Firebase Delete Error at ${path}/${itemId}:`, err);
  }
};

export const syncToFirebase = async (path: string, data: any) => {
  if (!rtdb) return;
  try {
    const cleanData = sanitizeForFirebase(data);
    const dbRef = ref(rtdb, path);
    if (Array.isArray(cleanData)) {
      const objData: Record<string, any> = {};
      cleanData.forEach((item, idx) => {
        if (item && item.id) {
          objData[String(item.id)] = item;
        } else {
          objData[String(idx)] = item;
        }
      });
      await set(dbRef, objData);
    } else {
      await set(dbRef, cleanData);
    }
  } catch (err) {
    console.error(`Firebase Sync Error at ${path}:`, err);
  }
};

export const syncToFirestore = async (collectionName: string, data: any[]) => {
  if (!db || !Array.isArray(data)) return;
  try {
    const cleanArray = sanitizeForFirebase(data);
    for (const item of cleanArray) {
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



