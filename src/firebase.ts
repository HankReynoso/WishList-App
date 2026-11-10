import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getReactNativePersistence } from '@firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const fresh = getApps().length === 0;
const app = fresh
  ? initializeApp({
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    })
  : getApps()[0];

// initializeAuth throws if it runs twice, which fast refresh would trigger.
export const auth = fresh
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);
export const db = getFirestore(app);
