import { auth, db } from "./config"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from "firebase/auth"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  Timestamp,
} from "firebase/firestore"
import type { Habit, HabitLog, Task, Profile } from "@/lib/types"

// Auth functions
export const firebaseAuth = {
  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
  },

  signUp: async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Update user profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
      
      // Create profile document in Firestore
      await setDoc(doc(db, "profiles", userCredential.user.uid), {
        id: userCredential.user.uid,
        email: userCredential.user.email,
        display_name: displayName,
        created_at: Timestamp.now().toDate().toISOString(),
      })
    }
    
    return userCredential
  },

  signOut: async () => {
    return await signOut(auth)
  },

  getCurrentUser: () => {
    return auth.currentUser
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback)
  },
}

// Database functions
export const firebaseDB = {
  // Habits
  getHabits: async (userId: string): Promise<Habit[]> => {
    const q = query(
      collection(db, "habits"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Habit))
  },

  addHabit: async (habit: Omit<Habit, "id" | "created_at">) => {
    const docRef = await addDoc(collection(db, "habits"), {
      ...habit,
      created_at: Timestamp.now().toDate().toISOString(),
    })
    return docRef.id
  },

  deleteHabit: async (habitId: string) => {
    await deleteDoc(doc(db, "habits", habitId))
  },

  // Habit Logs
  getHabitLogs: async (userId: string): Promise<HabitLog[]> => {
    const q = query(
      collection(db, "habit_logs"),
      where("user_id", "==", userId),
      orderBy("date", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HabitLog))
  },

  upsertHabitLog: async (log: Omit<HabitLog, "id" | "created_at">) => {
    // Check if log exists for this habit and date
    const q = query(
      collection(db, "habit_logs"),
      where("habit_id", "==", log.habit_id),
      where("date", "==", log.date)
    )
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      // Update existing log
      const docId = querySnapshot.docs[0].id
      await updateDoc(doc(db, "habit_logs", docId), {
        status: log.status,
      })
      return docId
    } else {
      // Create new log
      const docRef = await addDoc(collection(db, "habit_logs"), {
        ...log,
        created_at: Timestamp.now().toDate().toISOString(),
      })
      return docRef.id
    }
  },

  // Tasks
  getTasks: async (userId: string): Promise<Task[]> => {
    const q = query(
      collection(db, "tasks"),
      where("user_id", "==", userId),
      orderBy("date", "desc")
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Task))
  },

  addTask: async (task: Omit<Task, "id" | "created_at">) => {
    const docRef = await addDoc(collection(db, "tasks"), {
      ...task,
      created_at: Timestamp.now().toDate().toISOString(),
    })
    return docRef.id
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, "tasks", taskId), updates)
  },

  deleteTask: async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId))
  },

  // Profile
  getProfile: async (userId: string): Promise<Profile | null> => {
    const docRef = doc(db, "profiles", userId)
    const docSnap = await getDocs(query(collection(db, "profiles"), where("id", "==", userId)))
    
    if (!docSnap.empty) {
      return { id: docSnap.docs[0].id, ...docSnap.docs[0].data() } as Profile
    }
    return null
  },
}

export { auth, db }