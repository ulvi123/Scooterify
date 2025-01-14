import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore,setDoc,doc } from "firebase/firestore";
import axios from 'axios'
// import axiosInstance from "./axiosInstance";

const firebaseConfig = {
  apiKey: "AIzaSyBkzyBRsID1KQLPRFKKeNtVvyUwDL-1iuo",
  authDomain: "scooterapp-df4cd.firebaseapp.com",
  projectId: "scooterapp-df4cd",
  storageBucket: "scooterapp-df4cd.firebasestorage.app",
  messagingSenderId: "541244127051",
  appId: "1:541244127051:web:af5f36c8a90ad30e565ace",
  measurementId: "G-306BECXV7P",
};

//Here I am initalizing the app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


export const loginUser = async (email, password) => {
  try {
    // Authenticate with Firebase
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCreds.user.getIdToken();
  

    localStorage.setItem('authToken', idToken);

    console.log("Token stored in localStorage:", idToken ? idToken.substring(0, 20) + "..." : "No token stored");

    // Call backend login endpoint
    const response = await fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to login with backend");
    }

    const userData = await response.json();

    return {
      user: userCreds.user,
      idToken,
      userData,
      message: null
    };
  } catch (error) {
    console.error("Login Error:", error);
    return {
      user: null,
      userData: null,
      idToken: null,
      message: error.message,
    };
  }
};


export const registerUser = async (email, password, additionalData = {}) => {
  try {
    // Create authentication account
    const userCreds = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get the ID token
    const idToken = await userCreds.user.getIdToken();

    // Prepare user data
    const userData = {
      id: userCreds.user.uid,
      email: userCreds.user.email,
      name: additionalData.name,
      activeVehicle: null,
    };

    await setDoc(doc(db, "users", userCreds.user.uid), userData);

    // Send data to your backend with Axios
    const response = await axios.post("http://localhost:8080/users/register", userData, {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${idToken}`,
      },
    });

    if (!response.data.success) { 
      throw new Error("Failed to register user with backend");
    }

    return {
      user: userCreds.user,
      idToken,
      userData,
      message: "Registration successful",
    };
  } catch (error) {
    console.error("Registration Error:", error);
    return {
      user: null,
      userData: null,
      idToken: null,
      message: error.message || "An error occurred during registration",
    };
  }
};


export const logOutUser = async () => {
  try {
    await signOut(auth);
    return { message: null };
  } catch (error) {
    console.error("Logout Error:", error);
    return { message: error.message };
  }
};
