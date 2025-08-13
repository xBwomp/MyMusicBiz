// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCmcbgA9pnPyAkupIibgLdiQrtZ-yvqYj8",
  authDomain: "band-and-beyond.firebaseapp.com",
  projectId: "band-and-beyond",
  storageBucket: "band-and-beyond.firebasestorage.app",
  messagingSenderId: "404680247338",
  appId: "1:404680247338:web:618451db707d71ad431b53",
  measurementId: "G-ZBCL9QVP29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
