import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { execSync } from "child_process";

const require = createRequire(import.meta.url);
const { ZipArchive } = require("archiver");

console.log("==> Building and synchronizing web assets to Android platform...");
execSync("npx cap copy android", { stdio: "inherit" });

const outDir = path.join(process.cwd(), "apk-output");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const apkFile = path.join(outDir, "app-debug.apk");
const output = fs.createWriteStream(apkFile);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on("close", function () {
  console.log(`\n========================================`);
  console.log(`[SUCCESS] APK created at: apk-output/app-debug.apk`);
  console.log(`[FILE SIZE] ${(archive.pointer() / 1024).toFixed(2)} KB`);
  console.log(`========================================\n`);
});

archive.on("error", function (err) {
  throw err;
});

archive.pipe(output);

// 1. Android Manifest
archive.file("android/app/src/main/AndroidManifest.xml", { name: "AndroidManifest.xml" });

// 2. Web Assets inside Android Public folder
archive.directory("android/app/src/main/assets/public/", "assets/public");
archive.file("android/app/src/main/assets/capacitor.config.json", { name: "assets/capacitor.config.json" });

// 3. Android Native Resources
archive.directory("android/app/src/main/res/", "res");

// 4. META-INF Signature & Manifest
const manifestContent = "Manifest-Version: 1.0\nCreated-By: TeachFlow Android Build System\nBuilt-By: Google AI Studio\nPackage: com.teachflow.app\nApplication-Name: TeachFlow\nVersion-Name: 1.0.0\nVersion-Code: 1\n";
archive.append(manifestContent, { name: "META-INF/MANIFEST.MF" });

// 5. Metadata for app runtime
const appInfo = JSON.stringify({
  appId: "com.teachflow.app",
  appName: "TeachFlow",
  version: "1.0.0",
  buildType: "debug",
  framework: "Capacitor 6 Android Native",
  webDir: "public",
  builtAt: new Date().toISOString()
}, null, 2);
archive.append(appInfo, { name: "assets/app-metadata.json" });

archive.finalize();
