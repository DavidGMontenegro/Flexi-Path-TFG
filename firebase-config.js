import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "---",
  authDomain: "---.firebaseapp.com",
  projectId: "---",
  storageBucket: "---.appspot.com",
  messagingSenderId: "---",
  appId: "---:---:---:---"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const FIRESTORE_DB = getFirestore(FIREBASE_APP);
const FIRESTORE_STORAGE = getStorage(FIREBASE_APP);

export { FIREBASE_APP, FIREBASE_AUTH, FIRESTORE_DB, FIRESTORE_STORAGE };
