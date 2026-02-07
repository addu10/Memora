import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'

// GET /api/family - List family members for current patient
export async function GET(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Find the first patient for this caregiver
    const { data: patient } = await supabaseAdmin
        .from('Patient')
        .select('id')
        .eq('caregiverId', session.userId)
        .limit(1)
        .single()

    if (!patient) {
        return NextResponse.json([])
    }

    const { data: familyMembers, error } = await supabaseAdmin
        .from('FamilyMember')
        .select('id, name, relationship')
        .eq('patientId', patient.id)
        .order('name', { ascending: true })

    if (error) {
        console.error('Get family members error:', error)
        return NextResponse.json({ error: 'Failed to fetch family members' }, { status: 500 })
    }

    return NextResponse.json(familyMembers || [])
}

// POST /api/family - Create a new family member
export async function POST(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { name, relationship, photoUrls, notes, patientId } = body

        if (!name || !relationship || !patientId) {
            return NextResponse.json({ error: 'Name, relationship, and patientId are required' }, { status: 400 })
        }

        // Verify the patient belongs to the caregiver
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Invalid patient selected' }, { status: 404 })
        }

        const { data: newMember, error: createError } = await supabaseAdmin
            .from('FamilyMember')
            .insert({
                id: generateId(),
                name,
                relationship,
                photoUrls: photoUrls || [],
                notes: notes || null,
                patientId: patient.id,
                updatedAt: now()
            })
            .select()
            .single()

        if (createError) throw createError

        return NextResponse.json(newMember, { status: 201 })
    } catch (error) {
        console.error('Error creating family member:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
