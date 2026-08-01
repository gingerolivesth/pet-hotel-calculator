// ──────────────────────────────────────────────
// Firebase initialization & Firestore re-exports
// ──────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, getDocs, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const app = initializeApp({
  apiKey:            "AIzaSyAwr2gxcnAnsf6Jss_-anoVFMUnzD6R3_k",
  authDomain:        "ginger-olives-calculator.firebaseapp.com",
  projectId:         "ginger-olives-calculator",
  storageBucket:     "ginger-olives-calculator.firebasestorage.app",
  messagingSenderId: "918470366561",
  appId:             "1:918470366561:web:8826bd41328cf51da46120",
  measurementId:     "G-JYHXY7RFMZ"
});

const db = getFirestore(app);

export {
  db, collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, getDocs, orderBy, serverTimestamp
};