import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, pin } = body

        if (!name || !pin) {
            return NextResponse.json(
                { error: 'Name and PIN are required' },
                { status: 400 }
            )
        }

        // Case-insensitive name search, exact PIN match
        const { data: patient, error } = await supabaseAdmin
            .from('Patient')
            .select('id, name, photoUrl')
            .ilike('name', name)
            .eq('pin', pin)
            .limit(1)
            .single()

        if (error || !patient) {
            return NextResponse.json(
                { error: 'Invalid name or PIN' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            patientId: patient.id,
            name: patient.name,
            photoUrl: patient.photoUrl
        })

    } catch (error) {
        console.error('Patient login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
