import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_8dx04HAZEE53LfP3UoCr9zfg3JN0FNc",
  authDomain: "goose-o-meter.firebaseapp.com",
  projectId: "goose-o-meter",
  storageBucket: "goose-o-meter.firebasestorage.app",
  messagingSenderId: "290117349926",
  appId: "1:290117349926:web:bce59782fa4b8dadfb2ce7",
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const firestore = getFirestore(app);
export const storage = getStorage(app);
