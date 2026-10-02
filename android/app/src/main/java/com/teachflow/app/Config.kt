package com.teachflow.app

/**
 * Centralized Configuration for TeachFlow Android Application.
 *
 * All user-configurable parameters, including Website URL, AdMob parameters,
 * and client behaviors, are managed in this single file.
 */
object Config {

    /**
     * Primary live HTTPS URL loaded by the native WebView.
     * Expected format: "https://your-domain.com"
     * Required: YES. This value must be a valid HTTPS URL and cannot be empty.
     */
    const val WEBSITE_URL: String = "https://ais-pre-wslbzrp3w76oyhu3oykf4l-561112832426.asia-southeast1.run.app"

    /**
     * Optional: Google AdMob Application ID.
     * Expected format: "ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"
     * Optional: YES.
     * What happens if empty: AdMob SDK initialization is completely omitted.
     * No ad requests, banners, or interstitials will be loaded, and no space is reserved.
     */
    const val ADMOB_APP_ID: String = ""

    /**
     * Optional: Google AdMob Banner Ad Unit ID.
     * Expected format: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
     * Optional: YES.
     * What happens if empty: Banner advertising is completely disabled.
     * The WebView occupies the full available application display area.
     */
    const val ADMOB_BANNER_AD_UNIT_ID: String = ""

    /**
     * Optional: Google AdMob Interstitial Ad Unit ID.
     * Expected format: "ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY"
     * Optional: YES.
     * What happens if empty: Interstitial full-screen ads are completely disabled.
     */
    const val ADMOB_INTERSTITIAL_AD_UNIT_ID: String = ""

    /**
     * Minimum interval in seconds between consecutive interstitial ad displays.
     * Expected format: Positive Long integer (e.g., 600L for 10 minutes).
     * Ignored when [ADMOB_INTERSTITIAL_AD_UNIT_ID] is empty.
     */
    const val INTERSTITIAL_INTERVAL_SECONDS: Long = 600L

    /**
     * AdMob Test Mode flag.
     * Expected format: Boolean (true for debug/testing, false for production).
     * Only relevant when valid AdMob IDs are configured.
     */
    const val ADMOB_TEST_MODE: Boolean = false

    /**
     * Pull-To-Refresh capability toggle.
     * Set to true to allow users to swipe down from the top to reload the current page.
     */
    const val ENABLE_PULL_TO_REFRESH: Boolean = true

    /**
     * Top loading progress bar toggle.
     * Set to true to show a sleek horizontal progress bar while pages load.
     */
    const val ENABLE_PROGRESS_BAR: Boolean = true
}
