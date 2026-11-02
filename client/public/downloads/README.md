# Android Application APK Distribution

- **Application Name**: Bangladesh Blood Donation Platform (রক্তদান বাংলাদেশ)
- **Package Identifier**: `org.bloodbd.app`
- **Current Version**: `1.0.0`
- **Version Code**: `1`
- **Target OS**: Android 6.0+ (API Level 23+)
- **Release Profile**: Production Signed / Preview APK
- **Official Download URL**: `/downloads/blood-donation-bangla.apk`
- **Release Repository**: `https://github.com/prottoybiswas01/BLOOD-DONATION_bangla/releases`

To generate the standalone unsigned or signed release APK:
```bash
cd mobile
npx eas-cli build -p android --profile preview
```
Or for local builds (when Android SDK is available):
```bash
cd mobile
npx expo prebuild
cd android && ./gradlew assembleRelease
```

