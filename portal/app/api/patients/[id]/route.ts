// Patient by ID API Route
import { NextResponse } from 'next/server'
import { supabaseAdmin, now } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// Helper to extract storage path from Supabase URL
function getPathFromUrl(url: string, bucket: string) {
    if (!url) return null
    try {
        const parts = url.split(`${bucket}/`)
        return parts.length > 1 ? parts[1] : null
    } catch (e) {
        return null
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // 1. Verify patient ownership and get all data for cleanup
        const { data: patient, error: findError } = await supabaseAdmin
            .from('Patient')
            .select(`
                id,
                photoUrl,
                Memory (
                    id,
                    photoUrls,
                    MemoryPhoto (id, photoUrl)
                ),
                FamilyMember (
                    id,
                    photoUrls
                ),
                TherapySession (
                    id
                )
            `)
            .eq('id', id)
            .eq('caregiverId', session.userId)
            .single()

        if (findError || !patient) {
            return NextResponse.json({ error: 'Patient not found or unauthorized' }, { status: 404 })
        }

        // 2. Collect all storage paths to purge
        const pathsToPurge: { bucket: string; path: string }[] = []

        // Patient photo
        if (patient.photoUrl) {
            // Patient photos might be in a 'patients' or 'family-photos' bucket
            // Let's check both or parse from URL
            const coachPath = getPathFromUrl(patient.photoUrl, 'family-photos')
            if (coachPath) pathsToPurge.push({ bucket: 'family-photos', path: coachPath })
        }

        // Family photos
        patient.FamilyMember?.forEach((fm: any) => {
            if (Array.isArray(fm.photoUrls)) {
                fm.photoUrls.forEach((url: string) => {
                    const path = getPathFromUrl(url, 'family-photos')
                    if (path) pathsToPurge.push({ bucket: 'family-photos', path })
                })
            }
        })

        // Memory photos
        patient.Memory?.forEach((mem: any) => {
            // Check top-level urls if any
            if (Array.isArray(mem.photoUrls)) {
                mem.photoUrls.forEach((url: string) => {
                    const path = getPathFromUrl(url, 'memories')
                    if (path) pathsToPurge.push({ bucket: 'memories', path })
                })
            }
            // Check detailed memory photos
            mem.MemoryPhoto?.forEach((mp: any) => {
                const path = getPathFromUrl(mp.photoUrl, 'memories')
                if (path) pathsToPurge.push({ bucket: 'memories', path })
            })
        })

        // 3. Purge storage files
        if (pathsToPurge.length > 0) {
            const buckets = ['memories', 'family-photos']
            for (const bucket of buckets) {
                const bucketPaths = pathsToPurge
                    .filter(p => p.bucket === bucket)
                    .map(p => p.path)

                if (bucketPaths.length > 0) {
                    await supabaseAdmin.storage.from(bucket).remove(bucketPaths)
                }
            }
        }

        // 4. Delete database records in order
        // First, SessionMemory (join table)
        const sessionIds = (patient.TherapySession || []).map((s: any) => s.id)
        if (sessionIds.length > 0) {
            await supabaseAdmin.from('SessionMemory').delete().in('sessionId', sessionIds)
        }

        const memoryIds = (patient.Memory || []).map((m: any) => m.id)
        if (memoryIds.length > 0) {
            // SessionMemory links to memories too
            await supabaseAdmin.from('SessionMemory').delete().in('memoryId', memoryIds)
            // MemoryPhotos
            await supabaseAdmin.from('MemoryPhoto').delete().in('memoryId', memoryIds)
            // Memories
            await supabaseAdmin.from('Memory').delete().in('id', memoryIds)
        }

        // Therapy Sessions
        if (sessionIds.length > 0) {
            await supabaseAdmin.from('TherapySession').delete().in('id', sessionIds)
        }

        // Family Members
        await supabaseAdmin.from('FamilyMember').delete().eq('patientId', id)

        // Finally, the Patient
        const { error: deleteError } = await supabaseAdmin
            .from('Patient')
            .delete()
            .eq('id', id)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Fetch patient
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', id)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Fetch related data in parallel
        const [memoriesResult, familyResult, sessionsResult, countsResult] = await Promise.all([
            supabaseAdmin.from('Memory').select('*').eq('patientId', id),
            supabaseAdmin.from('FamilyMember').select('*').eq('patientId', id),
            supabaseAdmin.from('TherapySession').select('*').eq('patientId', id),
            Promise.all([
                supabaseAdmin.from('TherapySession').select('id', { count: 'exact', head: true }).eq('patientId', id),
                supabaseAdmin.from('Memory').select('id', { count: 'exact', head: true }).eq('patientId', id),
                supabaseAdmin.from('FamilyMember').select('id', { count: 'exact', head: true }).eq('patientId', id)
            ])
        ])

        return NextResponse.json({
            ...patient,
            memories: memoriesResult.data || [],
            familyMembers: familyResult.data || [],
            sessions: sessionsResult.data || [],
            _count: {
                sessions: countsResult[0].count || 0,
                memories: countsResult[1].count || 0,
                familyMembers: countsResult[2].count || 0
            }
        })
    } catch (error) {
        console.error('Get patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        // Verify patient belongs to caregiver
        const { data: existing, error: findError } = await supabaseAdmin
            .from('Patient')
            .select('*')
            .eq('id', id)
            .eq('caregiverId', session.userId)
            .single()

        if (findError || !existing) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        const { data: patient, error: updateError } = await supabaseAdmin
            .from('Patient')
            .update({
                name: body.name ?? existing.name,
                age: body.age ?? existing.age,
                mmseScore: body.mmseScore ?? existing.mmseScore,
                diagnosis: body.diagnosis ?? existing.diagnosis,
                notes: body.notes ?? existing.notes,
                photoUrl: body.photoUrl ?? existing.photoUrl,
                updatedAt: now()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

        return NextResponse.json(patient)
    } catch (error) {
        console.error('Update patient error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
