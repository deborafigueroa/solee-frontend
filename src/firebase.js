import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC2M80NVuAoYr8ycWB6Px5oDgcu7PMTTmQ",
  authDomain: "solee-4e28e.firebaseapp.com",
  projectId: "solee-4e28e",
  storageBucket: "solee-4e28e.firebasestorage.app",
  messagingSenderId: "426253432845",
  appId: "1:426253432845:web:00d203d4f3a3a7c7dabd44",
};

export const VAPID_KEY =
  "BOeIlPREbGlByqyPOK7wBGdBLz43UNoOOi9aa0NY8JpV_kp5yc2WEpFnWrjd7amRiOE_3CvfOOMYyTxnDZFgYSY";

const app = initializeApp(firebaseConfig);

export const obtenerMessaging = () => getMessaging(app);

export const pushSoportado = async () => {
  try {
    return (await isSupported()) && "Notification" in window && "serviceWorker" in navigator;
  } catch (e) {
    return false;
  }
};