import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase keys in environment variables!')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
}

// Client-side Supabase client (uses anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key (bypasses RLS)
// Use this for server-side operations in API routes and server components
if (!supabaseServiceKey && process.env.NODE_ENV === 'production') {
    console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY not set - admin operations will fail in production')
}

export const supabaseAdmin = createClient<Database>(
    supabaseUrl,
    supabaseServiceKey || supabaseAnonKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

// Helper function to generate unique IDs (replaces Prisma's cuid)
export function generateId(): string {
    return crypto.randomUUID()
}

// Helper to get current timestamp in ISO format
export function now(): string {
    return new Date().toISOString()
}

// Re-export types for convenience
export type { Database } from './database.types'
export * from './database.types'
