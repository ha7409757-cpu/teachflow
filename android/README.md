# TeachFlow - Native Android Application Project

A production-ready native Android application built in Kotlin using Android Studio. This application encapsulates the live TeachFlow school management platform within a hardened, modern native WebView environment featuring AndroidX splash screens, pull-to-refresh, sleek horizontal progress indicators, native offline handling, secure file uploads, and modular configuration.

---

## 📱 Application Information

- **App Name:** TeachFlow
- **Package Name (Application ID):** `com.teachflow.app`
- **Version Name:** `1.0.0`
- **Version Code:** `1`
- **Target Platform:** Android (minSdk 24, targetSdk 34, compileSdk 34)
- **Primary Language:** Kotlin (with Gradle Kotlin DSL)
- **Live Website URL:** `https://ais-pre-wslbzrp3w76oyhu3oykf4l-561112832426.asia-southeast1.run.app`

---

## 🛠️ Technology Stack & Requirements

- **IDE:** Android Studio Iguana / Jellyfish / Koala (or newer)
- **Build System:** Gradle with Kotlin DSL (`build.gradle.kts`, `settings.gradle.kts`)
- **Language Level:** Kotlin 1.9+, Java 17
- **Core Components:**
  - `androidx.core:core-ktx:1.13.1`
  - `androidx.appcompat:appcompat:1.7.0`
  - `com.google.android.material:material:1.12.0`
  - `androidx.activity:activity-ktx:1.9.0` (with modern `OnBackPressedCallback`)
  - `androidx.swiperefreshlayout:swiperefreshlayout:1.1.0`
  - `androidx.core:core-splashscreen:1.0.1` (Android 12+ standard)
  - `androidx.webkit:webkit:1.11.0`

---

## 📂 Project Structure

```text
android/
├── settings.gradle.kts             # Root Gradle settings
├── build.gradle.kts                # Top-level build configuration
├── gradle.properties               # JVM args, AndroidX & optimization flags
├── gradlew / gradlew.bat           # Gradle wrapper scripts
├── gradle/wrapper/                 # Gradle distribution configuration
├── README.md                       # Comprehensive project documentation
├── output/                         # Reserved directory for Release.APK & Release.AAB
│   └── .gitkeep
└── app/
    ├── build.gradle.kts            # App module build script (dependencies & packaging)
    ├── proguard-rules.pro          # ProGuard / R8 code shrinking rules
    └── src/main/
        ├── AndroidManifest.xml     # Application manifest & permissions
        ├── java/com/teachflow/app/
        │   ├── Config.kt           # Centralized configuration (URLs, AdMob, flags)
        │   ├── MainActivity.kt     # Main Activity hosting WebView, clients & lifecycle
        │   └── Admob.kt            # Auto-configured AdMob controller (no-op if empty)
        └── res/
            ├── layout/
            │   └── activity_main.xml # Layout with WebView, progress bar, error UI, ad slot
            ├── values/
            │   ├── colors.xml       # Emerald Green (#047857), Ruby Red (#E11D48), Neutrals
            │   ├── strings.xml      # Bilingual UI labels & error messages
            │   └── themes.xml       # Material DayNight & SplashScreen themes
            ├── drawable/
            │   ├── ic_teachflow_logo.xml    # Vector TeachFlow logo
            │   ├── ic_wifi_off.xml          # Vector offline illustration
            │   ├── bg_retry_button.xml      # Animated outlined ripple retry button
            │   ├── progress_horizontal.xml  # Chrome-style horizontal progress gradient
            │   └── ic_launcher_foreground.xml
            └── mipmap-anydpi-v26/
                ├── ic_launcher.xml          # Adaptive launcher icon
                └── ic_launcher_round.xml    # Adaptive round icon
```

---

## 🚀 Getting Started with Android Studio

1. **Open the Project:**
   - Launch **Android Studio**.
   - Select **Open** and choose the `android/` directory.
   - Allow Gradle to sync dependencies automatically.

