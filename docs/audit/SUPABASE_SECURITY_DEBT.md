# Supabase Security Debt & Hardening Plan

As of the February 2026 audit, the following items remain as "Security Debt" in the Supabase layer and should be addressed in the next phase.

## 1. Row Level Security (RLS)
The following tables have RLS disabled or overly permissive policies:
- **Patient**: RLS is currently disabled.
- **FamilyMember**: RLS is currently disabled.
- **Caregiver**: Permissive policy allowing `select` without strict session checks.
- **MemoryPhoto / SessionMemory**: Policies rely on global visibility.

> [!CAUTION]
> While the Portal API scopes all queries using `supabaseAdmin`, bypassing RLS, enabling RLS provides an essential secondary "Defense in Depth" layer.

## 2. Database Functions
- **Mutable Search Path**: The `login_patient` and other custom RPC functions use a mutable search path, which is a potential SQL injection vector if a malicious user creates a shadowing function in a different schema.
- **Fix**: Set `search_path = public` explicitly on all functions.

## 3. Storage Buckets
- **Public URL Usage**: All photos are currently fetched via `getPublicUrl`. 
- **Recommendation**: Transition to signed URLs for patient photos to ensure HIPPA-grade privacy.
