# ProGuard / R8 rules for TeachFlow Native Android Application

# Keep JavaScript interfaces safe for WebView
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebChromeClient and WebViewClient implementations
-keepclassmembers class * extends android.webkit.WebChromeClient {
    public void *(...);
}
-keepclassmembers class * extends android.webkit.WebViewClient {
    public void *(...);
}

# Keep ViewBinding generated classes
-keepclassmembers class * implements androidx.viewbinding.ViewBinding {
    public static *** inflate(...);
    public static *** bind(...);
    public *** getRoot();
}

# General AndroidX rules
-dontwarn androidx.**
-keep class androidx.webkit.** { *; }
-keep class androidx.swiperefreshlayout.widget.** { *; }

# Keep Config object
-keep class com.teachflow.app.Config { *; }
-keepclassmembers class com.teachflow.app.Config {
    public static final *** *;
}
