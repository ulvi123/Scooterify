import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import axios from "axios";
// import axiosInstance from "./axiosInstance";

//IMPORTANT:Please uncomment this while testing, for some unknown software issue fetching the env variables from .env file was not working

// const firebaseConfig = {
//   apiKey: "AIzaSyBkzyBRsID1KQLPRFKKeNtVvyUwDL-1iuo",
//   authDomain: "scooterapp-df4cd.firebaseapp.com",
//   projectId: "scooterapp-df4cd",
//   storageBucket: "scooterapp-df4cd.firebasestorage.app",
//   messagingSenderId: "541244127051",
//   appId: "1:541244127051:web:af5f36c8a90ad30e565ace",
//   measurementId: "G-306BECXV7P",
// };

//Here I am initalizing the app
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const loginUser = async (email, password) => {
  try {
    // Authenticate with Firebase
    const userCreds = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCreds.user.getIdToken();

    localStorage.setItem("authToken", idToken);

    console.log(
      "Token stored in localStorage:",
      idToken ? idToken.substring(0, 20) + "..." : "No token stored"
    );

    // Call backend login endpoint
    const response = await fetch("http://localhost:8080/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("Authorization")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to login with backend");
    }

    const userData = await response.json();

    console.log("Token sent to backend: ", localStorage.getItem("Authorization"));


    return {
      user: userCreds.user,
      idToken,
      userData,
      message: null,
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
    //validating here the inputs I entered in UI

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    if (!additionalData.name) {
      throw new Error("Name is required");
    }

    // Auth part
    const userCreds = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Get the ID token
    const idToken = await userCreds.user.getIdToken();

    // Prepare user data
    const userData = {
      // id: userCreds.user.uid,
      email: userCreds.user.email,
      name: additionalData.name,
      activeVehicle: null,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "users", userCreds.user.uid), userData);
    } catch (firestoreError) {
      await userCreds.user.delete();
      throw new Error("Failed to save user data: " + firestoreError.message);
    }

    // Send data to your backend with Axios

    const response = await axios.post(
      "http://localhost:8080/users/register",
      userData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.message || "Failed to register user with backend"
      );
    }

    return {
      user: userCreds.user,
      idToken,
      userData,
      message: "Registration successful",
    };
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
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
