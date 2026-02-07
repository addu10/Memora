import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin, now } from '@/lib/supabase'

// GET /api/caregiver - Get profile
export async function GET(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: caregiver, error } = await supabaseAdmin
        .from('Caregiver')
        .select('name, email, phone')
        .eq('id', session.userId)
        .single()

    if (error) {
        return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
    }

    return NextResponse.json(caregiver)
}

// PUT /api/caregiver - Update profile
export async function PUT(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, phone } = await request.json()

    const { data: updated, error } = await supabaseAdmin
        .from('Caregiver')
        .update({ name, phone, updatedAt: now() })
        .eq('id', session.userId)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json(updated)
}
