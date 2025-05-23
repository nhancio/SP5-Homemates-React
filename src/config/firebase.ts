import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAEYzOzpxmPdqB0XE-p_YhSfhU02KxiyEw",
  authDomain: "homemates-app.firebaseapp.com",
  projectId: "homemates-app",
  storageBucket: "homemates-app.firebasestorage.app",
  messagingSenderId: "399242916006",
  appId: "1:399242916006:web:50da7d420d1d13c00c8467",
  measurementId: "G-KV3MV7TMJ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Add scopes for profile info
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
