# Supabase Migration Guide

## Quick Switch from SQLite to Supabase

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down the project URL and keys

### Step 2: Update Environment Variables
Create/update `.env` file:
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
JWT_SECRET="your-secure-32-char-minimum-secret"
```

### Step 3: Update Schema
Open `prisma/schema.prisma` and uncomment the PostgreSQL section:
```prisma
// Comment out SQLite
// datasource db {
//   provider = "sqlite"
//   url      = env("DATABASE_URL")
// }

// Uncomment PostgreSQL
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4: Push Schema to Supabase
```bash
npx prisma db push
npx prisma generate
```

### Step 5: Seed Data (Optional)
```bash
node prisma/seed.js
```

## File Storage Migration (Photos)

For production, photos should be stored in Supabase Storage:

1. Create buckets: `memories`, `family-photos`
2. Install: `npm install @supabase/supabase-js`
3. Update API routes to upload to Supabase Storage

See `lib/supabase.ts` (create when ready)
