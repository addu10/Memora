# Memora - AI-Powered Memory Therapy Platform

An AI-assisted platform for Alzheimer's therapy, featuring face recognition and personalized memory exercises.

---

## 🧠 Project Overview

Memora is a **Final Year Project** designed to help early-stage Alzheimer's patients recognize family members and engage in memory therapy. The platform consists of:

1. **📱 Mobile App** - React Native app with AI therapy flow & accessibility
2. **💻 Caregiver Portal** - Next.js analytics & patient management dashboard
3. **🗄️ Backend** - Supabase (PostgreSQL + RLS + Edge Functions)
4. **🤖 AI/ML Suite** - Face recognition (V2) & Gemini therapeutic prompts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Memora Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────┐ │
│  │   Mobile    │          │   Portal    │          │  AI/ML  │ │
│  │    App      │          │    Web      │          │ Engine  │ │
│  │ (Expo/RN)   │          │ (Next.js)   │          │ (Gemini)│ │
│  └──────┬──────┘          └──────┬──────┘          └────┬────┘ │
│         │                        │                      │      │
│         └────────────┬───────────┘                      │      │
│                      │                                  │      │
│              ┌───────▼───────┐                          │      │
│              │ Supabase Edge │◄─────────────────────────┘      │
│              │ Functions     │                                 │
│              └───────┬───────┘                                 │
│                      │                                         │
│              ┌───────▼───────┐                                 │
│              │   PostgreSQL  │                                 │
│              │  + Auth + RLS │                                 │
│              └───────────────┘                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Final Year/
├── mobile/                 # React Native (Expo) mobile app
│   ├── app/                # Expo Router pages
│   ├── lib/                # API client, types, utilities
│   └── README.md           # Mobile app documentation
│
├── portal/                 # Next.js caregiver portal
│   ├── app/                # App Router pages & API
│   │   ├── api/            # REST API routes
│   │   └── dashboard/      # Protected dashboard pages
│   ├── lib/                # Supabase client, auth
│   └── README.md           # Portal documentation
│
├── inference_v2/           # Face Recognition V2 (DeepFace)
├── docs/audit/             # Final reports and clinical walkthroughs
├── supabase/               # Edge functions (Gemini proxy)
│
├── SUPABASE_SETUP.md       # Database configuration guide
├── ML_PIPELINE.md          # ML development roadmap
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### 1. Clone & Install

```bash
# Install portal dependencies
cd portal
npm install

# Install mobile dependencies
cd ../mobile
npm install
```

### 2. Configure Environment Variables

**Portal** (`portal/.env`):
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

**Mobile** (`mobile/.env`):
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### 3. Setup Database

```bash
cd portal

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data (optional)
npx prisma db seed
```

### 4. Run Applications

```bash
# Terminal 1: Run portal
cd portal
npm run dev
# → http://localhost:3000

# Terminal 2: Run mobile
cd mobile
npx expo start -c
# → Scan QR code with Expo Go
```

---

## 🔑 Features

### Mobile App (Patient)
- ✅ PIN-based authentication
- ✅ Personalized home screen with dynamic greetings
- ✅ AI-Powered Session Therapy (interactive question flow)
- ✅ Family directory with face recognition (V2)
- ✅ Memory gallery with performance status badges
- ✅ Profile with caregiver emergency info

### Caregiver Portal
- ✅ Caregiver authentication (secure session management)
- ✅ Multi-patient management with in-header patient selector
- ✅ Patient profiles with MMSE score & diagnosis tracking
- ✅ Multi-photo memory creation with per-photo labeling
- ✅ Family member management with reference photos
- ✅ Therapy session history with detailed drill-down views
- ✅ Advanced analytics (mood trends, recall scores, engagement metrics)
- ✅ PDF report generation & export
- ✅ **Patient Transfer** — securely hand off a patient between caregivers
- ✅ **Patient Briefing Slideshow** — immersive 7-slide onboarding for the receiving caregiver
- ✅ Transfer Center with real-time notification badge
- ✅ Dark/Light theme support

### Backend (Supabase)
- ✅ PostgreSQL 17 database
- ✅ Production-grade Row Level Security (RLS)
- ✅ Gemini Edge Functions for therapy sessions
- ✅ Secure file storage with bucket policies
- ✅ PatientTransfer table with full state machine (pending → accepted/rejected/cancelled/expired)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Mobile README](./mobile/README.md) | Mobile app setup & interactive therapy flow |
| [Portal README](./portal/README.md) | Web portal setup, features & API reference |
| [Supabase Setup](./SUPABASE_SETUP.md) | SQL/Schema & RLS production policies |
| [Clinic Walkthrough](./docs/audit/walkthrough.md) | Technical guide to AI therapy refactor |
| [Closing Report](./docs/audit/project_closing_report.md) | Final project maturity analysis |

---

## 🧪 Testing

```bash
# Portal type checking
cd portal
npx tsc --noEmit

# Run dev server
npm run dev
```

---

## 📈 Project Status

| Component | Status |
|-----------|--------|
| AI Therapy | ✅ Complete |
| Mobile App | ✅ Complete |
| Portal Web | ✅ Complete |
| Backend/DB | ✅ Complete |
| Face Rec V2 | ✅ Complete |
| Patient Transfer | ✅ Complete |
| Security Audit | ✅ Complete (RLS + API hardened) |

---

## 📝 License

This project is for academic purposes only.

---

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Google Gemini for AI therapy engine
- Expo for mobile development framework
- Next.js for web framework
