import React, { useState, useEffect } from "react";
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  ActivityIndicator, 
  Platform 
} from "react-native";
import { Plus, ListTodo, BarChart3, CloudLightning, Compass } from "lucide-react-native";
import { Habit, habitsRepository, HabitsHistory } from "./src/services/habitsRepository";
import { scheduleHabitReminder, cancelHabitReminder } from "./src/services/reminders";
import { setWidgetData, reloadAllWidgets } from "./src/modules/WidgetBridge";
import { HabitCard } from "./src/components/HabitCard";
import { HabitCreator } from "./src/components/HabitCreator";
import { HistoryDashboard } from "./src/components/HistoryDashboard";
import { AuthSync } from "./src/components/AuthSync";
import { auth } from "./src/services/firebase";
import { COLORS, GLASS_STYLE } from "./src/styles/theme";

export default function App() {
  const [activeTab, setActiveTab] = useState<"today" | "progress" | "sync">("today");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [history, setHistory] = useState<HabitsHistory>({});
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);

  // Format YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const habitsList = await habitsRepository.getHabits();
      const historyLog = await habitsRepository.getHistory();
      setHabits(habitsList);
      setHistory(historyLog);
      
      // If user is authenticated, sync local cached data to Firestore
      if (auth?.currentUser) {
        await habitsRepository.syncLocalDataToCloud();
      }

      // Update widgets with the latest state
      await setWidgetData(habitsList, historyLog);
      await reloadAllWidgets();
    } catch (e) {
      console.error("Failed to load repo data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    const todayStr = getTodayStr();
    
    // Optimistic state updates
    const isCompleted = !!history[todayStr]?.[habitId]?.completed;
    
    const { habits: updatedHabits, history: updatedHistory } = 
      await habitsRepository.toggleHabitCompletion(habitId, todayStr);
      
    setHabits(updatedHabits);
    setHistory(updatedHistory);

    // Sync to widgets
    await setWidgetData(updatedHabits, updatedHistory);
    await reloadAllWidgets();
  };

  const handleAdjustScripture = async (habitId: string, direction: "next" | "prev") => {
    const updatedHabits = await habitsRepository.updateScriptureChapter(habitId, direction);
    setHabits(updatedHabits);

    // Sync to widgets
    await setWidgetData(updatedHabits, history);
    await reloadAllWidgets();
  };

  const handleDeleteHabit = async (habit: Habit) => {
    // 1. Cancel notification if exists
    if (habit.reminderId) {
      await cancelHabitReminder(habit.reminderId);
    }
    
    // 2. Delete from repository
    const updatedHabits = await habitsRepository.deleteHabit(habit.id);
    setHabits(updatedHabits);

    // Sync to widgets
    await setWidgetData(updatedHabits, history);
    await reloadAllWidgets();
  };

  const handleCreateHabit = async (habitData: {
    title: string;
    frequency: "daily" | "weekly" | "monthly";
    reminderTime?: string;
    isScriptureSync: boolean;
    scriptureVolume?: string;
    scriptureBook?: string;
    scriptureChapter?: number;
  }) => {
    const id = `habit-${Date.now()}`;
    
    // Schedule notification if requested
    let reminderId: string | undefined;
    if (habitData.reminderTime) {
      reminderId = await scheduleHabitReminder(id, habitData.title, habitData.reminderTime);
    }

    const newHabit: Habit = {
      id,
      title: habitData.title,
      frequency: habitData.frequency,
      reminderTime: habitData.reminderTime,
      reminderId,
      isScriptureSync: habitData.isScriptureSync,
      scriptureVolume: habitData.scriptureVolume,
      scriptureBook: habitData.scriptureBook,
      scriptureChapter: habitData.scriptureChapter,
      streak: 0,
      createdAt: Date.now()
    };

    const updatedHabits = await habitsRepository.saveHabit(newHabit);
    setHabits(updatedHabits);
    setShowCreator(false);

    // Sync to widgets
    await setWidgetData(updatedHabits, history);
    await reloadAllWidgets();
  };

  // Compute progress variables
  const todayStr = getTodayStr();
  const completedTodayCount = habits.filter(h => !!history[todayStr]?.[h.id]?.completed).length;
  const totalHabitsCount = habits.length;

  const renderTodayList = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.accentHabit} />
        </View>
      );
    }

    if (totalHabitsCount === 0) {
      return (
        <View style={[styles.emptyContainer, GLASS_STYLE]}>
          <Compass size={40} color={COLORS.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Welcome to Daily Habits</Text>
          <Text style={styles.emptySubtitle}>
            Start tracking your daily targets, scriptures, and routines. Create your first habit below to begin.
          </Text>
          <TouchableOpacity 
            style={styles.createFirstBtn} 
            onPress={() => setShowCreator(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#000000" strokeWidth={3} style={{ marginRight: 6 }} />
            <Text style={styles.createFirstBtnText}>Create a Habit</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.scrollList} 
        contentContainerStyle={styles.scrollListContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today Header Box */}
        <View style={[styles.summaryBanner, GLASS_STYLE]}>
          <View>
            <Text style={styles.bannerTitle}>Today's Target</Text>
            <Text style={styles.bannerSubtitle}>
              {completedTodayCount} of {totalHabitsCount} habits completed
            </Text>
          </View>
          <View style={[styles.progressRing, { borderColor: completedTodayCount === totalHabitsCount && totalHabitsCount > 0 ? COLORS.accentSuccess : COLORS.accentHabit }]}>
            <Text style={styles.progressText}>
              {totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0}%
            </Text>
          </View>
        </View>

        {habits.map((habit) => {
          const isCompleted = !!history[todayStr]?.[habit.id]?.completed;
          return (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={isCompleted}
              onToggle={() => handleToggleHabit(habit.id)}
              onDelete={() => handleDeleteHabit(habit)}
              onAdjustScripture={(dir) => handleAdjustScripture(habit.id, dir)}
            />
          );
        })}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "today":
        return renderTodayList();
      case "progress":
        return <HistoryDashboard habits={habits} history={history} />;
      case "sync":
        return <AuthSync onAuthChange={loadData} />;
    }
  };

  if (showCreator) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" />
        <HabitCreator onSave={handleCreateHabit} onCancel={() => setShowCreator(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      
      {/* App Main Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>DAILY</Text>
        <Text style={styles.headerLogoSub}>HABITS</Text>
      </View>

      {/* Main View Area */}
      <View style={styles.mainContainer}>
        {renderTabContent()}
      </View>

      {/* Floating Add Habit Button (Only visible on Today List) */}
      {activeTab === "today" && habits.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setShowCreator(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#000000" strokeWidth={3} />
        </TouchableOpacity>
      )}

      {/* Navigation Tabs Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === "today" && styles.tabItemActive]}
          onPress={() => setActiveTab("today")}
        >
          <ListTodo size={20} color={activeTab === "today" ? COLORS.accentHabit : COLORS.textSecondary} />
          <Text style={[styles.tabLabel, activeTab === "today" && { color: COLORS.accentHabit }]}>Today</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === "progress" && styles.tabItemActive]}
          onPress={() => setActiveTab("progress")}
        >
          <BarChart3 size={20} color={activeTab === "progress" ? COLORS.accentScripture : COLORS.textSecondary} />
          <Text style={[styles.tabLabel, activeTab === "progress" && { color: COLORS.accentScripture }]}>Streaks</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, activeTab === "sync" && styles.tabItemActive]}
          onPress={() => setActiveTab("sync")}
        >
          <CloudLightning size={20} color={activeTab === "sync" ? COLORS.accentSuccess : COLORS.textSecondary} />
          <Text style={[styles.tabLabel, activeTab === "sync" && { color: COLORS.accentSuccess }]}>Backup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerLogo: {
    color: COLORS.accentScripture,
    fontWeight: "900",
    fontSize: 22,
    letterSpacing: 2,
  },
  headerLogoSub: {
    color: COLORS.textPrimary,
    fontWeight: "300",
    fontSize: 22,
    letterSpacing: 2,
    marginLeft: 4,
  },
  mainContainer: {
    flex: 1,
  },
  scrollList: {
    flex: 1,
  },
  scrollListContent: {
    padding: 16,
    paddingBottom: 80,
  },
  summaryBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: "rgba(56, 189, 248, 0.05)",
    borderColor: "rgba(56, 189, 248, 0.15)",
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  progressRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontSize: 13,
  },
  emptyContainer: {
    margin: 20,
    marginTop: 60,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 24,
  },
  createFirstBtn: {
    backgroundColor: COLORS.accentHabit,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  createFirstBtnText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: COLORS.accentHabit,
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  tabBar: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === "ios" ? 10 : 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  tabItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  tabLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});
