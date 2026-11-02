/**
 * configure-release.js
 * Production-grade Android Release configuration and signing script.
 * - Enforces persistent production release signing (prevents key mismatch across CI runs)
 * - Restricts architectures to arm64-v8a and armeabi-v7a (reduces APK size)
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

// 1. Optimize gradle.properties (Filter CPU ABIs and enable asset crunching)
if (fs.existsSync(gradlePropertiesPath)) {
  let gradleProps = fs.readFileSync(gradlePropertiesPath, 'utf8');

  // Restrict to ARM architectures only (excludes x86/x86_64 emulator bloat)
  if (/^reactNativeArchitectures=/m.test(gradleProps)) {
    gradleProps = gradleProps.replace(
      /^reactNativeArchitectures=.*/m,
      'reactNativeArchitectures=arm64-v8a,armeabi-v7a'
    );
  } else {
    gradleProps += '\nreactNativeArchitectures=arm64-v8a,armeabi-v7a\n';
  }

  // Ensure PNG crunching
  if (!gradleProps.includes('android.enablePngCrunchInReleaseBuilds=')) {
    gradleProps += '\nandroid.enablePngCrunchInReleaseBuilds=true\n';
  }

  fs.writeFileSync(gradlePropertiesPath, gradleProps, 'utf8');
  console.log('[Release Config] Optimized gradle.properties: reactNativeArchitectures=arm64-v8a,armeabi-v7a');
}

// 2. Production Keystore Setup & Validation
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

// 3. Configure signingConfigs and buildTypes in app/build.gradle
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

  const oldSigningBlock = /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*(\s*release\s*\{[\s\S]*?\}\s*)?\}/;
  const newSigningBlock = `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file('release.keystore')
            storePassword '${storePassword}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPassword}'
        }
    }`;

  if (oldSigningBlock.test(buildGradle)) {
    buildGradle = buildGradle.replace(oldSigningBlock, newSigningBlock);
  }

  // Ensure release build type uses signingConfigs.release and explicitly forbids debug signing
  buildGradle = buildGradle.replace(
    /release\s*\{\s*(\/\/.*?\n\s*)*signingConfig signingConfigs\.(debug|release)/,
    `release {\n            signingConfig signingConfigs.release`
  );

  fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
  console.log('[Release Config] Configured release signing config in app/build.gradle (debug fallback strictly disabled).');
}

console.log('[Release Config] Android Release configuration completed successfully.');
