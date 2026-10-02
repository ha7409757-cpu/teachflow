package com.teachflow.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.net.http.SslError
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.View
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.SslErrorHandler
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.teachflow.app.databinding.ActivityMainBinding

/**
 * Production-ready native Android Activity hosting the TeachFlow WebView.
 *
 * Implements:
 * - AndroidX SplashScreen
 * - Hardened, secure WebView configuration
 * - Chrome-style horizontal progress bar
 * - Swipe-to-refresh with scroll conflict handling
 * - Professional offline/error screen with retry
 * - Modern file picker (HTML file uploads)
 * - Safe external intent handling (tel:, mailto:, WhatsApp, intent:)
 * - Predictive/modern back navigation
 * - Optional, non-intrusive AdMob controller
 */
class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "TeachFlow_MainActivity"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var admob: Admob

    // File Chooser state
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var fileChooserLauncher: ActivityResultLauncher<Intent>

    // WebChrome permission request state
    private var pendingPermissionRequest: PermissionRequest? = null
    private lateinit var permissionLauncher: ActivityResultLauncher<Array<String>>

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install modern AndroidX splash screen before super.onCreate
        installSplashScreen()
        super.onCreate(savedInstanceState)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Register Activity Result Launchers
        registerActivityLaunchers()

        // Setup Back Navigation
        setupBackNavigation()

        // Setup AdMob (if configured)
        admob = Admob(this)
        admob.initialize()
        admob.setupBanner(binding.bannerAdContainer)

        // Setup UI components
        setupSwipeRefresh()
        setupErrorScreen()
        setupWebView()

        // Load the live website URL
        loadWebsite()
    }

    /**
     * Registers modern Activity Result Launchers for file uploads and runtime permissions.
     */
    private fun registerActivityLaunchers() {
        fileChooserLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (filePathCallback == null) return@registerForActivityResult

            val uris: Array<Uri>? = if (result.resultCode == RESULT_OK && result.data != null) {
                val clipData = result.data?.clipData
                val dataUri = result.data?.data

                when {
                    clipData != null -> {
                        val count = clipData.itemCount
                        Array(count) { i -> clipData.getItemAt(i).uri }
                    }
                    dataUri != null -> arrayOf(dataUri)
                    else -> null
                }
            } else {
                null
            }

            filePathCallback?.onReceiveValue(uris)
            filePathCallback = null
        }

        permissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            val pending = pendingPermissionRequest ?: return@registerForActivityResult
            val grantedResources = mutableListOf<String>()

            for ((permission, isGranted) in permissions) {
                if (isGranted) {
                    when (permission) {
                        Manifest.permission.CAMERA -> grantedResources.add(PermissionRequest.RESOURCE_VIDEO_CAPTURE)
                        Manifest.permission.RECORD_AUDIO -> grantedResources.add(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                    }
                }
            }

            if (grantedResources.isNotEmpty()) {
                pending.grant(grantedResources.toTypedArray())
            } else {
                pending.deny()
            }
            pendingPermissionRequest = null
        }
    }

    /**
     * Configures modern Android OnBackPressedCallback to navigate WebView history.
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    /**
     * Configures the SwipeRefreshLayout.
     */
    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.isEnabled = Config.ENABLE_PULL_TO_REFRESH
        binding.swipeRefreshLayout.setColorSchemeColors(
            ContextCompat.getColor(this, R.color.colorPrimary),
            ContextCompat.getColor(this, R.color.colorAccent)
        )

        binding.swipeRefreshLayout.setOnRefreshListener {
            if (isNetworkAvailable()) {
                binding.webView.reload()
            } else {
                binding.swipeRefreshLayout.isRefreshing = false
                showErrorScreen()
            }
        }
    }

    /**
     * Configures the native error/offline screen.
     */
    private fun setupErrorScreen() {
        binding.btnRetry.setOnClickListener {
            if (isNetworkAvailable()) {
                hideErrorScreen()
                binding.webView.reload()
            } else {
                Toast.makeText(this, getString(R.string.offline_title), Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Configures the Android WebView with security best practices.
     */
    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = binding.webView.settings

        // Enable JavaScript and modern web features
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true

        // Cache configuration
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Hardened Security: Disallow mixed content & local file access
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.allowFileAccess = false
        settings.allowContentAccess = true

        // Safe Browsing
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            settings.safeBrowsingEnabled = true
        }

        // Cookie management
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        // Avoid SwipeRefreshLayout interfering with internal page scrolling
        binding.webView.viewTreeObserver.addOnScrollChangedListener {
            binding.swipeRefreshLayout.isEnabled =
                Config.ENABLE_PULL_TO_REFRESH && binding.webView.scrollY == 0
        }

        // WebView Client
        binding.webView.webViewClient = object : WebViewClient() {

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                if (Config.ENABLE_PROGRESS_BAR) {
                    binding.topProgressBar.visibility = View.VISIBLE
                    binding.topProgressBar.progress = 10
                }
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.swipeRefreshLayout.isRefreshing = false
                if (Config.ENABLE_PROGRESS_BAR) {
                    binding.topProgressBar.visibility = View.GONE
                }
                hideErrorScreen()
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    Log.e(TAG, "WebView main frame error: ${error?.description}")
                    showErrorScreen()
                }
            }

            override fun onReceivedSslError(
                view: WebView?,
                handler: SslErrorHandler?,
                error: SslError?
            ) {
                // Strict SSL security: Never bypass SSL certificate validation
                Log.e(TAG, "SSL Certificate Error encountered. Terminating connection for security.")
                handler?.cancel()
                showErrorScreen()
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val uri = request?.url ?: return false
                val urlString = uri.toString()

                // Handle external URL schemes safely
                return when (uri.scheme?.lowercase()) {
                    "tel" -> {
                        launchExternalIntent(Intent(Intent.ACTION_DIAL, uri))
                        true
                    }
                    "mailto" -> {
                        launchExternalIntent(Intent(Intent.ACTION_SENDTO, uri))
                        true
                    }
                    "sms", "smsto" -> {
                        launchExternalIntent(Intent(Intent.ACTION_SENDTO, uri))
                        true
                    }
                    "whatsapp" -> {
                        launchExternalIntent(Intent(Intent.ACTION_VIEW, uri))
                        true
                    }
                    "intent" -> {
                        try {
                            val intent = Intent.parseUri(urlString, Intent.URI_INTENT_SCHEME)
                            launchExternalIntent(intent)
                        } catch (e: Exception) {
                            Log.e(TAG, "Failed to parse intent URL: $urlString", e)
                        }
                        true
                    }
                    "http", "https" -> {
                        // Keep navigation inside WebView for the application domain
                        false
                    }
                    else -> {
                        // Any other custom scheme handled externally
                        launchExternalIntent(Intent(Intent.ACTION_VIEW, uri))
                        true
                    }
                }
            }
        }

        // WebChrome Client
        binding.webView.webChromeClient = object : WebChromeClient() {

            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                if (Config.ENABLE_PROGRESS_BAR) {
                    binding.topProgressBar.progress = newProgress
                    if (newProgress >= 100) {
                        binding.topProgressBar.visibility = View.GONE
                    } else {
                        binding.topProgressBar.visibility = View.VISIBLE
                    }
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                return try {
                    fileChooserLauncher.launch(intent)
                    true
                } catch (e: ActivityNotFoundException) {
                    this@MainActivity.filePathCallback = null
                    Log.e(TAG, "Cannot launch file picker", e)
                    false
                }
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                if (request == null) return
                pendingPermissionRequest = request

                val permissionsToRequest = mutableListOf<String>()
                for (res in request.resources) {
                    when (res) {
                        PermissionRequest.RESOURCE_VIDEO_CAPTURE -> permissionsToRequest.add(Manifest.permission.CAMERA)
                        PermissionRequest.RESOURCE_AUDIO_CAPTURE -> permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
                    }
                }

                if (permissionsToRequest.isNotEmpty()) {
                    permissionLauncher.launch(permissionsToRequest.toTypedArray())
                } else {
                    request.deny()
                }
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                // Deny by default unless location is genuinely required
                callback?.invoke(origin, false, false)
            }
        }
    }

    /**
     * Loads the configured website URL.
     */
    private fun loadWebsite() {
        if (isNetworkAvailable()) {
            hideErrorScreen()
            binding.webView.loadUrl(Config.WEBSITE_URL)
        } else {
            showErrorScreen()
        }
    }

    /**
     * Launches external intents safely without crashing if target app is absent.
     */
    private fun launchExternalIntent(intent: Intent) {
        try {
            startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Log.w(TAG, "No application available to handle intent: ${intent.data}")
            Toast.makeText(this, "No supported app found to open this link.", Toast.LENGTH_SHORT).show()
        } catch (e: Exception) {
            Log.e(TAG, "Error launching external intent", e)
        }
    }

    /**
     * Checks whether active internet connectivity is present.
     */
    private fun isNetworkAvailable(): Boolean {
        val connectivityManager =
            getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false

        val network = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return false

        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
                capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
    }

    /**
     * Displays the native error/offline screen and pauses WebView.
     */
    private fun showErrorScreen() {
        binding.swipeRefreshLayout.isRefreshing = false
        binding.topProgressBar.visibility = View.GONE
        binding.errorLayout.visibility = View.VISIBLE
        binding.swipeRefreshLayout.visibility = View.GONE
    }

    /**
     * Hides the error screen and restores the WebView.
     */
    private fun hideErrorScreen() {
        binding.errorLayout.visibility = View.GONE
        binding.swipeRefreshLayout.visibility = View.VISIBLE
    }

    // Lifecycle Management
    override fun onResume() {
        super.onResume()
        binding.webView.onResume()
        admob.onResume()
    }

    override fun onPause() {
        super.onPause()
        binding.webView.onPause()
        admob.onPause()
    }

    override fun onDestroy() {
        admob.onDestroy()
        binding.webView.destroy()
        super.onDestroy()
    }
}
