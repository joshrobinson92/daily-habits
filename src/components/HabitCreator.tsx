import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from "react-native";
import { SCRIPTURE_VOLUMES, SCRIPTURE_VOLUMES as volumes } from "../services/scriptures";
import { COLORS, GLASS_STYLE } from "../styles/theme";

interface HabitCreatorProps {
  onSave: (habitData: {
    title: string;
    frequency: "daily" | "weekly" | "monthly";
    reminderTime?: string;
    isScriptureSync: boolean;
    scriptureVolume?: string;
    scriptureBook?: string;
    scriptureChapter?: number;
  }) => void;
  onCancel: () => void;
}

export const HabitCreator: React.FC<HabitCreatorProps> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  
  // Notification / Reminder config
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderHour, setReminderHour] = useState("08");
  const [reminderMinute, setReminderMinute] = useState("00");

  // Scripture Sync config
  const [isScriptureSync, setIsScriptureSync] = useState(false);
  const [selectedVolumeIdx, setSelectedVolumeIdx] = useState(0);
  const [selectedBookIdx, setSelectedBookIdx] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(1);

  const selectedVolume = SCRIPTURE_VOLUMES[selectedVolumeIdx];
  const selectedBook = selectedVolume?.books[selectedBookIdx];

  // Auto-reset book/chapter selectors when volume changes
  useEffect(() => {
    setSelectedBookIdx(0);
    setSelectedChapter(1);
  }, [selectedVolumeIdx]);

  // Auto-reset chapter when book changes
  useEffect(() => {
    setSelectedChapter(1);
  }, [selectedBookIdx]);

  // Generate lists for pickers
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
  const chaptersList = selectedBook 
    ? Array.from({ length: selectedBook.chapters }, (_, i) => i + 1)
    : [];

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a habit title.");
      return;
    }

    const reminderTime = enableReminder ? `${reminderHour}:${reminderMinute}` : undefined;

    onSave({
      title: title.trim(),
      frequency,
      reminderTime,
      isScriptureSync,
      scriptureVolume: isScriptureSync ? selectedVolume.slug : undefined,
      scriptureBook: isScriptureSync ? selectedBook.slug : undefined,
      scriptureChapter: isScriptureSync ? selectedChapter : undefined
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Create New Habit</Text>

      {/* Habit Title Input */}
      <View style={[styles.section, GLASS_STYLE]}>
        <Text style={styles.label}>What is your habit?</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Drink 8 cups of water"
          placeholderTextColor={COLORS.textSecondary}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Frequency Selector */}
      <View style={[styles.section, GLASS_STYLE]}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.btnGroup}>
          {(["daily", "weekly", "monthly"] as const).map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.btnGroupOption,
                frequency === freq && { backgroundColor: COLORS.accentHabit }
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.btnGroupText,
                  frequency === freq && { color: "#000000", fontWeight: "bold" }
                ]}
              >
                {freq.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scripture Sync Option */}
      <View style={[styles.section, GLASS_STYLE]}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Sync with Standard Works (LDS)</Text>
          <TouchableOpacity
            style={[
              styles.switchTrack,
              isScriptureSync && { backgroundColor: COLORS.accentScripture }
            ]}
            onPress={() => setIsScriptureSync(!isScriptureSync)}
          >
            <View style={[styles.switchThumb, isScriptureSync && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        {isScriptureSync && (
          <View style={styles.scriptureConfigContainer}>
            {/* Volume Selection */}
            <Text style={styles.subLabel}>Scripture Volume</Text>
            <View style={styles.selectorGrid}>
              {SCRIPTURE_VOLUMES.map((vol, index) => (
                <TouchableOpacity
                  key={vol.slug}
                  style={[
                    styles.selectorItem,
                    selectedVolumeIdx === index && { borderColor: COLORS.accentScripture, backgroundColor: "rgba(167, 139, 250, 0.15)" }
                  ]}
                  onPress={() => setSelectedVolumeIdx(index)}
                >
                  <Text style={[styles.selectorText, selectedVolumeIdx === index && { color: COLORS.accentScripture }]}>
                    {vol.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Book Selection */}
            <Text style={styles.subLabel}>Book</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {selectedVolume.books.map((book, index) => (
                <TouchableOpacity
                  key={book.slug}
                  style={[
                    styles.selectorItemHorizontal,
                    selectedBookIdx === index && { borderColor: COLORS.accentScripture, backgroundColor: "rgba(167, 139, 250, 0.15)" }
                  ]}
                  onPress={() => setSelectedBookIdx(index)}
                >
                  <Text style={[styles.selectorText, selectedBookIdx === index && { color: COLORS.accentScripture }]}>
                    {book.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Chapter Selection */}
            <Text style={styles.subLabel}>Start Chapter</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {chaptersList.map((chap) => (
                <TouchableOpacity
                  key={chap}
                  style={[
                    styles.selectorItemChapter,
                    selectedChapter === chap && { borderColor: COLORS.accentScripture, backgroundColor: "rgba(167, 139, 250, 0.15)" }
                  ]}
                  onPress={() => setSelectedChapter(chap)}
                >
                  <Text style={[styles.selectorText, selectedChapter === chap && { color: COLORS.accentScripture }]}>
                    {chap}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Reminder Config */}
      <View style={[styles.section, GLASS_STYLE]}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Enable Daily Reminder Alert</Text>
          <TouchableOpacity
            style={[
              styles.switchTrack,
              enableReminder && { backgroundColor: COLORS.accentHabit }
            ]}
            onPress={() => setEnableReminder(!enableReminder)}
          >
            <View style={[styles.switchThumb, enableReminder && styles.switchThumbActive]} />
          </TouchableOpacity>
        </View>

        {enableReminder && (
          <View style={styles.timeConfigContainer}>
            <Text style={styles.subLabel}>Select Time</Text>
            <View style={styles.timePickerRow}>
              {/* Hour Scroll */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnLabel}>Hour</Text>
                <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.pickerItem, reminderHour === h && styles.pickerItemActive]}
                      onPress={() => setReminderHour(h)}
                    >
                      <Text style={styles.pickerItemText}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.timeSeparator}>:</Text>

              {/* Minute Scroll */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerColumnLabel}>Min</Text>
                <ScrollView style={styles.pickerScrollView} nestedScrollEnabled>
                  {minutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, reminderMinute === m && styles.pickerItemActive]}
                      onPress={() => setReminderMinute(m)}
                    >
                      <Text style={styles.pickerItemText}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>CANCEL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>SAVE HABIT</Text>
        </TouchableOpacity>
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
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  subLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 16,
  },
  btnGroup: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: 8,
    padding: 4,
  },
  btnGroupOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  btnGroupText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 2,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    transform: [{ translateX: 0 }],
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  scriptureConfigContainer: {
    marginTop: 8,
  },
  selectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  selectorItem: {
    width: "47%",
    margin: "1.5%",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  selectorItemHorizontal: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  selectorItemChapter: {
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    width: 40,
    height: 40,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  selectorText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  horizontalScroll: {
    flexDirection: "row",
    paddingBottom: 6,
  },
  timeConfigContainer: {
    marginTop: 12,
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    padding: 12,
    height: 140,
  },
  pickerColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
  },
  pickerColumnLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  pickerScrollView: {
    flex: 1,
    width: "100%",
  },
  pickerItem: {
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  pickerItemActive: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  pickerItemText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  timeSeparator: {
    color: COLORS.textSecondary,
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 12,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: "600",
    fontSize: 14,
  },
  saveBtn: {
    flex: 2,
    marginLeft: 8,
    backgroundColor: COLORS.accentSuccess,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 14,
  }
});
