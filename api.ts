import { User, StepEntry, Team } from './types';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, 
  updateDoc, deleteDoc, increment, arrayUnion, 
  onSnapshot, serverTimestamp, getDocs, doc, getDoc, setDoc, writeBatch
} from 'firebase/firestore';

// Configuration provided by user
const firebaseConfig = {
  apiKey: "AIzaSyBscaY5kkaXkea9ZFoMeqYNvmCnVEVeTfs",
  authDomain: "tea-and-o-amazing-race.firebaseapp.com",
  projectId: "tea-and-o-amazing-race",
  storageBucket: "tea-and-o-amazing-race.firebasestorage.app",
  messagingSenderId: "138999611724",
  appId: "1:138999611724:web:2698b10f0cff7b3ea74fe9",
  measurementId: "G-B0KZL6PPC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const RACERS_COLLECTION = 'racers';
const TEAMS_COLLECTION = 'teams';
const LOCAL_STORAGE_KEY = 'tea_o_race_data';
const LOCAL_TEAMS_KEY = 'tea_o_teams_data';

// Internal listener queues
const listeners: ((users: User[], isOnline: boolean) => void)[] = [];
const teamListeners: ((teams: Team[]) => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;
let unsubscribeTeamsSnapshot: (() => void) | null = null;
let isOfflineMode = false;

// --- LOCAL STORAGE HELPERS ---
const getLocalUsers = (): User[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    const users = data ? JSON.parse(data) : [];
    // Sanitize data
    return users.map((u: any) => ({
      ...u,
      steps: typeof u.steps === 'number' ? u.steps : 0,
      stepHistory: Array.isArray(u.stepHistory) 
        ? u.stepHistory.map((e: any) => ({ ...e, amount: typeof e.amount === 'number' ? e.amount : 0 }))
        : []
    }));
  } catch { return []; }
};

const saveLocalUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  // Notify listeners with offline status
  listeners.forEach(cb => cb(users, false));
};

const getLocalTeams = (): Team[] => {
  try {
    const data = localStorage.getItem(LOCAL_TEAMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveLocalTeams = (teams: Team[]) => {
  localStorage.setItem(LOCAL_TEAMS_KEY, JSON.stringify(teams));
  teamListeners.forEach(cb => cb(teams));
};

const startTeamsSnapshotListener = () => {
  if (unsubscribeTeamsSnapshot) unsubscribeTeamsSnapshot();

  const q = collection(db, TEAMS_COLLECTION);
  unsubscribeTeamsSnapshot = onSnapshot(q, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Team);
    localStorage.setItem(LOCAL_TEAMS_KEY, JSON.stringify(teams));
    teamListeners.forEach(cb => cb(teams));
  }, (error) => {
    console.warn("Teams Firebase Error (Using Local):", error.message);
    teamListeners.forEach(cb => cb(getLocalTeams()));
  });
};

// Internal function to start the snapshot listener
const startSnapshotListener = () => {
  if (unsubscribeSnapshot) unsubscribeSnapshot(); // Clear existing

  const q = collection(db, RACERS_COLLECTION);
  
  unsubscribeSnapshot = onSnapshot(q, 
    (snapshot) => {
      // Success! Connection is live.
      isOfflineMode = false;
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            // Ensure steps is a number
            steps: typeof data.steps === 'number' ? data.steps : 0,
            // Sanitize stepHistory
            stepHistory: Array.isArray(data.stepHistory) 
              ? data.stepHistory.map((e: any) => ({ ...e, amount: typeof e.amount === 'number' ? e.amount : 0 }))
              : []
        } as User;
      });
      
      // Update local storage backup
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
      
      // Notify listeners
      listeners.forEach(cb => cb(users, true));
    }, 
    (error) => {
      console.warn("Firebase Error (Switching to Offline Mode):", error.message);
      isOfflineMode = true;
      
      // If we failed, serve local data immediately
      const localData = getLocalUsers();
      listeners.forEach(cb => cb(localData, false));
    }
  );
};

export const api = {
  // Subscribe to real-time updates
  subscribeToUsers(callback: (users: User[], isOnline: boolean) => void): () => void {
    listeners.push(callback);

    // If this is the first listener, start the connection
    if (listeners.length === 1) {
      startSnapshotListener();
    } else {
       // Send immediate cached response
       if (isOfflineMode) {
         callback(getLocalUsers(), false);
       } 
    }

    return () => {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  },

  // Subscribe to real-time teams
  subscribeToTeams(callback: (teams: Team[]) => void): () => void {
    teamListeners.push(callback);
    if (teamListeners.length === 1) {
      startTeamsSnapshotListener();
    } else {
      callback(getLocalTeams());
    }
    return () => {
      const idx = teamListeners.indexOf(callback);
      if (idx !== -1) teamListeners.splice(idx, 1);
    };
  },

  // Create a new Team (Admin only)
  async addTeam(name: string, color: string, iconId: string): Promise<Team | null> {
    const newTeamBase = {
      name,
      color: color || '#4285F4',
      iconId: iconId || 'trophy',
    };
    try {
      const docRef = await addDoc(collection(db, TEAMS_COLLECTION), {
        ...newTeamBase,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...newTeamBase } as Team;
    } catch (e) {
      console.warn("Firebase Team Write Failed, fallback to local", e);
      const localTeams = getLocalTeams();
      const newTeam = { ...newTeamBase, id: `team-local-${Date.now()}` };
      localTeams.push(newTeam);
      saveLocalTeams(localTeams);
      return newTeam;
    }
  },

  // Delete a Team (Admin only)
  async deleteTeam(teamId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, TEAMS_COLLECTION, teamId));
      return true;
    } catch (e) {
      console.warn("Delete team failed, fallback to local", e);
      const localTeams = getLocalTeams().filter(t => t.id !== teamId);
      saveLocalTeams(localTeams);
      return true;
    }
  },

  // Manual Retry
  retryConnection() {
    isOfflineMode = false;
    startSnapshotListener();
    startTeamsSnapshotListener();
  },

  // Create a new user
  // WE ALWAYS TRY FIREBASE FIRST NOW, REGARDLESS OF PREVIOUS STATUS
  async addUser(name: string, teamName: string, iconId: string, teamId?: string): Promise<User | null> {
    const newUserBase = {
      name,
      teamId: teamId || "",
      teamName: teamName || "",
      iconId,
      steps: 0,
      weeklySteps: {}, // Initialize empty map
      stepHistory: [],
    };

    try {
      const docRef = await addDoc(collection(db, RACERS_COLLECTION), {
        ...newUserBase,
        createdAt: serverTimestamp()
      });
      
      // If we get here, Firebase is working! Reset offline mode if it was set.
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }
      
      return { id: docRef.id, ...newUserBase } as User;
    } catch (e) {
      console.warn("Firebase Write Failed, switching to fallback", e);
      isOfflineMode = true;
      
      // Fallback Implementation
      const localUsers = getLocalUsers();
      const newUser = { 
        ...newUserBase, 
        id: `local-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      localUsers.push(newUser);
      saveLocalUsers(localUsers);
      return newUser;
    }
  },

  // Add steps to an existing user for a specific week (Max 50,000 steps per entry)
  async addSteps(userId: string, steps: number, week: number, customDate?: string): Promise<User | null> {
    const MAX_STEPS_PER_ENTRY = 50000; // 25 miles max single entry
    const validSteps = Math.min(Math.max(0, Math.floor(Number(steps) || 0)), MAX_STEPS_PER_ENTRY);
    const validWeek = Math.min(Math.max(1, Math.floor(Number(week) || 1)), 12);

    if (validSteps <= 0 || !userId) return null;

    const entryDate = customDate 
      ? (customDate.includes('T') ? customDate : new Date(`${customDate}T12:00:00`).toISOString()) 
      : new Date().toISOString();

    try {
      const userRef = doc(db, RACERS_COLLECTION, userId);
      
      // We update the specific week key (e.g., "weeklySteps.1") and the total steps
      await updateDoc(userRef, {
        steps: increment(validSteps),
        [`weeklySteps.${validWeek}`]: increment(validSteps),
        stepHistory: arrayUnion({
          amount: validSteps,
          date: entryDate,
          week: validWeek
        }),
        lastUpdated: serverTimestamp()
      });
      
      // Heal connection if needed
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }

      return { id: userId } as User; 
    } catch (e) {
      console.warn("Firebase Write Failed, switching to fallback", e);
      isOfflineMode = true;
      
      // Fallback Implementation
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => u.id === userId);
      if (user) {
        user.steps += validSteps;
        
        // Init weeklySteps if missing in local
        if (!user.weeklySteps) user.weeklySteps = {};
        const currentWeekSteps = user.weeklySteps[validWeek] || 0;
        user.weeklySteps[validWeek] = currentWeekSteps + validSteps;

        if (!user.stepHistory) user.stepHistory = [];
        user.stepHistory.push({
          amount: validSteps,
          date: entryDate,
          week: validWeek
        });
        saveLocalUsers(localUsers);
        return user;
      }
      return null;
    }
  },

  // Remove a specific step entry and recalculate totals
  async removeStepEntry(userId: string, entryIndex: number): Promise<boolean> {
    try {
      const userRef = doc(db, RACERS_COLLECTION, userId);
      
      // We need to fetch the document to modify the array and recalculate
      const snap = await getDoc(userRef);
      if (!snap.exists()) throw new Error("User not found");
      
      const userData = snap.data() as User;
      const history = userData.stepHistory || [];
      
      if (entryIndex < 0 || entryIndex >= history.length) return false;
      
      const entryToRemove = history[entryIndex];
      const newHistory = [...history];
      newHistory.splice(entryIndex, 1);
      
      // Calculate new totals using subtraction
      const currentTotal = userData.steps || 0;
      const newTotal = Math.max(0, currentTotal - entryToRemove.amount);

      const currentWeekly = userData.weeklySteps || {};
      const weekKey = entryToRemove.week || 1;
      const currentWeekVal = currentWeekly[weekKey] || 0;
      const newWeekVal = Math.max(0, currentWeekVal - entryToRemove.amount);
      
      const newWeeklySteps = { ...currentWeekly, [weekKey]: newWeekVal };

      // Write back the full update
      await updateDoc(userRef, {
        steps: newTotal,
        weeklySteps: newWeeklySteps,
        stepHistory: newHistory,
        lastUpdated: serverTimestamp()
      });

      return true;
    } catch (e) {
      console.warn("Firebase Delete Log Failed, switching to fallback", e);
      isOfflineMode = true;
      
      // Fallback
      const localUsers = getLocalUsers();
      const user = localUsers.find(u => u.id === userId);
      if (user && user.stepHistory) {
         if (entryIndex >= 0 && entryIndex < user.stepHistory.length) {
             const entry = user.stepHistory[entryIndex];
             // Update local state
             user.steps = Math.max(0, user.steps - entry.amount);
             if (user.weeklySteps && entry.week) {
                 user.weeklySteps[entry.week] = Math.max(0, (user.weeklySteps[entry.week] || 0) - entry.amount);
             }
             user.stepHistory.splice(entryIndex, 1);
             saveLocalUsers(localUsers);
             return true;
         }
      }
      return false;
    }
  },

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, RACERS_COLLECTION, userId));
      
      if (isOfflineMode) {
        isOfflineMode = false;
        startSnapshotListener();
      }
      
      return true;
    } catch (e) {
      console.warn("Delete failed", e);
      isOfflineMode = true;
      
      // Fallback Implementation
      const localUsers = getLocalUsers();
      const filtered = localUsers.filter(u => u.id !== userId);
      saveLocalUsers(filtered);
      return true;
    }
  },

  // --- WIPE EVERYTHING ---
  async resetRace(): Promise<void> {
    // 1. Always wipe local storage immediately
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_TEAMS_KEY);
    
    // 2. Notify listeners immediately to clear UI
    listeners.forEach(cb => cb([], isOfflineMode));
    teamListeners.forEach(cb => cb([]));

    try {
      // 3. Try to wipe Firestore Racers
      const querySnapshot = await getDocs(collection(db, RACERS_COLLECTION));
      const deletePromises = querySnapshot.docs.map((docSnapshot) => 
        deleteDoc(doc(db, RACERS_COLLECTION, docSnapshot.id))
      );
      await Promise.all(deletePromises);
      
      // 4. Try to wipe Firestore Teams
      const teamsSnapshot = await getDocs(collection(db, TEAMS_COLLECTION));
      const deleteTeamPromises = teamsSnapshot.docs.map((docSnapshot) => 
        deleteDoc(doc(db, TEAMS_COLLECTION, docSnapshot.id))
      );
      await Promise.all(deleteTeamPromises);

    } catch (e) {
      console.error("Firebase Reset failed (Offline?)", e);
    }
  }
};