package com.y00chan.bluetoothyoutubelinkapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class SharedLinkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "SharedLinkModule"
    }

    @ReactMethod
    fun getSharedYoutubeLink(promise: Promise) {
        promise.resolve(MainActivity.sharedYoutubeLink)
        MainActivity.sharedYoutubeLink = null // 1회성 사용 후 초기화
    }
} 