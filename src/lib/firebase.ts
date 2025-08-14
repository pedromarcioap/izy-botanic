
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0W-3nWoYYZH0jxEVYNxfvIlF-HRGYYug",
  authDomain: "psiquizz-ai.firebaseapp.com",
  projectId: "psiquizz-ai",
  storageBucket: "psiquizz-ai.appspot.com",
  messagingSenderId: "838473924801",
  appId: "1:838473924801:web:9d8c67c1f333e666a19440"
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
