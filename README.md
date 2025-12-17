# Memora - AI-Powered Memory Therapy Platform

An AI-assisted platform for Alzheimer's therapy, featuring face recognition and personalized memory exercises.

---

## 🧠 Project Overview

Memora is a **Final Year Project** designed to help early-stage Alzheimer's patients recognize family members and engage in memory therapy. The platform consists of:

1. **📱 Mobile App** - React Native app for patients
2. **💻 Caregiver Portal** - Next.js web app for family/caregivers
3. **🗄️ Backend** - Supabase (PostgreSQL + Auth + Storage)
4. **🤖 ML Models** - Face recognition (Coming Soon)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Memora Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐          ┌─────────────┐          ┌─────────┐ │
│  │   Mobile    │          │   Portal    │          │   ML    │ │
│  │    App      │          │    Web      │          │ Models  │ │
│  │ (Expo/RN)   │          │ (Next.js)   │          │ (TBD)   │ │
│  └──────┬──────┘          └──────┬──────┘          └────┬────┘ │
│         │                        │                      │      │
│         └────────────┬───────────┘                      │      │
│                      │                                  │      │
│              ┌───────▼───────┐                          │      │
│              │   Supabase    │◄─────────────────────────┘      │
│              │  (PostgreSQL) │                                 │
│              │  + Storage    │                                 │
│              │  + Auth       │                                 │
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
│   ├── prisma/             # Database schema & migrations
│   ├── lib/                # Supabase client, auth
│   └── README.md           # Portal documentation
│
├── training/               # ML model training (TBD)
│   ├── data/               # Training datasets
│   ├── models/             # Model definitions
│   └── scripts/            # Training scripts
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
- ✅ Personalized home screen with greeting
- ✅ Photo gallery with memories
- ✅ Family directory with photos
- ✅ Profile with caregiver info
- ⏳ Face recognition camera
- ⏳ Memory games

### Caregiver Portal
- ✅ Caregiver authentication
- ✅ Patient management (CRUD)
- ✅ Photo/memory upload
- ✅ Family member management
- ✅ Session history tracking
- ⏳ Analytics dashboard

### Backend (Supabase)
- ✅ PostgreSQL database
- ✅ Row Level Security (RLS)
- ✅ Custom RPC functions
- ✅ File storage
- ⏳ Edge functions for ML

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Mobile README](./mobile/README.md) | Mobile app setup & architecture |
| [Portal README](./portal/README.md) | Web portal setup & API docs |
| [Supabase Setup](./SUPABASE_SETUP.md) | Database configuration & RLS policies |
| [ML Pipeline](./ML_PIPELINE.md) | Machine learning roadmap & next steps |

---

## 🧪 Testing

```bash
# Portal tests
cd portal
npm run test

# Type checking
npm run type-check
```

---

## 📈 Project Status

| Component | Status |
|-----------|--------|
| Mobile UI | ✅ Complete |
| Portal UI | ✅ Complete |
| Database | ✅ Complete |
| Authentication | ✅ Complete |
| Face Recognition | 🔄 In Progress |
| Model Training | ⏳ Pending |
| Production Deploy | ⏳ Pending |

---

## 📝 License

This project is for academic purposes only.

---

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Expo for mobile development framework
- Next.js for web framework
