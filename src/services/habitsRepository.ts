import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNextChapter, getPreviousChapter, ScripturePosition } from "./scriptures";
import { db, auth } from "./firebase";
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

const HABITS_STORAGE_KEY = "@habits_list";
const HISTORY_STORAGE_KEY = "@habits_history";

export interface SubTask {
  id: string;
  title: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  reminderTime?: string; // "HH:MM" e.g., "08:30"
  reminderId?: string; // scheduled notification ID
  isScriptureSync: boolean;
  scriptureVolume?: string; // "bofm", "nt", "ot", etc.
  scriptureBook?: string; // "1-ne", "matt", etc.
  scriptureChapter?: number; // 1, 2, ...
  subtasks?: SubTask[];
  streak: number;
  lastCompletedDate?: string; // "YYYY-MM-DD"
  createdAt: number;
}

export interface CompletionDetail {
  completed: boolean;
  completedChapter?: string; // e.g. "Alma 30" or section number
  completedBook?: string;    // e.g. "alma"
  completedVolume?: string;  // e.g. "bofm"
  completedSubtasks?: string[]; // list of completed subtask IDs
}

export interface HabitsHistory {
  [dateString: string]: {
    [habitId: string]: CompletionDetail;
  };
}

const formatDate = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates current streak for a habit
 */
export function calculateStreak(habitId: string, history: HabitsHistory): number {
  let streak = 0;
  const checkDate = new Date();
  
  const todayStr = formatDate(checkDate);
  const completedToday = history[todayStr]?.[habitId]?.completed;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);
  const completedYesterday = history[yesterdayStr]?.[habitId]?.completed;
  
  // If not completed today and not completed yesterday, streak is 0
  if (!completedToday && !completedYesterday) {
    return 0;
  }
  
  const dateToVerify = new Date(completedToday ? checkDate : yesterday);
  
  // Limit to avoid infinite loop just in case
  for (let i = 0; i < 3650; i++) {
    const verifyStr = formatDate(dateToVerify);
    if (history[verifyStr]?.[habitId]?.completed) {
      streak++;
      dateToVerify.setDate(dateToVerify.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Syncs local habits and history to Firebase if authenticated
 */
async function syncToFirebase(habits: Habit[], history: HabitsHistory) {
  const user = auth?.currentUser;
  if (!user || !db) return;

  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      lastSynced: Date.now()
    }, { merge: true });

    // Sync habits collection
    for (const habit of habits) {
      const habitRef = doc(db, "users", user.uid, "habits", habit.id);
      await setDoc(habitRef, habit);
    }

    // Sync history
    const historyRef = doc(db, "users", user.uid, "history", "all");
    await setDoc(historyRef, history);

    console.log("Firebase sync completed successfully.");
  } catch (error) {
    console.warn("Failed to sync data to Firebase:", error);
  }
}

/**
 * Repository interface for managing habits
 */
