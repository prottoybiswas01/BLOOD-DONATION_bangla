/**
 * configure-release.js
 * Automatically prepares the generated Android project for a genuine, standalone, signed Release build.
 * - Restricts architectures to arm64-v8a and armeabi-v7a (drastically reducing APK size)
 * - Configures signingConfigs.release and attaches it to buildTypes.release
 * - Generates a production release keystore if one does not already exist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const androidDir = path.join(__dirname, '..', 'android');
const appDir = path.join(androidDir, 'app');
const gradlePropertiesPath = path.join(androidDir, 'gradle.properties');
const buildGradlePath = path.join(appDir, 'build.gradle');
const releaseKeystorePath = path.join(appDir, 'release.keystore');

console.log('[Release Config] Starting Android Release configuration...');

if (!fs.existsSync(androidDir)) {
  console.error('[Release Config] Error: mobile/android directory does not exist. Run "npx expo prebuild" first.');
  process.exit(1);
}

// 1. Optimize gradle.properties
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

// 2. Generate release.keystore if missing
if (!fs.existsSync(releaseKeystorePath)) {
  console.log('[Release Config] Generating production release keystore...');
  try {
    const keytoolCmd = `keytool -genkeypair -v -keystore "${releaseKeystorePath}" -alias bloodbd -keyalg RSA -keysize 2048 -validity 10000 -storepass bloodbdrelease123 -keypass bloodbdrelease123 -dname "CN=BangladeshBloodDonation, OU=MobileRelease, O=BloodBD, L=Dhaka, ST=Dhaka, C=BD"`;
    execSync(keytoolCmd, { stdio: 'inherit' });
    console.log('[Release Config] Generated release.keystore successfully.');
  } catch (err) {
    console.warn('[Release Config] Warning: Could not generate release.keystore via keytool (keytool may not be in PATH). Release build will use fallback signing.');
  }
} else {
  console.log('[Release Config] Existing release.keystore found.');
}

// 3. Configure signingConfigs and buildTypes in app/build.gradle
if (fs.existsSync(buildGradlePath)) {
  let buildGradle = fs.readFileSync(buildGradlePath, 'utf8');

  // Replace signingConfigs block
  const oldSigningBlock = /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/;
  const newSigningBlock = `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (file('release.keystore').exists()) {
                storeFile file('release.keystore')
                storePassword 'bloodbdrelease123'
                keyAlias 'bloodbd'
                keyPassword 'bloodbdrelease123'
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }
    }`;

  if (oldSigningBlock.test(buildGradle) && !buildGradle.includes("keyAlias 'bloodbd'")) {
    buildGradle = buildGradle.replace(oldSigningBlock, newSigningBlock);
  }

  // Update release build type to use signingConfigs.release
  buildGradle = buildGradle.replace(
    /release\s*\{\s*(\/\/.*?\n\s*)*signingConfig signingConfigs\.debug/,
    `release {\n            signingConfig signingConfigs.release`
  );

  fs.writeFileSync(buildGradlePath, buildGradle, 'utf8');
  console.log('[Release Config] Updated app/build.gradle with signingConfigs.release and attached to buildTypes.release.');
}

console.log('[Release Config] Android Release configuration completed successfully.');
