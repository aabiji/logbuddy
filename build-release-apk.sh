#!/bin/bash
set -e

cd frontend

bun remove capacitor-assets 2>/dev/null || true
bun add -D @capacitor/assets

bunx cap add android
bun install
bun run build
bunx @capacitor/assets generate --iconBackgroundColor "#00BCD4"
bunx cap sync android
cd android && ./gradlew assembleDebug && cd ..

adb install -r android/app/build/outputs/apk/debug/app-debug.apk