export const habitsRepository = {
  /**
   * Fetch all habits (merges from Firebase if authenticated)
   */
  async getHabits(): Promise<Habit[]> {
    try {
      const localHabitsStr = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      let habits: Habit[] = localHabitsStr ? JSON.parse(localHabitsStr) : [];

      const user = auth?.currentUser;
      if (user && db) {
        try {
          const habitsColRef = collection(db, "users", user.uid, "habits");
          const querySnapshot = await getDocs(habitsColRef);
          const remoteHabits: Habit[] = [];
          querySnapshot.forEach((doc) => {
            remoteHabits.push(doc.data() as Habit);
          });

          if (remoteHabits.length > 0) {
            // Simple merge: remote wins or we union them
            const mergedMap = new Map<string, Habit>();
            habits.forEach(h => mergedMap.set(h.id, h));
            remoteHabits.forEach(h => mergedMap.set(h.id, h));
            habits = Array.from(mergedMap.values());
            
            // Save merged list locally
            await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
          }
        } catch (firebaseErr) {
          console.warn("Firestore habits read failed, using local cache:", firebaseErr);
        }
      }

      // Roll over scripture chapters if completed on a previous day
      const todayStr = formatDate(new Date());
      let hasUpdates = false;
      for (const habit of habits) {
        if (habit.isScriptureSync && habit.lastCompletedDate && habit.lastCompletedDate < todayStr) {
          const nextPos = getNextChapter({
            volumeSlug: habit.scriptureVolume || "",
            bookSlug: habit.scriptureBook || "",
            chapter: habit.scriptureChapter || 1
          });
          if (nextPos) {
            habit.scriptureBook = nextPos.bookSlug;
            habit.scriptureVolume = nextPos.volumeSlug;
            habit.scriptureChapter = nextPos.chapter;
          }
          habit.lastCompletedDate = undefined;
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
        // Push the rolled-over chapters to firebase
        if (user && db) {
          try {
            for (const h of habits) {
              const habitRef = doc(db, "users", user.uid, "habits", h.id);
              await setDoc(habitRef, h);
            }
          } catch (err) {
            console.warn("Failed to sync rolled-over chapters to cloud:", err);
          }
        }
      }

      return habits;
    } catch (error) {
      console.error("Failed to load habits:", error);
      return [];
    }
  },

  /**
   * Saves or updates a single habit
   */
  async saveHabit(habit: Habit): Promise<Habit[]> {
    try {
      const habits = await this.getHabits();
      const existingIndex = habits.findIndex(h => h.id === habit.id);

      if (existingIndex > -1) {
        habits[existingIndex] = habit;
      } else {
        habits.push(habit);
      }

      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      
      const history = await this.getHistory();
      await syncToFirebase(habits, history);
      return habits;
    } catch (error) {
      console.error("Failed to save habit:", error);
      return [];
    }
  },

  /**
   * Deletes a habit
   */
  async deleteHabit(habitId: string): Promise<Habit[]> {
    try {
      let habits = await this.getHabits();
      habits = habits.filter(h => h.id !== habitId);
      
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));

      const user = auth?.currentUser;
      if (user && db) {
        try {
          const habitRef = doc(db, "users", user.uid, "habits", habitId);
          await deleteDoc(habitRef);
        } catch (e) {
          console.warn("Could not delete habit from Firestore:", e);
        }
      }

      const history = await this.getHistory();
      await syncToFirebase(habits, history);
      return habits;
    } catch (error) {
      console.error("Failed to delete habit:", error);
      return [];
    }
  },

  /**
   * Fetches completion history
   */
  async getHistory(): Promise<HabitsHistory> {
    try {
      const localHistoryStr = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      let history: HabitsHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};

      const user = auth?.currentUser;
      if (user && db) {
        try {
          const historyRef = doc(db, "users", user.uid, "history", "all");
          const snap = await getDoc(historyRef);
          if (snap.exists()) {
            const remoteHistory = snap.data() as HabitsHistory;
            // Merge history keys
            history = { ...history, ...remoteHistory };
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
          }
        } catch (firebaseErr) {
          console.warn("Firestore history read failed, using local cache:", firebaseErr);
        }
      }

      return history;
    } catch (error) {
      console.error("Failed to load history:", error);
      return {};
    }
  },

  /**
   * Toggles habit completion for a specific date.
   * Handles scripture auto-advancing and streak updates.
   */
  async toggleHabitCompletion(
    habitId: string,
    dateString: string
  ): Promise<{ habits: Habit[]; history: HabitsHistory }> {
    try {
      const habits = await this.getHabits();
      const history = await this.getHistory();
      const habit = habits.find(h => h.id === habitId);

      if (!habit) return { habits, history };

      const isCompleted = history[dateString]?.[habitId]?.completed || false;

      if (!history[dateString]) {
        history[dateString] = {};
      }

      if (!isCompleted) {
        // Complete the habit
        const detail: CompletionDetail = { completed: true };

        // If the habit has subtasks, mark all of them as completed
        if (habit.subtasks && habit.subtasks.length > 0) {
          detail.completedSubtasks = habit.subtasks.map(s => s.id);
        }

        if (habit.isScriptureSync && habit.scriptureVolume && habit.scriptureBook && habit.scriptureChapter) {
          // Store completion details so we can revert it later if unchecked
          detail.completedVolume = habit.scriptureVolume;
          detail.completedBook = habit.scriptureBook;
          detail.completedChapter = `${habit.scriptureBook} ${habit.scriptureChapter}`;
        }

        history[dateString][habitId] = detail;
        habit.lastCompletedDate = dateString;
      } else {
        // Uncomplete the habit
        delete history[dateString][habitId];
        if (Object.keys(history[dateString]).length === 0) {
          delete history[dateString];
        }
      }

      // Recompute streak for the habit
      habit.streak = calculateStreak(habitId, history);

      // Save updated structures
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

      // Sync to Firebase
      await syncToFirebase(habits, history);

      return { habits, history };
    } catch (error) {
      console.error("Failed to toggle habit completion:", error);
      const habits = await this.getHabits();
      const history = await this.getHistory();
      return { habits, history };
    }
  },

  /**
   * Toggles completion status of a specific subtask.
   * Auto-completes the parent habit if all subtasks are finished.
   */
  async toggleSubtaskCompletion(
    habitId: string,
    subtaskId: string,
    dateString: string
  ): Promise<{ habits: Habit[]; history: HabitsHistory }> {
    try {
      const habits = await this.getHabits();
      const history = await this.getHistory();
      const habit = habits.find(h => h.id === habitId);

      if (!habit || !habit.subtasks || habit.subtasks.length === 0) {
        return { habits, history };
      }

      if (!history[dateString]) {
        history[dateString] = {};
      }

      let detail = history[dateString][habitId];
      if (!detail) {
        detail = { completed: false, completedSubtasks: [] };
      }
      if (!detail.completedSubtasks) {
        detail.completedSubtasks = [];
      }

      const subtaskIdx = detail.completedSubtasks.indexOf(subtaskId);
      const wasCompleted = detail.completed;

      if (subtaskIdx === -1) {
        // Check subtask
        detail.completedSubtasks.push(subtaskId);
      } else {
        // Uncheck subtask
        detail.completedSubtasks.splice(subtaskIdx, 1);
      }

      // The main habit is complete if all subtasks are checked
      const allComplete = detail.completedSubtasks.length === habit.subtasks.length;

      if (allComplete && !wasCompleted) {
        detail.completed = true;
        habit.lastCompletedDate = dateString;

        // Auto-advance scripture sync if enabled
        if (habit.isScriptureSync && habit.scriptureVolume && habit.scriptureBook && habit.scriptureChapter) {
          detail.completedVolume = habit.scriptureVolume;
          detail.completedBook = habit.scriptureBook;
          detail.completedChapter = `${habit.scriptureBook} ${habit.scriptureChapter}`;
        }
      } else if (!allComplete && wasCompleted) {
        detail.completed = false;
      }

      // If no subtasks are completed and main is unchecked, remove log to keep clean
      if (detail.completedSubtasks.length === 0 && !detail.completed) {
        delete history[dateString][habitId];
        if (Object.keys(history[dateString]).length === 0) {
          delete history[dateString];
        }
      } else {
        history[dateString][habitId] = detail;
      }

      // Recompute streak
      habit.streak = calculateStreak(habitId, history);

      // Save
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      
      // Sync
      await syncToFirebase(habits, history);

      return { habits, history };
    } catch (error) {
      console.error("Failed to toggle subtask completion:", error);
      const habits = await this.getHabits();
      const history = await this.getHistory();
      return { habits, history };
    }
  },

  /**
   * Manually changes the chapter (advances or steps back) without checking off the daily habit.
   */
  async updateScriptureChapter(
    habitId: string,
    direction: "next" | "prev"
  ): Promise<Habit[]> {
    try {
      const habits = await this.getHabits();
      const habit = habits.find(h => h.id === habitId);

      if (!habit || !habit.isScriptureSync || !habit.scriptureVolume || !habit.scriptureBook || !habit.scriptureChapter) {
        return habits;
      }

      const currentPos: ScripturePosition = {
        volumeSlug: habit.scriptureVolume,
        bookSlug: habit.scriptureBook,
        chapter: habit.scriptureChapter
      };

      const newPos = direction === "next" 
        ? getNextChapter(currentPos) 
        : getPreviousChapter(currentPos);

      if (newPos) {
        habit.scriptureBook = newPos.bookSlug;
        habit.scriptureVolume = newPos.volumeSlug;
        habit.scriptureChapter = newPos.chapter;

        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
        const history = await this.getHistory();
        await syncToFirebase(habits, history);
      }

      return habits;
    } catch (error) {
      console.error("Failed to update scripture chapter:", error);
      return [];
    }
  },

  /**
   * Pushes the current local habits cache and history to the cloud
   */
  async syncLocalDataToCloud(): Promise<void> {
    try {
      const localHabitsStr = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      const habits: Habit[] = localHabitsStr ? JSON.parse(localHabitsStr) : [];
      
      const localHistoryStr = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const history: HabitsHistory = localHistoryStr ? JSON.parse(localHistoryStr) : {};

      if (habits.length > 0 || Object.keys(history).length > 0) {
        await syncToFirebase(habits, history);
        console.log("Local habits sync pushed successfully.");
      }
    } catch (error) {
      console.error("Failed to force local to cloud sync:", error);
    }
  }
};
