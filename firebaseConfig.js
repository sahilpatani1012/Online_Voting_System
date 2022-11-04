import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "voting-system-2a23c.firebaseapp.com",
  projectId: "voting-system-2a23c",
  storageBucket: "voting-system-2a23c.appspot.com",
  messagingSenderId: "757535716389",
  appId: "1:757535716389:web:bb10fc644515070d6d7bcc"
};

// Initialize Firebase
export const application = initializeApp(firebaseConfig);
export const database = getFirestore(application);