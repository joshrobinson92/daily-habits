import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Flame, BookOpen, Bell, ChevronLeft, ChevronRight, Check, Trash2 } from "lucide-react-native";
import { Habit } from "../services/habitsRepository";
import { getReadingUrl, getScriptureNames } from "../services/scriptures";
import { COLORS, GLASS_STYLE } from "../styles/theme";

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAdjustScripture: (direction: "next" | "prev") => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  isCompleted,
  onToggle,
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
  }
});
