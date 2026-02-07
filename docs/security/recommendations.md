# Security Recommendations & RLS Guide

This directory contains the security documentation and Supabase Row Level Security (RLS) policies required to secure the Memora platform.

## Why RLS?
Memora handles sensitive patient data. Without RLS, any authenticated user could potentially view or modify data belonging to other patients or caregivers. RLS ensures that:
1. Caregivers can only see their own patients.
2. Patient data is isolated by caregiver ID.
3. Mobile app access is restricted to the relevant patient context.

## Implementation Steps
To secure your Supabase instance:
1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Create a new query and paste the contents of [rls_policies.sql](file:///c:/Users/adnan/Documents/Final%20Year/docs/security/rls_policies.sql).
4. Run the script.

## Critical Tables Covered
- `Memory`
- `MemoryPhoto`
- `SessionMemory`
- `TherapySession`
- `Patient`
- `FamilyMember`

> [!WARNING]
> Enabling RLS without the correct policies will block all traffic to these tables. Always test your Portal and Mobile apps immediately after applying these changes.
