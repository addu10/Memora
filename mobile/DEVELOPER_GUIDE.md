# Memora Mobile: Developer Recovery & Setup Guide

This guide ensures the mobile application remains stable and buildable across different Git branches, especially on Windows environments.

## 🚀 Quick Start (Commands)

Whenever you switch branches or pull new changes, follow these steps exactly:

### 1. The "Right Directory" Rule
Always navigate to the `mobile` folder before running any commands.
```powershell
cd mobile
```

### 2. Experimental Installation (Mandatory)
We are using **React 19** and **React Native 0.81** (bleeding edge). Standard `npm install` will fail due to strict peer dependency checks. You **MUST** use this flag:
```powershell
npm install --legacy-peer-deps
```

### 3. Starting the App
```powershell
npx expo start --clear
```

---

## 🛠 Troubleshooting & Branch Switching

### Git Branch Switching
1. **Save your work**: `git add .` and `git commit -m "Work in progress"`
2. **Switch**: `git checkout <branch-name>`
3. **Re-install**: Always run `npm install --legacy-peer-deps` after switching.

### "Loading..." or "Something went wrong" in Expo Go
If the app hangs or fails after scanning:
1. **Reset Expo Go**: On your phone, force-quit the Expo Go app and clear its cache (or reinstall it). This is critical when switching between React 18/19 stacks.
2. **Tunnel Mode**: If Wi-Fi issues occur, use `npx expo start --clear --tunnel`.
3. **Windows Fix**: Ensure `babel.config.js` includes the `module-resolver` alias for `react-native-worklets/plugin`.

---

## 📦 Key Architecture Details (Experimental)
- **Node Version**: 18+ (Recommended)
- **Framework**: Expo 54 (SDK 54)
- **React**: 19.1.0
- **React Native**: 0.81.5
- **Reanimated**: 4.1.1 (Experimental)
- **Icons**: Lucide React Native (Requires `unstable_enablePackageExports: true` in `metro.config.js`)
