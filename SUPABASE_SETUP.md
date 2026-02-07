# Supabase Configuration Guide

This document describes the Supabase setup for the Memora platform.

## Project Details

- **Project Name**: Memora AI
- **Region**: ap-south-1 (Mumbai)
- **Database**: PostgreSQL 17

## Database Schema

The database schema is managed via Prisma and synchronized with Supabase.

### Tables

| Table | Description |
|-------|-------------|
| `Caregiver` | User accounts for caregivers |
| `Patient` | Patient profiles |
| `Memory` | Photos and memories |
| `FamilyMember` | Family contacts for recognition |
| `MemoryPhoto` | Per-photo AI labels & cached questions |
| `TherapySession` | Therapy session logs |
| `SessionMemory` | Memory responses with per-photo scores |

### Schema Diagram

```
┌─────────────┐      ┌─────────────┐
│  Caregiver  │──1:N─│   Patient   │
└─────────────┘      └─────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
          1:N             1:N             1:N
           │               │               │
      ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐
      │ Memory  │    │FamilyMember│   │TherapySession│
      └─────────┘    └───────────┘   └───────────┘
```

## Row Level Security (RLS) Policies

RLS is enabled on all tables to ensure data isolation.

### Patient Table
```sql
-- RLS Policy is now granular. Use docs/security/rls_policies.sql for full implementation.
```

### Memory Table
```sql
ALTER TABLE "Memory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read memories" ON "Memory"
FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated full access" ON "Memory"
FOR ALL TO authenticated USING (true);
```

### FamilyMember Table
```sql
ALTER TABLE "FamilyMember" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read family" ON "FamilyMember"
FOR SELECT TO anon USING (true);

CREATE POLICY "Allow authenticated full access" ON "FamilyMember"
FOR ALL TO authenticated USING (true);
```

### Caregiver Table
```sql
ALTER TABLE "Caregiver" ENABLE ROW LEVEL SECURITY;

-- Allow anon to read (for profile display)
GRANT SELECT ON "Caregiver" TO anon;
CREATE POLICY "Allow anon read of caregivers" ON "Caregiver"
FOR SELECT TO anon, authenticated USING (true);
```

### TherapySession Table
```sql
ALTER TABLE "TherapySession" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert sessions" ON "TherapySession"
FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon read sessions" ON "TherapySession"
FOR SELECT TO anon USING (true);
```

## Custom RPC Functions

### `login_patient`

Used by the mobile app for patient authentication.

```sql
CREATE OR REPLACE FUNCTION login_patient(patient_name TEXT, patient_pin TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_patient RECORD;
BEGIN
    SELECT * INTO found_patient
    FROM "Patient"
    WHERE LOWER(name) = LOWER(patient_name) AND pin = patient_pin;
    
    IF found_patient IS NULL THEN
        RETURN json_build_object('error', 'Invalid credentials');
    END IF;
    
    RETURN json_build_object(
        'patientId', found_patient.id,
        'name', found_patient.name
    );
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION login_patient(TEXT, TEXT) TO anon;
```

## Storage Buckets

| Bucket | Purpose | Access |
|--------|---------|--------|
| `memories` | Memory photos | Public read, Authenticated write |
| `family-photos` | Family member photos | Public read, Authenticated write |
| `patient-photos` | Patient profile photos | Public read, Authenticated write |

### Storage Policy Example
```sql
-- Public read access
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'memories');

-- Authenticated upload
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'memories');
```

## Environment Variables

### Portal (.env)
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Mobile (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

## Troubleshooting

### Common Issues

1. **"permission denied for table X"**
   - Ensure RLS is enabled: `ALTER TABLE "X" ENABLE ROW LEVEL SECURITY;`
   - Grant SELECT to anon: `GRANT SELECT ON "X" TO anon;`
   - Create policy: `CREATE POLICY "..." ON "X" FOR SELECT TO anon USING (true);`

2. **"function login_patient does not exist"**
   - Run the RPC function creation SQL
   - Grant execute permission to anon

3. **Prisma schema out of sync**
   - Run: `npx prisma db push`
   - Or: `npx prisma migrate deploy`

## Useful Commands

```bash
# View current policies
SELECT * FROM pg_policies;

# Check RLS status
SELECT relname, relrowsecurity FROM pg_class 
WHERE relname IN ('Patient', 'Memory', 'FamilyMember', 'Caregiver');

# Grant permissions
GRANT SELECT ON "TableName" TO anon;
GRANT ALL ON "TableName" TO authenticated;
```
