import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Award, Calendar, CheckCircle2, TrendingUp } from "lucide-react-native";
import { Habit, HabitsHistory } from "../services/habitsRepository";
import { COLORS, GLASS_STYLE } from "../styles/theme";

interface HistoryDashboardProps {
  habits: Habit[];
  history: HabitsHistory;
}

export const HistoryDashboard: React.FC<HistoryDashboardProps> = ({ habits, history }) => {
  // Format YYYY-MM-DD
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDayName = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (formatDate(date) === formatDate(today)) return "Today";
    if (formatDate(date) === formatDate(yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  // Generate list of the past 10 days
  const pastDays: Date[] = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    pastDays.push(d);
  }

  // Calculate statistics
  const totalActiveHabits = habits.length;
  const bestStreak = habits.reduce((max, h) => (h.streak > max ? h.streak : max), 0);
  
  // Total completions ever logged
  let totalCompletions = 0;
  Object.values(history).forEach((dayHabits) => {
    Object.values(dayHabits).forEach((detail) => {
      if (detail.completed) totalCompletions++;
    });
  });

  // Today's completion percentage
  const todayStr = formatDate(new Date());
  const todayCompletions = history[todayStr] 
    ? Object.keys(history[todayStr]).filter(id => habits.some(h => h.id === id)).length 
    : 0;
  const todayCompletionRate = totalActiveHabits > 0 
    ? Math.round((todayCompletions / totalActiveHabits) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Progress Dashboard</Text>

      {/* Stats Summary Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, GLASS_STYLE]}>
          <TrendingUp size={20} color={COLORS.accentHabit} style={styles.statIcon} />
          <Text style={styles.statValue}>{bestStreak}</Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={[styles.statCard, GLASS_STYLE]}>
          <Award size={20} color={COLORS.accentScripture} style={styles.statIcon} />
          <Text style={styles.statValue}>{totalCompletions}</Text>
          <Text style={styles.statLabel}>Total Done</Text>
        </View>

        <View style={[styles.statCard, GLASS_STYLE]}>
          <CheckCircle2 size={20} color={COLORS.accentSuccess} style={styles.statIcon} />
          <Text style={styles.statValue}>{todayCompletionRate}%</Text>
          <Text style={styles.statLabel}>Today's Rate</Text>
        </View>
      </View>

      {/* Completion Calendar Log */}
      <View style={[styles.section, GLASS_STYLE]}>
        <View style={styles.sectionHeader}>
          <Calendar size={18} color={COLORS.textPrimary} style={styles.iconSpacing} />
          <Text style={styles.sectionTitle}>10-Day Completion History</Text>
        </View>

        {pastDays.map((date, idx) => {
          const dateStr = formatDate(date);
          const dayCompletions = history[dateStr] || {};
          
          // Habits completed on this specific day
          const completedList = habits.filter(h => dayCompletions[h.id]?.completed);
          const completionRatioText = totalActiveHabits > 0 
            ? `${completedList.length}/${totalActiveHabits}`
            : "0/0";

          return (
            <View key={dateStr} style={[styles.dayRow, idx === pastDays.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={styles.dayInfo}>
                <Text style={styles.dayName}>{getDayName(date)}</Text>
                <Text style={styles.dayRatio}>{completionRatioText} habits completed</Text>
              </View>

              <View style={styles.dayDetails}>
                {completedList.length === 0 ? (
                  <Text style={styles.noHabitsText}>No habits checked off</Text>
                ) : (
                  <View style={styles.badgesContainer}>
                    {completedList.map(h => {
                      const detail = dayCompletions[h.id];
                      return (
                        <View 
                          key={h.id} 
                          style={[
                            styles.badge, 
                            { backgroundColor: h.isScriptureSync ? "rgba(167, 139, 250, 0.15)" : "rgba(56, 189, 248, 0.15)" }
                          ]}
                        >
                          <Text 
                            style={[
                              styles.badgeText, 
                              { color: h.isScriptureSync ? COLORS.accentScripture : COLORS.accentHabit }
                            ]}
                          >
                            {h.isScriptureSync && detail?.completedChapter 
                              ? `📖 ${detail.completedChapter}`
                              : h.title
                            }
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
    paddingVertical: 14,
  },
  statIcon: {
    marginBottom: 6,
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 10,
  },
  iconSpacing: {
    marginRight: 8,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  dayRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: "flex-start",
  },
  dayInfo: {
    width: 100,
    marginRight: 10,
  },
  dayName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  dayRatio: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  dayDetails: {
    flex: 1,
  },
  noHabitsText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  }
});
