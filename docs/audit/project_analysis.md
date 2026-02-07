# Memora Project: Comprehensive Analysis

> **Analysis Date:** February 7, 2026  
> **Status:** ~95% MVP Complete

---

## 🎯 Project Vision

**Memora** is a digital reminiscence therapy application for **early-stage Alzheimer's patients** in Kerala, India. It uses AI and family photos to trigger positive memories and reduce caregiver burden.

---

## 🏗️ Architecture Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        Memora Platform                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌───────────────┐ │
│  │   Mobile App    │    │  Caregiver      │    │  Inference    │ │
│  │   (Expo/RN)     │    │  Portal         │    │  Engine V2    │ │
│  │                 │    │  (Next.js)      │    │  (HuggingFace)│ │
│  └────────┬────────┘    └────────┬────────┘    └───────┬───────┘ │
│           │                      │                     │         │
│           └──────────┬───────────┘                     │         │
│                      │                                 │         │
│           ┌──────────▼───────────┐                     │         │
│           │  Supabase Edge       │◄────────────────────┘         │
│           │  Functions (Proxy)   │                               │
│           └──────────┬───────────┘                               │
│                      │                                           │
│           ┌──────────▼───────────┐                               │
│           │     Supabase         │                               │
│           │  • PostgreSQL DB     │                               │
│           │  • Storage Buckets   │                               │
│           │  • RLS Policies      │                               │
│           └──────────────────────┘                               │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
Final Year/
├── mobile/                 # React Native (Expo) - Patient App
├── portal/                 # Next.js 15 - Caregiver Dashboard
├── inference_v2/          # Face Recognition V2 (Active) 
├── models/                # ML Model Configurations
├── scripts/               # Training scripts
├── supabase/              # Edge functions
└── docs/                  # Project documentation & audits
```

---

## 🔑 Key Technical Decisions

### 1. Face Recognition V2
- **Model:** VGG-Face via DeepFace
- **Accuracy:** >99% on validated sets
- **Performance:** Parallel verification with ThreadPoolExecutor

### 2. AI-Powered Reminiscence (New)
- **Model:** Gemini-1.5-Pro via Supabase Edge Functions
- **Strategy:** Granular per-photo labeling to generate clinical-grade questions.
- **Impact:** Replaces simple slideshows with interactive therapeutic sessions.

---

## ✅ Feature Status (MVP)

1. **Authentication:** 100% (PIN mobile, Password portal)
2. **Patient Management:** 100%
3. **Memory Therapy:** 100% (Gemini-powered flow)
4. **Face recognition:** 100%
5. **Progress Analytics:** 100% (Session-level trends)

---

## 📊 Timeline (Deadline: March 1, 2026)
Refactor completed ahead of schedule. Final month reserved for user testing and performance tuning.
