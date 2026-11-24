import { initializeApp, getApps, getApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZQsK2eUqzohu1291nuFv9ioH1wsvIfHk",
  authDomain: "vitale-b5e74.firebaseapp.com",
  projectId: "vitale-b5e74",
  storageBucket: "vitale-b5e74.firebasestorage.app",
  messagingSenderId: "882455064065",
  appId: "1:882455064065:web:8533d12fbdb71473dd5a00",
  measurementId: "G-STJC5CSQ8P"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };