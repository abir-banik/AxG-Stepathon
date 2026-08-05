import { User, StepEntry, Team, AnnouncementBanner } from './types';
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
const ANNOUNCEMENT_DOC_ID = '_announcement';
const LOCAL_STORAGE_KEY = 'tea_o_race_data';
const LOCAL_TEAMS_KEY = 'tea_o_teams_data';
const LOCAL_ANNOUNCEMENT_KEY = 'tea_o_announcement_data';

// Internal listener queues
const listeners: ((users: User[], isOnline: boolean) => void)[] = [];
const teamListeners: ((teams: Team[]) => void)[] = [];
const announcementListeners: ((announcement: AnnouncementBanner | null) => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;
let unsubscribeTeamsSnapshot: (() => void) | null = null;
let unsubscribeAnnouncementSnapshot: (() => void) | null = null;
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

const DEFAULT_ANNOUNCEMENT: AnnouncementBanner = {
  message: "📢 Welcome to the 2nd Annual Global Stepathon! Remember to log your daily steps and submit by Monday 8:00 PM ET for weekly awards!",
  type: "info",
  active: true,
  updatedAt: "2026-07-22T00:00:00.000Z"
};

const getLocalAnnouncement = (): AnnouncementBanner => {
  try {
    const data = localStorage.getItem(LOCAL_ANNOUNCEMENT_KEY);
    return data ? JSON.parse(data) : DEFAULT_ANNOUNCEMENT;
  } catch { return DEFAULT_ANNOUNCEMENT; }
};

const saveLocalAnnouncement = (announcement: AnnouncementBanner | null) => {
  if (announcement) {
    localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(announcement));
  } else {
    localStorage.removeItem(LOCAL_ANNOUNCEMENT_KEY);
  }
  announcementListeners.forEach(cb => cb(announcement));
};

const startAnnouncementSnapshotListener = () => {
  if (unsubscribeAnnouncementSnapshot) unsubscribeAnnouncementSnapshot();

  const docRef = doc(db, RACERS_COLLECTION, ANNOUNCEMENT_DOC_ID);
  unsubscribeAnnouncementSnapshot = onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data() as AnnouncementBanner;
      localStorage.setItem(LOCAL_ANNOUNCEMENT_KEY, JSON.stringify(data));
      announcementListeners.forEach(cb => cb(data));
    } else {
      announcementListeners.forEach(cb => cb(DEFAULT_ANNOUNCEMENT));
    }
  }, (error) => {
    console.warn("Announcement Firebase Error (Using Local):", error.message);
    announcementListeners.forEach(cb => cb(getLocalAnnouncement()));
  });
};

const GOOGLE_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#A142F4', '#FF6D00', '#00BFA5', '#F4511E'];

const startTeamsSnapshotListener = () => {
  if (unsubscribeTeamsSnapshot) unsubscribeTeamsSnapshot();

  const q = collection(db, TEAMS_COLLECTION);
  unsubscribeTeamsSnapshot = onSnapshot(q, async (snapshot) => {
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Team);

    // Auto-heal: If Cloud Firestore teams collection is empty, rebuild and push all teams from racers data!
    if (teams.length === 0) {
      try {
        let teamsToSync: { id: string; name: string; color: string; iconId: string; location: string }[] = [];
        const localTeams = getLocalTeams();

        if (localTeams.length > 0) {
          teamsToSync = localTeams.map(t => ({
            id: t.id || `team-${t.name.toLowerCase().replace(/\s+/g, '-')}`,
            name: t.name,
            color: t.color || '#4285F4',
            iconId: t.iconId || 'trophy',
            location: t.location || 'na'
          }));
        } else {
          // Extract team names from Cloud Firestore racers collection
          const racersSnap = await getDocs(collection(db, RACERS_COLLECTION));
          const teamMap = new Map<string, { id: string; name: string }>();
          
          racersSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            const tn = data.teamName?.trim();
            if (tn && tn !== 'N/A' && tn !== 'Independent') {
              const tid = data.teamId || `team-${tn.toLowerCase().replace(/\s+/g, '-')}`;
              if (!teamMap.has(tn)) {
                teamMap.set(tn, { id: tid, name: tn });
              }
            }
          });

          let colorIdx = 0;
          teamMap.forEach((val) => {
            teamsToSync.push({
              id: val.id,
              name: val.name,
              color: GOOGLE_COLORS[colorIdx % GOOGLE_COLORS.length],
              iconId: 'trophy',
              location: 'na'
            });
            colorIdx++;
          });
        }

        if (teamsToSync.length > 0) {
          const batch = writeBatch(db);
          teamsToSync.forEach((t) => {
            const teamRef = doc(db, TEAMS_COLLECTION, t.id);
            batch.set(teamRef, {
              name: t.name,
              color: t.color,
              iconId: t.iconId,
              location: t.location,
              createdAt: serverTimestamp()
            }, { merge: true });
          });
          await batch.commit();
          console.log(`Auto-reconstructed and synced ${teamsToSync.length} teams to Cloud Firestore!`);
          return;
        }
      } catch (e) {
        console.warn("Failed to auto-reconstruct teams in Cloud Firestore", e);
      }
    }

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
      const users = snapshot.docs
        .filter(doc => !doc.id.startsWith('_'))
        .map(doc => {
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

  // Subscribe to real-time event announcement
  subscribeToAnnouncement(callback: (announcement: AnnouncementBanner | null) => void): () => void {
    announcementListeners.push(callback);
    if (announcementListeners.length === 1) {
      startAnnouncementSnapshotListener();
    } else {
      callback(getLocalAnnouncement());
    }
    return () => {
      const idx = announcementListeners.indexOf(callback);
      if (idx !== -1) announcementListeners.splice(idx, 1);
    };
  },

  // Update Announcement Banner (Admin only)
  async updateAnnouncement(announcement: AnnouncementBanner): Promise<boolean> {
    const dataToSave: AnnouncementBanner = {
      ...announcement,
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(db, RACERS_COLLECTION, ANNOUNCEMENT_DOC_ID);
      await setDoc(docRef, dataToSave, { merge: true });
      saveLocalAnnouncement(dataToSave);
      return true;
    } catch (e) {
      console.warn("Firebase Announcement Write Failed, fallback to local", e);
      saveLocalAnnouncement(dataToSave);
      return true;
    }
  },

  // Create a new Team (Admin only)
  async addTeam(name: string, color: string, iconId: string, location?: string, lat?: number, lng?: number): Promise<Team | null> {
    const newTeamBase = {
      name,
      color: color || '#4285F4',
      iconId: iconId || 'trophy',
      location: location || '',
      ...(typeof lat === 'number' ? { lat } : {}),
      ...(typeof lng === 'number' ? { lng } : {})
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
    startAnnouncementSnapshotListener();
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

  // Add steps to an existing user for a specific week (Max 30,000 steps per entry for participants, host override allows up to 200,000)
  async addSteps(userId: string, steps: number, week: number, customDate?: string, bypassMaxLimit: boolean = false): Promise<User | null> {
    const MAX_STEPS_PER_ENTRY = bypassMaxLimit ? 200000 : 30000;
    const validSteps = Math.min(Math.max(0, Math.floor(Number(steps) || 0)), MAX_STEPS_PER_ENTRY);
    const validWeek = Math.min(Math.max(1, Math.floor(Number(week) || 1)), 12);

    if (validSteps <= 0 || !userId) return null;

    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const entryDate = customDate ? customDate.substring(0, 10) : localToday;
    const submittedAt = now.toISOString();

    const newEntry: StepEntry = {
      amount: validSteps,
      date: entryDate,
      week: validWeek,
      submittedAt
    };

    try {
      const userRef = doc(db, RACERS_COLLECTION, userId);
      const snap = await getDoc(userRef);
      
      let newHistory: StepEntry[] = [newEntry];
      if (snap.exists()) {
        const userData = snap.data() as User;
        const currentHistory = Array.isArray(userData.stepHistory) ? userData.stepHistory : [];
        // Replace any existing entry for the same date with the most recent submission
        const historyWithoutSameDate = currentHistory.filter(e => e.date !== entryDate);
        newHistory = [...historyWithoutSameDate, newEntry];
      }

      // Self-healing totals: always re-sum stepHistory
      const newTotalSteps = newHistory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const newWeeklySteps: Record<string, number> = {};
      newHistory.forEach(e => {
        const wk = String(e.week || 1);
        newWeeklySteps[wk] = (newWeeklySteps[wk] || 0) + (Number(e.amount) || 0);
      });

      await updateDoc(userRef, {
        steps: newTotalSteps,
        weeklySteps: newWeeklySteps,
        stepHistory: newHistory,
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
        if (!user.stepHistory) user.stepHistory = [];
        // Replace any existing entry for the same date with the most recent submission
        user.stepHistory = user.stepHistory.filter(e => e.date !== entryDate);
        user.stepHistory.push(newEntry);
        
        user.steps = user.stepHistory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        user.weeklySteps = {};
        user.stepHistory.forEach(e => {
          const wk = String(e.week || 1);
          user.weeklySteps![wk] = (user.weeklySteps![wk] || 0) + (Number(e.amount) || 0);
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
      
      const newHistory = [...history];
      newHistory.splice(entryIndex, 1);
      
      // Self-healing totals: re-sum remaining stepHistory
      const newTotalSteps = newHistory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const newWeeklySteps: Record<string, number> = {};
      newHistory.forEach(e => {
        const wk = String(e.week || 1);
        newWeeklySteps[wk] = (newWeeklySteps[wk] || 0) + (Number(e.amount) || 0);
      });

      // Write back the full update
      await updateDoc(userRef, {
        steps: newTotalSteps,
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
             user.stepHistory.splice(entryIndex, 1);
             user.steps = user.stepHistory.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
             user.weeklySteps = {};
             user.stepHistory.forEach(e => {
               const wk = String(e.week || 1);
               user.weeklySteps![wk] = (user.weeklySteps![wk] || 0) + (Number(e.amount) || 0);
             });
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
  },

  // Database Healing Migration: Normalize dates to YYYY-MM-DD and recompute all totals from stepHistory
  async healAllRacerData(): Promise<{ success: boolean; healedCount: number }> {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let healedCount = 0;

    try {
      const querySnapshot = await getDocs(collection(db, RACERS_COLLECTION));
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((docSnapshot) => {
        const userData = docSnapshot.data() as User;
        const history = Array.isArray(userData.stepHistory) ? userData.stepHistory : [];

        let needsUpdate = false;
        const normalizedHistory: StepEntry[] = history.map((entry) => {
          const rawDate = entry.date || localToday;
          const cleanDate = rawDate.length > 10 ? rawDate.substring(0, 10) : rawDate;
          const cleanAmount = Math.max(0, Math.floor(Number(entry.amount) || 0));
          if (cleanDate !== rawDate || cleanAmount !== entry.amount) {
            needsUpdate = true;
          }
          return {
            ...entry,
            date: cleanDate,
            amount: cleanAmount
          };
        });

        const recomputedTotal = normalizedHistory.reduce((sum, e) => sum + e.amount, 0);
        const recomputedWeekly: Record<string, number> = {};
        normalizedHistory.forEach((e) => {
          const wk = String(e.week || 1);
          recomputedWeekly[wk] = (recomputedWeekly[wk] || 0) + e.amount;
        });

        if (userData.steps !== recomputedTotal || JSON.stringify(userData.weeklySteps || {}) !== JSON.stringify(recomputedWeekly)) {
          needsUpdate = true;
        }

        if (needsUpdate) {
          const userRef = doc(db, RACERS_COLLECTION, docSnapshot.id);
          batch.update(userRef, {
            steps: recomputedTotal,
            weeklySteps: recomputedWeekly,
            stepHistory: normalizedHistory,
            lastUpdated: serverTimestamp()
          });
          healedCount++;
        }
      });

      if (healedCount > 0) {
        await batch.commit();
      }

      const localUsers = getLocalUsers();
      let localHealed = false;
      localUsers.forEach(u => {
        const history = Array.isArray(u.stepHistory) ? u.stepHistory : [];
        const normHist = history.map(e => ({
          ...e,
          date: (e.date || localToday).substring(0, 10),
          amount: Math.max(0, Math.floor(Number(e.amount) || 0))
        }));
        const total = normHist.reduce((sum, e) => sum + e.amount, 0);
        const weekly: Record<string, number> = {};
        normHist.forEach(e => {
          const wk = String(e.week || 1);
          weekly[wk] = (weekly[wk] || 0) + e.amount;
        });
        u.stepHistory = normHist;
        u.steps = total;
        u.weeklySteps = weekly;
        localHealed = true;
      });
      if (localHealed) {
        saveLocalUsers(localUsers);
      }

      return { success: true, healedCount };
    } catch (e) {
      console.warn("Firestore data heal failed (Offline fallback)", e);
      const localUsers = getLocalUsers();
      localUsers.forEach(u => {
        const history = Array.isArray(u.stepHistory) ? u.stepHistory : [];
        const normHist = history.map(e => ({
          ...e,
          date: (e.date || localToday).substring(0, 10),
          amount: Math.max(0, Math.floor(Number(e.amount) || 0))
        }));
        const total = normHist.reduce((sum, e) => sum + e.amount, 0);
        const weekly: Record<string, number> = {};
        normHist.forEach(e => {
          const wk = String(e.week || 1);
          weekly[wk] = (weekly[wk] || 0) + e.amount;
        });
        u.stepHistory = normHist;
        u.steps = total;
        u.weeklySteps = weekly;
      });
      saveLocalUsers(localUsers);
      return { success: true, healedCount: localUsers.length };
    }
  }
};