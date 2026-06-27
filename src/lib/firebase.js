import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyDJdX1lcGLB35TG4FFxkFPxIhJtvpnhyZU",
  authDomain:        "drivo-project-6f3fd.firebaseapp.com",
  projectId:         "drivo-project-6f3fd",
  storageBucket:     "drivo-project-6f3fd.firebasestorage.app",
  messagingSenderId: "961325177377",
  appId:             "1:961325177377:web:3c702f8dd143d08693a160",
};

const app = initializeApp(firebaseConfig);
export const db   = getFirestore(app);
export const auth = getAuth(app);