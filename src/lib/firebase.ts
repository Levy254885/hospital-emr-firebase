import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCAe5JZQFQhDpzV-lAjiZGzP-uqA5f5R6E',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hospitalmanagement-system-ke.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hospitalmanagement-system-ke',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hospitalmanagement-system-ke.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '186525212144',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:186525212144:web:56c00c66dfb5bcb1ee5135',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-KS1RHFS83E',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export default app
