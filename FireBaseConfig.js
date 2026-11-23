import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "my_api_key",
  authDomain: "sgfloodprep.firebaseapp.com",
  databaseURL:
    "https://sgfloodprep-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sgfloodprep",
  storageBucket: "sgfloodprep.firebasestorage.app",
  messagingSenderId: "345224635699",
  appId: "1:345224635699:web:6ecd6033286e34c4c2ca46",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getDatabase(app);
export const clouddb = getFirestore(app);
export const storage = getStorage(app);

export default app;
