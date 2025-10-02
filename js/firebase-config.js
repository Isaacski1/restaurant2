// firebase-config.js
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDvpv148pehFCPMwuw1hDYPPnWA67EOHOU",
  authDomain: "isaacski-restaurant.firebaseapp.com",
  projectId: "isaacski-restaurant",
  storageBucket: "isaacski-restaurant.firebasestorage.app",
  messagingSenderId: "793597481997",
  appId: "1:793597481997:web:fce9cb43ca442eee7b7144",
  measurementId: "G-CNYCFT8N3F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();