import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyD5lEZ12lTdwFyuAKMuLwIb6GHQibzw9TE",
  authDomain: "habit-tracker-ae7ac.firebaseapp.com",
  projectId: "habit-tracker-ae7ac",
  storageBucket: "habit-tracker-ae7ac.firebasestorage.app",
  messagingSenderId: "449609726101",
  appId: "1:449609726101:web:89538262277028bb33c39c"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db };