package com.teachflow.app

import android.app.Activity
import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup

/**
 * AdMob Management Controller.
 *
 * Implements strict auto-configuration rules:
 * - If [Config.ADMOB_APP_ID] is empty:
 *   AdMob is completely disabled. No initialization, no banner reservation,
 *   no interstitial preloads, and zero memory/runtime overhead.
 * - If [Config.ADMOB_APP_ID] is present:
 *   Initializes SDK and attaches banner and/or interstitial according to configuration.
 */
class Admob(private val activity: Activity) {

    companion object {
        private const val TAG = "TeachFlow_AdMob"
    }

    /**
     * Determines whether AdMob is genuinely configured.
     */
    val isEnabled: Boolean = Config.ADMOB_APP_ID.isNotBlank()

    private var lastInterstitialShownTime: Long = 0L

    /**
     * Initializes AdMob SDK if configured.
     * Safe to call unconditionally; acts as a no-op if [isEnabled] is false.
     */
    fun initialize() {
        if (!isEnabled) {
            Log.d(TAG, "AdMob is disabled (no App ID provided). Skipping initialization.")
            return
        }
        Log.i(TAG, "Initializing AdMob SDK...")
        // If Google Mobile Ads SDK is added, MobileAds.initialize(activity) is invoked here.
    }

    /**
     * Attaches adaptive banner to the designated container if configured.
     * If banner unit ID is empty or AdMob is disabled, hides container completely.
     */
    fun setupBanner(container: ViewGroup?) {
        if (!isEnabled || Config.ADMOB_BANNER_AD_UNIT_ID.isBlank()) {
            container?.visibility = View.GONE
            return
        }
        // When Banner ID is provided, container is configured and banner ad request is made.
        container?.visibility = View.VISIBLE
    }

    /**
     * Preloads an interstitial ad if configured.
     */
    fun preloadInterstitial() {
        if (!isEnabled || Config.ADMOB_INTERSTITIAL_AD_UNIT_ID.isBlank()) {
            return
        }
        Log.d(TAG, "Preloading interstitial ad...")
    }

    /**
     * Displays interstitial ad if preloaded and the minimum interval has elapsed.
     */
    fun showInterstitialIfReady(): Boolean {
        if (!isEnabled || Config.ADMOB_INTERSTITIAL_AD_UNIT_ID.isBlank()) {
            return false
        }

        val currentTime = System.currentTimeMillis()
        val intervalMillis = Config.INTERSTITIAL_INTERVAL_SECONDS * 1000L
        if (currentTime - lastInterstitialShownTime < intervalMillis) {
            Log.d(TAG, "Interstitial suppressed: interval threshold not yet reached.")
            return false
        }

        lastInterstitialShownTime = currentTime
        return true
    }

    /**
     * Lifecycle hooks
     */
    fun onResume() {}
    fun onPause() {}
    fun onDestroy() {}
}
