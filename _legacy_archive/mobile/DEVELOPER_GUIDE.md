# Memora Mobile: Developer Setup Guide

This guide ensures the mobile application remains stable and buildable for everyone on the team.

## 🚀 Quick Start (Commands)

Follow these steps to get the app running flawlessly on Windows/PowerShell:

### 1. Installation
The project is aligned with **Expo SDK 54** (React 19). Because React 19 is cutting-edge for mobile, you **must** use the legacy flag for dependency resolution:

```powershell
cd mobile
# Force a clean slate
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### 2. Environment Setup
Copy the example environment file and fill in the Supabase keys:
```powershell
copy .env.example .env
```

### 3. Starting the App
```powershell
# Start and clear cache (Recommended for first run)
npx expo start --clear
```

---

## 🛠 Features for Developers

### Error Handling
The app includes a root-level **ErrorBoundary** in `app/_layout.tsx`. If the app crashes, it will show a user-friendly recovery screen instead of a native crash.

### Network Monitoring
A **NetworkStatus** bar appear at the top of the app if connectivity is lost.

### Production Builds (EAS)
```powershell
eas build --platform android --profile production
```

---

## 📦 Key Architecture Details (SDK 54)
- **Framework**: Expo SDK 54
- **React**: 19.1.0 (Modern)
- **React Native**: 0.81.x
- **Reanimated**: v4.x (Worklets-based)
- **Icons**: Lucide React Native
- **New Architecture**: Enabled in `app.json`
