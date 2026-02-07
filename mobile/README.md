# Memora Mobile App

A React Native (Expo) mobile application for Alzheimer's patients to engage in memory therapy sessions.

## Overview

The Memora Mobile App is designed for elderly patients with early-stage Alzheimer's disease. It features:

- **Large, accessible UI** with clear fonts and simple navigation
- **Face recognition (V2)** for instant family identification
- **AI-Powered Therapy** using Gemini interactive prompts
- **Memory performance badges** (Mastered, In Progress, Needs Practice)
- **Personalized profiles** with caregiver emergency contact

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks + AsyncStorage
- **Backend**: Supabase (PostgreSQL via REST API)
- **Icons**: @expo/vector-icons (Ionicons)

## Project Structure

```
mobile/
├── app/                    # Expo Router pages
│   ├── (app)/              # Authenticated app screens
│   │   ├── _layout.tsx     # Tab navigation layout
│   │   ├── home.tsx        # Home dashboard
│   │   ├── profile.tsx     # Patient profile screen
│   │   ├── recognize.tsx   # Face recognition screen
│   │   ├── session.tsx     # Memory game session
│   │   ├── progress.tsx    # Progress tracking
│   │   ├── memories/       # Photo galleries
│   │   │   ├── _layout.tsx # Stack navigator
│   │   │   ├── index.tsx   # Memory list
│   │   │   └── [id].tsx    # Memory detail
│   │   └── family/         # Family directory
│   │       ├── _layout.tsx # Stack navigator
│   │       ├── index.tsx   # Family list
│   │       └── [id].tsx    # Family member detail
│   ├── (auth)/             # Authentication screens
│   │   └── login.tsx       # Patient PIN login
│   ├── _layout.tsx         # Root layout
│   └── index.tsx           # Entry point (redirect)
├── lib/                    # Shared utilities
│   ├── api.ts              # Supabase API client
│   ├── supabase.ts         # Supabase client config
│   └── types.ts            # TypeScript interfaces
├── assets/                 # Images & fonts
└── app.json                # Expo configuration
```

## Authentication Flow

1. Patient enters their 4-digit PIN on the login screen
2. App calls `login_patient` RPC function on Supabase
3. On success, patient data is stored in AsyncStorage
4. App redirects to the main tab navigator

## API Layer (`lib/api.ts`)

The `MemoraApiClient` class provides methods for:

| Method | Description |
|--------|-------------|
| `init()` | Load patient ID from AsyncStorage |
| `getMemories()` | Fetch all memories for the patient |
| `getMemory(id)` | Fetch a single memory by ID |
| `getFamilyMembers()` | Fetch family directory |
| `createSession(data)` | Log a therapy session |
| `getSessions()` | Fetch session history |
| `getLatestSessionMemories()` | Fetch most recent recall performance |
| `getPatient()` | Fetch profile with caregiver context |
| `getPatientStats()` | Aggregate dashboard numbers |

## Environment Variables

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Running the App

```bash
# Install dependencies
npm install

# Start Expo development server
npx expo start -c

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web
```

## Key Features

### 1. Home Screen
- Personalized greeting with patient name
- Quick access cards for main features
- Daily inspiration tips

### 2. Profile Screen
- Display patient details (name, age, diagnosis)
- Show caregiver information
- Logout functionality

### 3. Family Directory
- Grid view of family members with photos
- Detailed view with relationship and notes
- Photo gallery for each family member

### 4. Memory Gallery
- Chronological list of memories/photos
- Filter by event type
- Detailed view with descriptions

### 5. Face Recognition V2
- **DeepFace Integration**: High-accuracy recognition via Supabase Edge Function
- **Real-time**: Leverages parallel processing for sub-second recognition

### 6. AI Session Therapy
- **Interactive Prompts**: Gemini-1.5-Pro generated clinically-backed questions
- **Recall Tracking**: Marks photos from 1-5 to update clinical progress
- **Mood Logging**: Tracks emotional response to reminiscence

## Design Principles

- **Elderly-Friendly**: Large text (18-32px), high contrast colors
- **Minimal Cognitive Load**: Simple navigation, clear CTAs
- **Calming Colors**: Soft blues, warm neutrals
- **Consistent Layout**: Predictable UI patterns
