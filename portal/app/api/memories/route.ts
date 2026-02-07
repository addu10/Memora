import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'

// Photo label interface for per-photo data
interface PhotoLabel {
    photoUrl: string
    people?: string[]
    description?: string
    setting?: string
    activities?: string
    facialExpressions?: string
}

// POST /api/memories - Create a new memory with per-photo labels
export async function POST(request: Request) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            title,
            description,
            photoUrls,
            photoLabels, // NEW: Array of per-photo labels
            date,
            event,
            location,
            people,
            importance,
            patientId
        } = body

        if (!title || !date || !event || !location || !people || !photoUrls || photoUrls.length === 0 || !patientId) {
            return NextResponse.json(
                { error: 'Missing required fields (including patient selection)' },
                { status: 400 }
            )
        }

        // Verify the caregiver's patient
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json({ error: 'Invalid patient selected' }, { status: 404 })
        }

        const memoryId = generateId()

        // Create the memory
        const { data: memory, error: createError } = await supabaseAdmin
            .from('Memory')
            .insert({
                id: memoryId,
                title,
                description: description || null,
                photoUrls,
                date: new Date(date).toISOString(),
                event,
                location,
                people,
                importance: parseInt(importance) || 3,
                patientId: patient.id,
                updatedAt: now()
            })
            .select()
            .single()

        if (createError) throw createError

        // Create MemoryPhoto records for each photo with per-photo labels
        const photoRecords = photoUrls.map((url: string, index: number) => {
            // Find matching label data (if provided)
            const labelData: PhotoLabel | undefined = photoLabels?.find(
                (label: PhotoLabel) => label.photoUrl === url
            )

            return {
                id: generateId(),
                memoryId: memoryId,
                photoUrl: url,
                photoIndex: index,
                people: labelData?.people || [],
                description: labelData?.description || null,
                setting: labelData?.setting || null,
                activities: labelData?.activities || null,
                facialExpressions: labelData?.facialExpressions || null
            }
        })

        if (photoRecords.length > 0) {
            const { error: photoError } = await supabaseAdmin
                .from('MemoryPhoto')
                .insert(photoRecords)

            if (photoError) {
                console.error('Error creating MemoryPhoto records:', photoError)
                // Don't fail the whole request, just log it
            }
        }

        return NextResponse.json(memory)
    } catch (error) {
        console.error('Create memory error:', error)
        return NextResponse.json(
            { error: 'Failed to create memory' },
            { status: 500 }
        )
    }
}

// GET /api/memories?patientId=xyz&search=Name
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')
    const searchQuery = searchParams.get('search')

    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let targetPatientId = patientId

    if (!targetPatientId) {
        const { data: firstPatient } = await supabaseAdmin
            .from('Patient')
            .select('id')
            .eq('caregiverId', session.userId)
            .limit(1)
            .single()

        if (firstPatient) targetPatientId = firstPatient.id
    }

    if (!targetPatientId) {
        return NextResponse.json([])
    }

    // Verify ownership of the target patient
    const { data: patient, error: patientError } = await supabaseAdmin
        .from('Patient')
        .select('id')
        .eq('id', targetPatientId)
        .eq('caregiverId', session.userId)
        .single()

    if (patientError || !patient) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Build query
    let query = supabaseAdmin
        .from('Memory')
        .select('*')
        .eq('patientId', targetPatientId)
        .order('date', { ascending: false })

    // Add search filter if present (searches 'people' field)
    if (searchQuery) {
        query = query.ilike('people', `%${searchQuery}%`)
    }

    const { data: memories, error } = await query

    if (error) {
        console.error('Get memories error:', error)
        return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
    }

    // NEW: Fetch photos for all returned memories
    if (memories && memories.length > 0) {
        const memoryIds = memories.map(m => m.id)
        const { data: photos, error: photosError } = await supabaseAdmin
            .from('MemoryPhoto')
            .select('*')
            .in('memoryId', memoryIds)
            .order('photoIndex', { ascending: true })

        if (!photosError && photos) {
            // Attach photos to each memory
            ; (memories as any[]).forEach(m => {
                m.photos = photos.filter(p => p.memoryId === m.id)
            })
        }
    }

    return NextResponse.json(memories || [])
}