2. **Run on Device / Emulator:**
   - Connect an Android device (USB Debugging enabled) or start an Android Virtual Device (AVD).
   - Click the green **Run ▶** button or press `Shift + F10`.

---

## ⚙️ Centralized Configuration (`Config.kt`)

All user-configurable properties are located in `app/src/main/java/com/teachflow/app/Config.kt`:

```kotlin
object Config {
    // The live website URL to load
    const val WEBSITE_URL: String = "https://ais-pre-wslbzrp3w76oyhu3oykf4l-561112832426.asia-southeast1.run.app"

    // Optional AdMob IDs (leave empty to disable ads completely)
    const val ADMOB_APP_ID: String = ""
    const val ADMOB_BANNER_AD_UNIT_ID: String = ""
    const val ADMOB_INTERSTITIAL_AD_UNIT_ID: String = ""
    const val INTERSTITIAL_INTERVAL_SECONDS: Long = 600L
    const val ADMOB_TEST_MODE: Boolean = false

    // Feature Toggles
    const val ENABLE_PULL_TO_REFRESH: Boolean = true
    const val ENABLE_PROGRESS_BAR: Boolean = true
}
```

---

## 📢 AdMob Auto-Configuration Rules

> **Important Guarantee:**
> - **If AdMob information is provided:** AdMob SDK will initialize, and requested banners or interstitials will be displayed seamlessly.
> - **If AdMob information is not provided:** AdMob will remain completely disabled, no ad requests are made, no memory/layout space is reserved, and the application works with 100% full-screen native performance.

### Configuration Matrix:
- **No Ads (Default / Current Setup):**
  `ADMOB_APP_ID = ""`  
  `ADMOB_BANNER_AD_UNIT_ID = ""`  
  `ADMOB_INTERSTITIAL_AD_UNIT_ID = ""`
- **Banner Only:** Supply App ID + Banner Unit ID.
- **Interstitial Only:** Supply App ID + Interstitial Unit ID.
- **Banner + Interstitial:** Supply all three IDs.

### Official AdMob Test IDs (For Testing Only):
If you test monetization in the future, use Google's official test IDs before inserting production credentials:
- **App ID:** `ca-app-pub-3940256099942544~3347511713`
- **Banner Unit ID:** `ca-app-pub-3940256099942544/9214589741`
- **Interstitial Unit ID:** `ca-app-pub-3940256099942544/1033173712`

---

## 🔒 Security & WebView Features

1. **Strict SSL Validation:**
   - SSL certificates are always strictly validated. `onReceivedSslError` rejects invalid certificates immediately (`handler?.cancel()`) without bypassing security.
2. **Safe Navigation & External Schemes:**
   - Links for `tel:`, `mailto:`, `sms:`, and `whatsapp:` are safely directed to external applications via Android Intents with defensive exception handling.
3. **HTML File Uploads:**
   - Supported natively through modern `ActivityResultLauncher` contracts handling `<input type="file">`.
4. **Predictive Back Navigation:**
   - Uses AndroidX `OnBackPressedCallback`. If WebView history exists, pressing Back navigates pages backward; otherwise, it exits the activity naturally.
5. **Native Offline Screen:**
   - If network connectivity is lost or DNS fails, the app displays a bilingual error screen with an animated retry button that checks connectivity before reloading.

---

## 📦 Building Release APK & AAB

### Debug Build
```bash
./gradlew assembleDebug
```
Output: `app/build/outputs/apk/debug/app-debug.apk`

### Secure Release Signing
Private signing keys must **never** be committed to source code or version control. Store your keystore in an external directory (e.g., `~/.petgift-signing/pet-release.keystore` or environment variables):

```bash
# Generate Release APK
./gradlew assembleRelease

# Generate Release App Bundle (for Google Play Store)
./gradlew bundleRelease
```

The resulting binaries will be placed in the `output/` directory in the subsequent release prompts.
