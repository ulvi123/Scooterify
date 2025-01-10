import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };



//Here I am initalizing the app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

//Time to authenticate with services

export const loginUser = async (email, password) => {
  try {
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCreds.user.getIdToken();
    return { user: userCreds.user, idToken: idToken };
  } catch (error) {
    throw new Error("Authentication failed: " + error.message);
  }
};

export const registerUser = async (email, password) => {
  try {
    const userCreds = await createUserWithEmailAndPassword(email, password);
    const idToken = await userCreds.user.getIdToken;
    return { user: userCreds.user, idToken: idToken };
  } catch (error) {
    throw new Error("Registration failed:" + error.message);
  }
};

export const logOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error("Logout failed:" + error.message);
  }
};
