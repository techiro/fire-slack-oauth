// Initialize Cloud Firestore through Firebase
import { initializeApp, getApps } from "@firebase/app";
import { getFirestore, Firestore } from "@firebase/firestore";
import { Auth, getAuth } from "firebase/auth";

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID!,
};

//MARK: initializeAppを宣言
const app = initializeApp(firebaseConfig);

export const slackAppAuth = getAuth(app);

export const slackInfoDB = getFirestore(app);

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
};
