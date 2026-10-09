import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBr2C0xk4v-rZh6fp5Kjt3jn32yQdrtUWY",
  authDomain: "zamzam-f3743.firebaseapp.com",
  projectId: "zamzam-f3743",
  storageBucket: "zamzam-f3743.firebasestorage.app",
  messagingSenderId: "623469472656",
  appId: "1:623469472656:web:863d91c53e07a62491e115"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
