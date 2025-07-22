package com.y00chan.bluetoothyoutubelinkapp

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.modules.core.DeviceEventManagerModule

class SharedLinkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        var sharedYoutubeLink: String? = null
        var pendingLink: String? = null
        var currentReactContext: ReactApplicationContext? = null
        private const val TAG = "SharedLinkModule"

        fun sendLinkToJS(link: String?) {
            sharedYoutubeLink = link // 항상 최신값으로 갱신
            val context = currentReactContext
            Log.d(TAG, "sendLinkToJS 호출: link=$link, context null? ${context == null}")
            if (context != null && link != null) {
                Log.d(TAG, "JS로 이벤트 emit: $link")
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onSharedYoutubeLink", link)
            } else {
                Log.d(TAG, "context가 null이거나 link가 null, pendingLink에 저장: $link")
                pendingLink = link
            }
        }
    }

    init {
        currentReactContext = reactContext
        Log.d(TAG, "init: currentReactContext 설정, pendingLink=$pendingLink")
        // JS가 준비되면, 큐에 있던 링크를 이벤트로 보냄
        pendingLink?.let {
            Log.d(TAG, "init에서 pendingLink emit: $it")
            sendLinkToJS(it)
            pendingLink = null
        }
    }

    override fun getName() = "SharedLinkModule"

    @ReactMethod
    fun getSharedYoutubeLink(promise: Promise) {
        Log.d(TAG, "getSharedYoutubeLink 호출: $sharedYoutubeLink")
        promise.resolve(sharedYoutubeLink)
        // sharedYoutubeLink = null // 여러 번 공유를 위해 null로 초기화하지 않음
    }

    @ReactMethod
    fun emitLatestLink() {
        Log.d(TAG, "emitLatestLink 호출: $sharedYoutubeLink")
        sendLinkToJS(sharedYoutubeLink)
    }
}
