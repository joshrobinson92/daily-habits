import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Flame, BookOpen, Bell, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react-native";
import { Habit } from "../services/habitsRepository";
import { getReadingUrl, getScriptureNames } from "../services/scriptures";
import { COLORS, GLASS_STYLE } from "../styles/theme";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  completedSubtasks: string[];
  onToggle: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDelete: () => void;
  onAdjustScripture: (direction: "next" | "prev") => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompleted,
  completedSubtasks = [],
  onToggle,
  onToggleSubtask,
  onDelete,
  onAdjustScripture
}) => {
  const accentColor = habit.isScriptureSync ? COLORS.accentScripture : COLORS.accentHabit;
  const targetUrl = habit.isScriptureSync && habit.scriptureVolume && habit.scriptureBook && habit.scriptureChapter
    ? getReadingUrl({
        volumeSlug: habit.scriptureVolume,
        bookSlug: habit.scriptureBook,
        chapter: habit.scriptureChapter
      })
    : null;

  const handleOpenLink = () => {
    if (targetUrl) {
      Linking.openURL(targetUrl).catch((err) =>
        console.error("Failed to open scripture reading URL:", err)
      );
    }
  };

  const getScriptureDisplay = () => {
    if (!habit.isScriptureSync) return "";
    const names = getScriptureNames(habit.scriptureVolume || "", habit.scriptureBook || "");
    return `${names.bookName} ${habit.scriptureChapter}`;
  };

  return (
    <View style={[styles.card, GLASS_STYLE]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{habit.title}</Text>
          {habit.reminderTime && (
            <View style={styles.reminderRow}>
              <Bell size={12} color={COLORS.textSecondary} style={styles.iconSpacing} />
              <Text style={styles.reminderText}>{habit.reminderTime}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.checkbox, 
            { borderColor: accentColor },
            isCompleted && { backgroundColor: COLORS.accentSuccess, borderColor: COLORS.accentSuccess }
          ]} 
          onPress={onToggle}
          activeOpacity={0.7}
        >
          {isCompleted && <Check size={16} color="#000000" strokeWidth={3} />}
        </TouchableOpacity>
      </View>

      {/* Scripture Sync Section */}
      {habit.isScriptureSync && (
        <View style={styles.scriptureSection}>
          <View style={styles.scriptureHeader}>
            <BookOpen size={14} color={COLORS.accentScripture} style={styles.iconSpacing} />
            <Text style={styles.scriptureLabel}>Current Chapter:</Text>
          </View>
          
          <View style={styles.scriptureControlRow}>
            <TouchableOpacity 
              style={styles.adjustButton} 
              onPress={() => onAdjustScripture("prev")}
              activeOpacity={0.6}
            >
              <ChevronLeft size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.scriptureLinkButton, { borderColor: COLORS.accentScripture + "30" }]} 
              onPress={handleOpenLink}
              activeOpacity={0.7}
            >
              <Text style={styles.scriptureLinkText}>{getScriptureDisplay()}</Text>
              <Text style={styles.readLabel}>Read ↗</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.adjustButton} 
              onPress={() => onAdjustScripture("next")}
              activeOpacity={0.6}
            >
              <ChevronRight size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Subtasks Section */}
      {habit.subtasks && habit.subtasks.length > 0 && (
        <View style={styles.subtasksSection}>
          <View style={styles.subtasksProgressRow}>
            <Text style={styles.subtasksProgressText}>
              {completedSubtasks.length} of {habit.subtasks.length} subtasks done
            </Text>
            <View style={styles.progressBarBg}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${(completedSubtasks.length / habit.subtasks.length) * 100}%`,
                    backgroundColor: accentColor
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.subtasksList}>
            {habit.subtasks.map((sub) => {
              const isSubCompleted = completedSubtasks.includes(sub.id);
              return (
                <TouchableOpacity
                  key={sub.id}
                  style={styles.subtaskItem}
                  onPress={() => onToggleSubtask(sub.id)}
                  activeOpacity={0.7}
                >
                  <View 
                    style={[
                      styles.subtaskCheckbox,
                      { borderColor: accentColor + "60" },
                      isSubCompleted && { backgroundColor: accentColor, borderColor: accentColor }
                    ]}
                  >
                    {isSubCompleted && <Check size={10} color="#000000" strokeWidth={4} />}
                  </View>
                  <Text 
                    style={[
                      styles.subtaskText,
                      isSubCompleted && { color: COLORS.textSecondary, textDecorationLine: "line-through" }
                    ]}
                  >
                    {sub.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Footer Info (Streaks & Delete) */}
      <View style={styles.footer}>
        <View style={styles.streakContainer}>
          <Flame 
            size={16} 
            color={habit.streak > 0 ? "#F97316" : COLORS.textSecondary} 
            fill={habit.streak > 0 ? "#F97316" : "none"}
            style={styles.iconSpacing} 
          />
          <Text style={[styles.streakText, habit.streak > 0 && { color: "#F97316", fontWeight: "600" }]}>
            {habit.streak} day streak
          </Text>
        </View>

        <TouchableOpacity 
          onPress={onDelete} 
          style={styles.deleteButton}
          activeOpacity={0.6}
        >
          <Trash2 size={15} color={COLORS.accentDanger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reminderText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  iconSpacing: {
    marginRight: 6,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scriptureSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  scriptureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  scriptureLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scriptureControlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adjustButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scriptureLinkButton: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: "rgba(167, 139, 250, 0.08)",
    borderWidth: 1,
    borderRadius: 8,
    height: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  scriptureLinkText: {
    color: COLORS.accentScripture,
    fontWeight: "600",
    fontSize: 14,
  },
  readLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  deleteButton: {
    padding: 6,
  },
  subtasksSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  subtasksProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  subtasksProgressText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 2,
    marginLeft: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  subtasksList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  subtaskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  subtaskText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: "500",
  }
});
