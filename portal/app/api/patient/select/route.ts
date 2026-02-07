// Patient Selection API
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { patientId } = await request.json()

        // Verify patient belongs to caregiver
        const { data: patient, error } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (error || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('selectedPatientId', patientId, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
        })

        return NextResponse.json({ success: true, patientId })
    } catch (error) {
        console.error('Select patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
