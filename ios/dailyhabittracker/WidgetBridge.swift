import Foundation
import WidgetKit

@objc(WidgetBridge)
class WidgetBridge: NSObject {
  
  @objc(setSharedData:value:resolver:rejecter:)
  func setSharedData(key: String, value: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if let defaults = UserDefaults(suiteName: "group.com.habittracker.app") {
      defaults.set(value, forKey: key)
      defaults.synchronize()
      resolver(true)
    } else {
      rejecter("ERR_NO_SUITE", "Could not load UserDefaults suite group.com.habittracker.app", nil)
    }
  }

  @objc(reloadWidgets:rejecter:)
  func reloadWidgets(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    }
    resolver(true)
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
