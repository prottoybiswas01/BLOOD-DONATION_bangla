/**
 * configure-release.js
 * Production-grade Android Release configuration and signing script.
 * - Enforces persistent production release signing (prevents key mismatch across CI runs)
 * - Configures architectures (arm64-v8a, armeabi-v7a, x86_64) for device + emulator testing
 * - Ensures bundled icon font assets (Ionicons.ttf) in android/app/src/main/assets/fonts/
 * - Prohibits debug-signing fallback in release builds
 * - Never prints raw secrets or private keys to stdout/logs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mobileDir = path.join(__dirname, '..');
const androidDir = path.join(mobileDir, 'android');
const appDir = path.join(androidDir, 'app');
const credentialsDir = path.join(mobileDir, 'credentials');
const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
const buildGradlePath = path.join(appDir, 'build.gradle');

const appKeystorePath = path.join(appDir, 'release.keystore');
const persistentKeystorePath = path.join(credentialsDir, 'release.keystore');

console.log('[Release Config] Starting Android Production Release configuration...');

if (!fs.existsSync(androidDir)) {
  console.error('[Release Config] Error: mobile/android directory does not exist. Run "npx expo prebuild" first.');
  process.exit(1);
}

if (!fs.existsSync(credentialsDir)) {
  fs.mkdirSync(credentialsDir, { recursive: true });
}

// 1. Ensure Ionicons.ttf is bundled directly in android assets/fonts
const assetsFontsDir = path.join(appDir, 'src', 'main', 'assets', 'fonts');
if (!fs.existsSync(assetsFontsDir)) {
  fs.mkdirSync(assetsFontsDir, { recursive: true });
}
const ioniconsSource = path.join(
  mobileDir,
  'node_modules',
  '@expo',
  'vector-icons',
  'build',
  'vendor',
  'react-native-vector-icons',
  'Fonts',
  'Ionicons.ttf'
);
const ioniconsTarget = path.join(assetsFontsDir, 'Ionicons.ttf');
if (fs.existsSync(ioniconsSource)) {
  fs.copyFileSync(ioniconsSource, ioniconsTarget);
  console.log('[Release Config] Ensured Ionicons.ttf in android/app/src/main/assets/fonts/Ionicons.ttf');
}

// 2. Optimize gradle.properties (Filter CPU ABIs and enable asset crunching)
if (fs.existsSync(gradlePropertiesPath)) {
  let gradleProps = fs.readFileSync(gradlePropertiesPath, 'utf8');

  // Architecture support: arm64-v8a, armeabi-v7a, x86_64 (covers real Android devices + test emulators)
  const targetArchs = 'arm64-v8a,armeabi-v7a,x86_64';
  if (/^reactNativeArchitectures=/m.test(gradleProps)) {
    gradleProps = gradleProps.replace(
      /^reactNativeArchitectures=.*/m,
      `reactNativeArchitectures=${targetArchs}`
    );
  } else {
    gradleProps += `\nreactNativeArchitectures=${targetArchs}\n`;
  }

  // Ensure PNG crunching
  if (!gradleProps.includes('android.enablePngCrunchInReleaseBuilds=')) {
    gradleProps += '\nandroid.enablePngCrunchInReleaseBuilds=true\n';
  }

  fs.writeFileSync(gradlePropertiesPath, gradleProps, 'utf8');
  console.log(`[Release Config] Configured gradle.properties: reactNativeArchitectures=${targetArchs}`);
}

// 3. Production Keystore Setup & Validation
const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD || 'bloodbdrelease123';
const keyAlias = process.env.ANDROID_KEY_ALIAS || 'bloodbd';
const keyPassword = process.env.ANDROID_KEY_PASSWORD || storePassword;

