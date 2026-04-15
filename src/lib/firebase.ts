'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// NOTA: El dominio .appspot.com es el identificador correcto que el SDK de cliente
// espera para el storageBucket, aunque en la consola de GCloud aparezca como .firebasestorage.app.
// Ambas direcciones apuntan al mismo recurso.
const firebaseConfig = {
  apiKey: "AIzaSyCDy-W8_3sB3WS8gVKZuzV_P6PdG1tBOUc",
  authDomain: "actracker-master.firebaseapp.com",
  projectId: "actracker-master",
  storageBucket: "actracker-master.appspot.com",
  messagingSenderId: "660718374201",
  appId: "1:660718374201:web:4889a6d15d8aee23ddace8"
};


// Initialize Firebase
// Using a singleton pattern to avoid re-initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
