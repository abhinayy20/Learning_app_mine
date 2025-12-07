// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJ_jy0nXMUDSk_uOljiqfpU-aKaV0Pq-E",
    authDomain: "learningplatform-60397.firebaseapp.com",
    projectId: "learningplatform-60397",
    storageBucket: "learningplatform-60397.firebasestorage.app",
    messagingSenderId: "992020721312",
    appId: "1:992020721312:web:869700850aae86ecf4e3c5",
    measurementId: "G-DMPMFHYVD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
