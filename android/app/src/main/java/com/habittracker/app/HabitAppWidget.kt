package com.habittracker.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.widget.RemoteViews
import org.json.JSONArray
import org.json.JSONException

class HabitAppWidget : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val views = RemoteViews(context.packageName, R.layout.habit_widget_layout)

            // Intent to open App on click
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 
                0, 
                intent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            // Read SharedPreferences data
            val sharedPrefs = context.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
            val habitsJson = sharedPrefs.getString("today_habits", "[]")

            try {
                val jsonArray = JSONArray(habitsJson)
                views.removeAllViews(R.id.habit_list_container)

                if (jsonArray.length() == 0) {
                    views.setViewVisibility(R.id.empty_view, android.view.View.VISIBLE)
                    views.setViewVisibility(R.id.habit_list_container, android.view.View.GONE)
                } else {
                    views.setViewVisibility(R.id.empty_view, android.view.View.GONE)
                    views.setViewVisibility(R.id.habit_list_container, android.view.View.VISIBLE)

                    // Draw up to 4 habits in the widget to fit standard size
                    val limit = minOf(jsonArray.length(), 4)
                    for (i in 0 until limit) {
                        val obj = jsonArray.getJSONObject(i)
                        val title = obj.getString("title")
                        val isCompleted = obj.getBoolean("isCompleted")
                        val streak = obj.getInt("streak")
                        val isScripture = obj.getBoolean("isScripture")
                        val scriptureTarget = if (obj.has("scriptureTarget")) obj.getString("scriptureTarget") else ""

                        val habitItemViews = RemoteViews(context.packageName, R.layout.habit_widget_item)
                        
                        // Set text
                        if (isScripture && scriptureTarget.isNotEmpty()) {
                            habitItemViews.setTextViewText(R.id.habit_item_title, "📖 $scriptureTarget")
                            habitItemViews.setTextViewText(R.id.habit_item_subtitle, title)
                        } else {
                            habitItemViews.setTextViewText(R.id.habit_item_title, title)
                            habitItemViews.setTextViewText(R.id.habit_item_subtitle, if (streak > 0) "🔥 $streak day streak" else "Habit")
                        }

                        // Set completion icon/checkbox state
                        if (isCompleted) {
                            habitItemViews.setImageViewResource(R.id.habit_item_checkbox, R.drawable.ic_checkbox_checked)
                        } else {
                            habitItemViews.setImageViewResource(R.id.habit_item_checkbox, R.drawable.ic_checkbox_unchecked)
                        }

                        views.addView(R.id.habit_list_container, habitItemViews)
                    }
                }
            } catch (e: JSONException) {
                e.printStackTrace()
                views.setViewVisibility(R.id.empty_view, android.view.View.VISIBLE)
                views.setViewVisibility(R.id.habit_list_container, android.view.View.GONE)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
