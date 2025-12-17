# Memora Caregiver Portal

A Next.js web application for caregivers to manage patients, upload memories, and track therapy progress.

## Overview

The Caregiver Portal is designed for family members and healthcare professionals to:

- **Manage patient profiles** and settings
- **Upload and organize photos** for memory therapy
- **Add family member information** for face recognition
- **Track therapy session history** and progress
- **View analytics** on patient engagement

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Custom (bcrypt password hashing)
- **File Storage**: Supabase Storage

## Project Structure

```
portal/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # Authentication endpoints
│   │   ├── patients/         # Patient CRUD
│   │   ├── memories/         # Memory CRUD
│   │   ├── family/           # Family member CRUD
│   │   └── sessions/         # Therapy sessions
│   ├── dashboard/            # Protected dashboard pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── patients/         # Patient management
│   │   ├── memories/         # Memory management
│   │   ├── family/           # Family directory
│   │   └── layout.tsx        # Dashboard layout
│   ├── login/                # Login page
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── components/               # Reusable UI components
├── lib/                      # Utilities
│   ├── supabase.ts           # Supabase client
│   └── auth.ts               # Auth helpers
├── prisma/                   # Database schema
│   ├── schema.prisma         # Prisma schema
│   ├── migrations/           # SQL migrations
│   └── seed.ts               # Demo data seeder
└── scripts/                  # Utility scripts
```

## Database Schema

### Models

| Model | Description |
|-------|-------------|
| `Caregiver` | User accounts for family members/professionals |
| `Patient` | Alzheimer's patients receiving therapy |
| `Memory` | Photos and memories for therapy sessions |
| `FamilyMember` | Contacts for face recognition |
| `TherapySession` | Logged therapy sessions |
| `SessionMemory` | Memory responses within sessions |

### Key Relationships

```
Caregiver 1:N Patient
Patient 1:N Memory
Patient 1:N FamilyMember
Patient 1:N TherapySession
TherapySession N:N Memory (via SessionMemory)
```

## API Routes

### Authentication
- `POST /api/auth/login` - Caregiver login
- `POST /api/auth/register` - Create caregiver account
- `POST /api/auth/logout` - Clear session

### Patients
- `GET /api/patients` - List all patients (for caregiver)
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Memories
- `GET /api/memories` - List memories for patient
- `POST /api/memories` - Upload new memory
- `GET /api/memories/[id]` - Get memory details
- `PUT /api/memories/[id]` - Update memory
- `DELETE /api/memories/[id]` - Delete memory

### Family Members
- `GET /api/family` - List family members
- `POST /api/family` - Add family member
- `GET /api/family/[id]` - Get member details
- `PUT /api/family/[id]` - Update member
- `DELETE /api/family/[id]` - Delete member

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

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed demo data (optional)
npx prisma db seed

# Start development server
npm run dev
```

## Features

### 1. Dashboard
- Overview of all patients
- Quick stats (sessions, memories, family members)
- Recent activity feed

### 2. Patient Management
- Create/edit patient profiles
- Set login PIN for mobile app
- Add diagnosis and notes

### 3. Memory Gallery
- Upload multiple photos per memory
- Tag with events, locations, people
- Set importance levels

### 4. Family Directory
- Add family members with photos
- Define relationships
- Add recognition notes

### 5. Session History
- View completed therapy sessions
- Mood tracking over time
- Memory recall scores

## Security Notes

- Passwords are hashed with bcrypt
- Supabase RLS policies enforce data isolation
- Each caregiver can only access their patients' data
