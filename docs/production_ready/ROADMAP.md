# Memora Production Roadmap

This document outlines the strategic transition of Memora from a development prototype to a production-grade healthcare application.

## 1. Project Analysis (Phase-by-Phase)

### 🏥 Phase 1: Portal (Next.js)
- **Current State**: Functional dashboard, caregiver-focused, using local Next.js dev server.
- **Production Needs**: Server-side rendering (SSR) optimization, production secrets management, and robust error boundaries.
- **Hosting**: Vercel (Optimized for Next.js).

### 📱 Phase 2: Mobile App (React Native / Expo)
- **Current State**: Expo Go compatible, development builds.
- **Production Needs**: Native binaries (.ipa/.aab), App Store/Play Store compliance, and Offline-first resilience.
- **Hosting**: Expo Application Services (EAS).

### 🗄️ Phase 3: Supabase (Backend-as-a-Service)
- **Current State**: "Free Tier" project, mostly open RLS (Row Level Security) or shared logic.
- **Production Needs**: Hardened RLS policies, connection pooling (Supavisor), and automated database backups.
- **Hosting**: Supabase Cloud (Pro Tier).

### 🧠 Phase 4: Inference v3 (Face Recognition)
- **Current State**: Gradio-based research server (`app_optimized.py`).
- **Production Needs**: High-performance API (FastAPI), GPU-accelerated hosting, and model versioning.
- **Hosting**: Modal Labs, AWS EC2, or RunPod.

---

## 2. Core Production Concepts

### � CI/CD Pipeline
**Continuous Integration (CI)**:
- Every code push triggers a "build test" to ensure no compilation errors.
- Runs `eslint` and `typescript` checks automatically.
- Prevents "breaking the main branch."

**Continuous Deployment (CD)**:
- Once CI passes, code is automatically pushed to a "Staging" environment.
- After manual approval, it merges to "Production" (Live users).

### 🛡️ Rate Limiting & Request Control
To prevent API abuse (and high Gemini/Cloud costs):
1. **Infrastructure Level**: Cloudflare WAF to block bot traffic.
2. **API Level**: Next.js Middleware using `upstash-ratelimit` to limit IPs (e.g., 60 requests/min).
3. **Database Level**: Supabase Edge Function quotas (e.g., max 10 face recognitions per hour per user).

---

## 3. Deployment Strategy

### Web Deployment (Vercel)
1. Link GitHub `main` branch to Vercel.
2. Configure `PROD_SUPABASE_URL` and `PROD_SUPABASE_ANON_KEY`.
3. Enable "Speed Insights" to monitor real-user performance.

### Mobile Deployment (EAS)
1. `eas build --platform all` to generate store-ready files.
2. `eas credentials` to manage Apple/Google certificates.
3. `eas submit` to push to TestFlight / Google Internal Testing.

### Inference Deployment (Docker + GPU)
1. Wrap `app_optimized.py` in a **FastAPI** wrapper for lower overhead than Gradio.
2. Build a Docker image with `CUDA` support.
3. Deploy to a serverless GPU provider (like Modal) to only pay when a face is being scanned.
