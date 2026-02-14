# Memora Caregiver Portal

A Next.js web application for caregivers to manage patients, upload memories, track therapy progress, and securely transfer patient ownership.

## Overview

The Caregiver Portal is designed for family members and healthcare professionals to:

- **Manage patient profiles** with clinical diagnosis data (MMSE)
- **Upload & label memories** with per-photo context for AI therapy
- **Track therapy sessions** with mood, duration, and recall analytics
- **Generate PDF reports** for clinical documentation
- **Transfer patients** securely between caregivers with an immersive onboarding flow

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL 17) with Supabase Admin SDK
- **Authentication**: Custom (bcrypt password hashing + HTTP-only cookies)
- **File Storage**: Supabase Storage
- **Theming**: Custom dark/light mode with CSS variables

## Project Structure

```
portal/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Login, Register, Logout
│   │   ├── patients/             # Patient CRUD + deletion cascade
│   │   ├── memories/             # Memory CRUD with multi-photo upload
│   │   ├── family/               # Family member management (patient-scoped)
│   │   ├── sessions/             # Therapy session logging & detail views
│   │   ├── transfers/            # Patient transfer lifecycle
│   │   │   ├── route.ts          # POST (initiate) + GET (list)
│   │   │   └── [id]/
│   │   │       ├── route.ts      # PUT (accept/reject) + DELETE (cancel)
│   │   │       └── briefing/     # GET (patient briefing data)
│   │   ├── reports/              # PDF report generation
│   │   ├── patient/              # Contextual patient selection (cookie)
│   │   ├── caregiver/            # Caregiver profile management
│   │   └── health/               # Health check endpoint
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── page.tsx              # Dashboard home (overview stats)
│   │   ├── patients/             # Patient list, add, edit, detail
│   │   ├── memories/             # Memory gallery, new memory wizard
│   │   ├── family/               # Family directory, add, edit
│   │   ├── sessions/             # Session history, detail drill-down
│   │   ├── progress/             # Analytics (mood, recall, engagement)
│   │   ├── transfers/            # Transfer Center + Briefing Slideshow
│   │   ├── reports/              # Report generation & export
│   │   ├── settings/             # User settings
│   │   ├── DashboardHeader.tsx   # Floating header with patient selector
│   │   └── layout.tsx            # Server-side layout (auth + data fetch)
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── components/               # Shared UI (Modal, ThemeContext, etc.)
│   └── globals.css               # Global styles & theme variables
├── lib/                          # Utilities
│   ├── supabase.ts               # Supabase client (browser + admin)
│   ├── auth.ts                   # Session management helpers
│   └── database.types.ts         # Generated TypeScript types
└── public/                       # Static assets (logo, images)
```

## Database Schema

### Models

| Model | Description |
|-------|-------------|
| `Caregiver` | User accounts for family members/professionals |
| `Patient` | Alzheimer's patients (linked to caregiver via `caregiverId`) |
| `Memory` | Events/memories for therapy sessions |
| `MemoryPhoto` | Individual photos with AI labels (people, setting, activities) |
| `FamilyMember` | Reference people for face recognition |
| `TherapySession` | Clinical logs (duration, mood, completion status) |
| `SessionMemory` | Per-memory recall scores within a session |
| `PatientTransfer` | Transfer lifecycle (pending → accepted/rejected/cancelled/expired) |

### Key Relationships

```
Caregiver  1:N  Patient
Patient    1:N  Memory
Patient    1:N  FamilyMember
Patient    1:N  TherapySession
Memory     1:N  MemoryPhoto
TherapySession  N:N  Memory  (via SessionMemory)
PatientTransfer  N:1  Patient, Caregiver (from), Caregiver (to)
```

## API Routes

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Caregiver login |
| POST | `/api/auth/register` | Create caregiver account |
| POST | `/api/auth/logout` | Clear session |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List all patients for caregiver |
| POST | `/api/patients` | Create new patient |
| GET | `/api/patients/[id]` | Get patient details |
| PUT | `/api/patients/[id]` | Update patient |
| DELETE | `/api/patients/[id]` | Delete patient (cascade: memories, photos, sessions) |

