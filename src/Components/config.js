import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyAepkghKQ-dChhCqHcoE1AUkRHrNnpbms4",
  authDomain: "mezbaan-839a7.firebaseapp.com",
  projectId: "mezbaan-839a7",
  storageBucket: "mezbaan-839a7.firebasestorage.app",
  messagingSenderId: "770959712309",
  appId: "1:770959712309:web:9b975adc91164d2cbfd17c",
  measurementId: "G-NKQ0TYYTJR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export {auth,provider};