import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notifications display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  if (Platform.OS === "web") {
    // For Web, request standard browser notifications
    if (!("Notification" in window)) {
      return false;
    }
    if (Notification.permission === "granted") {
      return true;
    }
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // For native platforms
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== "granted") {
    console.log("Failed to get push token for notification permissions!");
    return false;
  }
  
  return true;
}

/**
 * Schedules a daily reminder notification for a specific habit
 * @param habitId Unique identifier for the habit
 * @param title Title of the habit to display in the alert
 * @param timeString Configured trigger time in format "HH:MM" (e.g. "08:30")
 * @returns The scheduled notification identifier or undefined
 */
export async function scheduleHabitReminder(
  habitId: string,
  title: string,
  timeString: string
): Promise<string | undefined> {
  try {
    const hasPermission = await registerForPushNotificationsAsync();
    if (!hasPermission) {
      console.warn("Notification permissions not granted.");
      return undefined;
    }

    const [hourStr, minuteStr] = timeString.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) {
      console.warn("Invalid reminder time configuration format:", timeString);
      return undefined;
    }

    if (Platform.OS === "web") {
      // For web, we can simulate scheduling using timeouts, but since we want standard widget/mobile,
      // we'll just log and return a mock string. (Web support is usually via service workers which is heavy).
      console.log(`[Web Notification] Scheduled daily reminder for "${title}" at ${timeString}`);
      return `web-reminder-${habitId}-${Date.now()}`;
    }

    // Schedule local notification on native devices
    const trigger: any = {
      hour,
      minute,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Habit Reminder 🔔",
        body: `Time to check off: "${title}"`,
        data: { habitId },
      },
      trigger,
    });

    console.log(`[Native Notification] Scheduled reminder for "${title}" at ${timeString} (ID: ${notificationId})`);
    return notificationId;
  } catch (error) {
    console.error("Failed to schedule habit reminder:", error);
    return undefined;
  }
}

/**
 * Cancels a scheduled reminder notification
 * @param notificationId ID returned by scheduleHabitReminder
 */
export async function cancelHabitReminder(notificationId: string): Promise<void> {
  if (!notificationId) return;

  try {
    if (Platform.OS === "web" || notificationId.startsWith("web-reminder-")) {
      console.log(`[Web Notification] Cancelled reminder ID: ${notificationId}`);
      return;
    }

    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled scheduled notification: ${notificationId}`);
  } catch (error) {
    console.error("Failed to cancel scheduled notification:", error);
  }
}