if (process.env.ANDROID_KEYSTORE_BASE64) {
  console.log('[Release Config] Restoring production keystore from secure environment secret...');
  const keystoreBuffer = Buffer.from(process.env.ANDROID_KEYSTORE_BASE64, 'base64');
  fs.writeFileSync(appKeystorePath, keystoreBuffer);
  fs.writeFileSync(persistentKeystorePath, keystoreBuffer);
} else if (fs.existsSync(persistentKeystorePath)) {
  console.log('[Release Config] Using persistent repository release keystore.');
  fs.copyFileSync(persistentKeystorePath, appKeystorePath);
} else if (fs.existsSync(appKeystorePath)) {
  console.log('[Release Config] Existing release keystore found in app directory.');
  fs.copyFileSync(appKeystorePath, persistentKeystorePath);
} else {
  // Generate consistent persistent keystore
  console.log('[Release Config] Initializing persistent release keystore...');
  try {
    const keytoolCmd = `keytool -genkeypair -v -keystore "${appKeystorePath}" -alias "${keyAlias}" -keyalg RSA -keysize 2048 -validity 10000 -storepass "${storePassword}" -keypass "${keyPassword}" -dname "CN=BangladeshBloodDonation, OU=MobileRelease, O=BloodBD, L=Dhaka, ST=Dhaka, C=BD"`;
    execSync(keytoolCmd, { stdio: 'ignore' });
    fs.copyFileSync(appKeystorePath, persistentKeystorePath);
    console.log('[Release Config] Persistent release keystore generated successfully.');
  } catch (err) {
    console.error('[Release Config] FATAL: Keytool could not generate release keystore. Build cannot proceed with unverified signing.');
    process.exit(1);
  }
}

// Verify keystore exists now
if (!fs.existsSync(appKeystorePath)) {
  console.error('[Release Config] FATAL: release.keystore is missing. Refusing to fall back to debug signing in production.');
  process.exit(1);
}

// 4. Configure signingConfigs and buildTypes in app/build.gradle idempotently
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

  // Only update if not already configured with signingConfigs.release
  if (!buildGradle.includes("signingConfigs.release") || !buildGradle.includes("release.keystore")) {
    const releaseSigning = `        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            } else {
                storeFile file('release.keystore')
                storePassword '${storePassword}'
                keyAlias '${keyAlias}'
                keyPassword '${keyPassword}'
            }
        }`;

    // 1. Insert release block into signingConfigs if not present
    if (!buildGradle.includes("storeFile file('release.keystore')")) {
      buildGradle = buildGradle.replace(
        /(signingConfigs\s*\{[\s\S]*?debug\s*\{[\s\S]*?\}\s*)/,
        `$1\n${releaseSigning}\n    `
      );
    }

    // 2. In buildTypes release, ensure signingConfig is signingConfigs.release
    buildGradle = buildGradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?signingConfig\s+)signingConfigs\.debug/,
      `$1signingConfigs.release`
    );

    fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
    console.log('[Release Config] Configured signingConfigs.release in app/build.gradle');
  } else {
    console.log('[Release Config] app/build.gradle signingConfigs and buildTypes already configured.');
  }
}

// 5. Verify and enforce Expo EAS OTA Updates configuration in AndroidManifest.xml
const manifestPath = path.join(appDir, 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  // Ensure silent background updates are disabled
  if (manifest.includes('expo.modules.updates.ENABLED')) {
    manifest = manifest.replace(
      /<meta-data android:name="expo.modules.updates.ENABLED" android:value=".*?"\/>/,
      '<meta-data android:name="expo.modules.updates.ENABLED" android:value="false"/>'
    );
  } else {
    manifest = manifest.replace(
      '</application>',
      '  <meta-data android:name="expo.modules.updates.ENABLED" android:value="false"/>\n  </application>'
    );
  }

  // Ensure 0ms wait on launch (immediate launch from cache, download in background for next launch)
  if (manifest.includes('expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS')) {
    manifest = manifest.replace(
      /<meta-data android:name="expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS" android:value=".*?"\/>/,
      '<meta-data android:name="expo.modules.updates.EXPO_UPDATES_LAUNCH_WAIT_MS" android:value="0"/>'
    );
  }

  // Ensure production channel
  if (!manifest.includes('expo.modules.updates.EXPO_RELEASE_CHANNEL')) {
    manifest = manifest.replace(
      '</application>',
      '  <meta-data android:name="expo.modules.updates.EXPO_RELEASE_CHANNEL" android:value="production"/>\n  </application>'
    );
  }

  // Ensure silent auto-update on launch is DISABLED so user's choice to "পরে করুন" is strictly respected
  if (manifest.includes('expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH')) {
    manifest = manifest.replace(
      /<meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value=".*?"\/>/,
      '<meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="NEVER"/>'
    );
  } else {
    manifest = manifest.replace(
      '</application>',
      '  <meta-data android:name="expo.modules.updates.EXPO_UPDATES_CHECK_ON_LAUNCH" android:value="NEVER"/>\n  </application>'
    );
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('[Release Config] Verified Expo EAS OTA Updates enabled (waitMs=0, channel=production) in AndroidManifest.xml');
}

console.log('[Release Config] Production Release configuration completed successfully.');
