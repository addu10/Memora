// Patients API Routes
import { NextResponse } from 'next/server'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// GET /api/patients - List all patients
export async function GET() {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch patients for this caregiver
        const { data: patients, error } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('caregiverId', session.userId)
            .order('updatedAt', { ascending: false })

        if (error) throw error

        // Get counts for each patient
        const patientsWithCounts = await Promise.all(
            (patients || []).map(async (patient) => {
                const [sessionsCount, memoriesCount, familyCount] = await Promise.all([
                    supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
                    supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', patient.id),
                    supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', patient.id)
                ])

                return {
                    ...patient,
                    _count: {
                        sessions: sessionsCount.count || 0,
                        memories: memoriesCount.count || 0,
                        familyMembers: familyCount.count || 0
                    }
                }
            })
        )

        return NextResponse.json({ patients: patientsWithCounts })

    } catch (error) {
        console.error('Get patients error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST /api/patients - Create a new patient
export async function POST(request: Request) {
    try {
        const session = await getSession()

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, age, mmseScore, diagnosis, notes, photoUrl, pin } = body

        if (!name || !age) {
            return NextResponse.json(
                { error: 'Name and age are required' },
                { status: 400 }
            )
        }

        const { data: patient, error } = await supabaseAdmin
            .from('Patient')
            .insert({
                id: generateId(),
                name,
                age: parseInt(age),
                mmseScore: mmseScore ? parseInt(mmseScore) : null,
                diagnosis: diagnosis || null,
                notes: notes || null,
                photoUrl: photoUrl || null,
                pin: pin || "0000",
                caregiverId: session.userId,
                updatedAt: now()
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ patient }, { status: 201 })

    } catch (error) {
        console.error('Create patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
