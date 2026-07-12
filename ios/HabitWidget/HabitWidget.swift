import WidgetKit
import SwiftUI

// Struct mapping the shared JSON model
struct WidgetHabitInfo: Codable, Identifiable {
    let id: String
    let title: String
    let isCompleted: Bool
    let streak: Int
    let isScripture: Bool
    let scriptureTarget: String?
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let habits: [WidgetHabitInfo]
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), habits: [
            WidgetHabitInfo(id: "1", title: "Read Book of Mormon", isCompleted: false, streak: 3, isScripture: true, scriptureTarget: "1 Nephi 3"),
            WidgetHabitInfo(id: "2", title: "Drink Water", isCompleted: true, streak: 12, isScripture: false, scriptureTarget: nil)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: loadHabits())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: loadHabits())
        // Reload timeline at end, but reloadWidgets() will force updates
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
    
    private func loadHabits() -> [WidgetHabitInfo] {
        guard let defaults = UserDefaults(suiteName: "group.com.habittracker.app"),
              let jsonString = defaults.string(forKey: "today_habits"),
              let jsonData = jsonString.data(using: .utf8) else {
            return []
        }
        
        do {
            return try JSONDecoder().decode([WidgetHabitInfo].self, from: jsonData)
        } catch {
            print("Failed to decode habits in Widget: \(error)")
            return []
        }
    }
}

struct HabitWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Text("DAILY")
                    .font(.system(size: 11, weight: .black, design: .rounded))
                    .foregroundColor(Color(red: 167/255, green: 139/255, blue: 250/255))
                Text("HABITS")
                    .font(.system(size: 11, weight: .regular, design: .rounded))
                    .foregroundColor(.white)
                Spacer()
                Text("TODAY")
                    .font(.system(size: 9, weight: .bold, design: .default))
                    .foregroundColor(.secondary)
            }
            
            Divider()
                .background(Color.white.opacity(0.1))
            
            if entry.habits.isEmpty {
                Spacer()
                Text("No active habits.\nOpen app to add some!")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity, alignment: .center)
                Spacer()
            } else {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(entry.habits.prefix(3)) { habit in
                        HStack(spacing: 8) {
                            Image(systemName: habit.isCompleted ? "checkmark.square.fill" : "square")
                                .foregroundColor(habit.isCompleted ? .emerald : .secondary)
                                .font(.system(size: 14))
                            
                            VStack(alignment: .leading, spacing: 1) {
                                if habit.isScripture, let target = habit.scriptureTarget {
                                    Text("📖 \(target)")
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(habit.isCompleted ? .secondary : .primary)
                                    Text(habit.title)
                                        .font(.system(size: 10))
                                        .foregroundColor(.secondary)
                                } else {
                                    Text(habit.title)
                                        .font(.system(size: 13, weight: .bold))
                                        .foregroundColor(habit.isCompleted ? .secondary : .primary)
                                    if habit.streak > 0 {
                                        Text("🔥 \(habit.streak) day streak")
                                            .font(.system(size: 10))
                                            .foregroundColor(.orange)
                                    }
                                }
                            }
                            Spacer()
                        }
                    }
                }
                Spacer()
            }
        }
        .padding()
        .containerBackground(.black, for: .widget)
    }
}

extension Color {
    static let emerald = Color(red: 52/255, green: 211/255, blue: 153/255)
}

struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Daily Habits List")
        .description("Track your daily scripture reading and routines at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
