package com.habittracker.app

import android.content.Context
import android.content.SharedPreferences
import android.content.Intent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class WidgetBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "WidgetBridge"
    }

    @ReactMethod
    fun setSharedData(key: String, value: String, promise: Promise) {
        try {
            val sharedPref = reactApplicationContext.getSharedPreferences("WidgetPrefs", Context.MODE_PRIVATE)
            with (sharedPref.edit()) {
                putString(key, value)
                apply()
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun reloadWidgets(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, HabitAppWidget::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            val widgetManager = AppWidgetManager.getInstance(context)
            val ids = widgetManager.getAppWidgetIds(ComponentName(context, HabitAppWidget::class.java))
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
            context.sendBroadcast(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }
}