### Memories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memories` | List memories for selected patient |
| POST | `/api/memories` | Upload new memory (multi-photo with labels) |
| GET | `/api/memories/[id]` | Get memory details |
| PUT | `/api/memories/[id]` | Update memory |
| DELETE | `/api/memories/[id]` | Delete memory |

### Family Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/family?patientId=xxx` | List family members (patient-scoped) |
| POST | `/api/family` | Add family member |
| GET | `/api/family/[id]` | Get member details |
| PUT | `/api/family/[id]` | Update member |
| DELETE | `/api/family/[id]` | Delete member |

### Therapy Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List sessions for patient |
| GET | `/api/sessions/[id]` | Get session detail with per-memory recall |

### Patient Transfers
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transfers` | Initiate transfer (by receiver email) |
| GET | `/api/transfers` | List incoming & outgoing transfers |
| PUT | `/api/transfers/[id]` | Accept or reject (`{ action: 'accept' | 'reject' }`) |
| DELETE | `/api/transfers/[id]` | Cancel transfer (sender only) |
| GET | `/api/transfers/[id]/briefing` | Patient briefing data (receiver only) |

### Reports & Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Generate PDF progress report |
| POST | `/api/patient/select` | Set selected patient cookie |
| GET | `/api/health` | Health check |

## Environment Variables

Create a `.env` file in the `portal/` directory:

```env
# Supabase
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Running the Portal

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Type check
npx tsc --noEmit
```

## Features

### 1. Dashboard Overview
- Overview of selected patient with quick stats
- Recent activity feed
- Patient selector in the header (supports multiple patients)

### 2. Patient Management
- Create/edit patient profiles with MMSE scores and diagnosis
- Set login PIN for mobile app access
- Delete patient with full cascade (memories, photos, sessions, family)

### 3. Memory Gallery
- **Multi-Photo Upload**: Attach several photos to one memory event
- **Per-Photo Labels**: AI-analyzed people, activities, setting, and facial expressions
- **Importance Levels**: Prioritize high-value memories (1–5 stars)
- **Generated Questions**: AI-generated therapeutic prompts for each photo

### 4. Family Directory
- Add family members with multiple reference photos
- Define relationships (spouse, child, sibling, etc.)
- Recognition notes for therapy context

### 5. Therapy Sessions
- View completed therapy sessions with duration and mood
- Drill-down detail view with per-memory recall scores
- Session timeline and performance trends

### 6. Analytics & Reporting
- Mood distribution charts over time
- Recall score trends and engagement metrics
- PDF report generation for clinical documentation

### 7. Patient Transfer
- **Initiate**: Send transfer request to another caregiver by email
- **Transfer Center**: View and manage incoming/outgoing transfers
- **Notification Badge**: Real-time count of pending incoming transfers
- **Accept/Reject/Cancel**: Full lifecycle management with security checks
- **Patient Briefing Slideshow**: 7-slide immersive onboarding for the receiving caregiver:
  1. Welcome — patient name, photo, and basic info
  2. Medical Profile — age, MMSE, diagnosis, clinical notes
  3. Memory Gallery — scrollable grid of all memories with photos
  4. Family & Friends — cards with photos and relationships
  5. Therapy History — session count, duration, mood distribution
  6. Progress Insights — engagement score, recall trends
  7. Handoff Complete — confirmation with dashboard CTA
- **Auto-Select**: After accepting, the new patient is automatically selected
- **72-Hour Expiry**: Pending transfers auto-expire for security

## Security

- Passwords hashed with bcrypt (12 rounds)
- HTTP-only session cookies for authentication
- All API routes verify session before processing
- Patient data scoped to caregiver via `caregiverId` foreign key
- Transfer API: sender can only transfer their own patients; receiver must explicitly accept
- Briefing API: only the receiving caregiver can view patient data; explicit column selection prevents data over-exposure
- Multi-tenancy enforced: family members, memories, and sessions are filtered by `patientId`
