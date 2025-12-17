# Supabase Migration Guide - Mobile App

## Quick Setup for Production

### Step 1: Install Supabase SDK
```bash
npx expo install @supabase/supabase-js
```

### Step 2: Create Environment File
Copy `.env.example` to `.env` and fill in:
```env
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### Step 3: Create Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
```

### Step 4: Update Login Screen
Replace AsyncStorage login with Supabase auth:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### Step 5: Fetch Patient Data
```typescript
const { data: memories } = await supabase
  .from('Memory')
  .select('*')
  .eq('patientId', patientId);
```

## Current Status
- ✅ App uses AsyncStorage for local demo
- ✅ Ready to swap in Supabase when needed
- ✅ No code changes needed to schema
