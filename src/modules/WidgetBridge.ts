import { NativeModules, Platform } from "react-native";

// Safe reference to the native module
const { WidgetBridge } = NativeModules;

export interface WidgetHabitInfo {
  id: string;
  title: string;
  isCompleted: boolean;
  streak: number;
  isScripture: boolean;
  scriptureTarget?: string; // e.g., "1 Nephi 3"
}

/**
 * Sends today's habit checklist summary to the native Widget storage
 */
export async function setWidgetData(habits: any[], history: any): Promise<boolean> {
  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const todayStr = formatDate(new Date());

  // Compile clean summary payload for the widgets
  const widgetPayload: WidgetHabitInfo[] = habits.map(h => {
    const isCompleted = !!history[todayStr]?.[h.id]?.completed;
    const info: WidgetHabitInfo = {
      id: h.id,
      title: h.title,
      isCompleted,
      streak: h.streak,
      isScripture: !!h.isScriptureSync
    };
    if (h.isScriptureSync && h.scriptureBook && h.scriptureChapter) {
      info.scriptureTarget = `${h.scriptureBook} ${h.scriptureChapter}`;
    }
    return info;
  });

  const jsonValue = JSON.stringify(widgetPayload);

  // Web Fallback (LocalStorage)
  if (Platform.OS === "web") {
    try {
      localStorage.setItem("widget_habits_data", jsonValue);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Native call
  if (WidgetBridge && WidgetBridge.setSharedData) {
    try {
      const result = await WidgetBridge.setSharedData("today_habits", jsonValue);
      return !!result;
    } catch (error) {
      console.warn("WidgetBridge.setSharedData failed:", error);
      return false;
    }
  } else {
    console.log("[WidgetBridge Local Fallback] Saved habit data for widgets:", widgetPayload);
    return false;
  }
}

/**
 * Reloads both iOS and Android widgets
 */
export async function reloadAllWidgets(): Promise<boolean> {
  if (Platform.OS === "web") {
    return true;
  }

  if (WidgetBridge && WidgetBridge.reloadWidgets) {
    try {
      const result = await WidgetBridge.reloadWidgets();
      return !!result;
    } catch (error) {
      console.warn("WidgetBridge.reloadWidgets failed:", error);
      return false;
    }
  } else {
    console.log("[WidgetBridge Local Fallback] Requesting widget timeline reload.");
    return false;
  }
}
