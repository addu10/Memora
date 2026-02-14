// Patient Transfer API Routes
import { NextResponse } from 'next/server'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// POST /api/transfers — Initiate a patient transfer
export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { patientId, recipientEmail, message } = body

        // --- Validation ---
        if (!patientId || !recipientEmail) {
            return NextResponse.json(
                { error: 'Patient ID and recipient email are required' },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(recipientEmail)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // --- Security: Verify sender owns the patient ---
        const { data: patient, error: patientError } = await supabaseAdmin
            .from('Patient')
            .select('id, name, caregiverId')
            .eq('id', patientId)
            .eq('caregiverId', session.userId)
            .single()

        if (patientError || !patient) {
            return NextResponse.json(
                { error: 'Patient not found or you do not have permission' },
                { status: 404 }
            )
        }

        // --- Security: Prevent self-transfer ---
        const normalizedEmail = recipientEmail.toLowerCase().trim()

        if (normalizedEmail === session.email.toLowerCase()) {
            return NextResponse.json(
                { error: 'You cannot transfer a patient to yourself' },
                { status: 400 }
            )
        }

        // --- Lookup recipient caregiver ---
        const { data: recipient, error: recipientError } = await supabaseAdmin
            .from('Caregiver')
            .select('id, name, email')
            .eq('email', normalizedEmail)
            .single()

        if (recipientError || !recipient) {
            return NextResponse.json(
                { error: 'No caregiver found with that email. They must register on Memora first.' },
                { status: 404 }
            )
        }

        // --- Security: Check for existing pending transfer ---
        const { data: existingTransfer } = await supabaseAdmin
            .from('PatientTransfer')
            .select('id')
            .eq('patientId', patientId)
            .eq('status', 'pending')
            .single()

        if (existingTransfer) {
            return NextResponse.json(
                { error: 'This patient already has a pending transfer. Cancel it first before initiating a new one.' },
                { status: 409 }
            )
        }

        // --- Create transfer ---
        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 72) // 72 hour expiry

        const { data: transfer, error: createError } = await supabaseAdmin
            .from('PatientTransfer')
            .insert({
                id: generateId(),
                patientId: patient.id,
                fromCaregiverId: session.userId,
                toCaregiverId: recipient.id,
                status: 'pending',
                transferToken: generateId(),
                message: message?.trim() || null,
                expiresAt: expiresAt.toISOString(),
            })
            .select()
            .single()

        if (createError) throw createError

        return NextResponse.json({
            transfer: {
                id: transfer.id,
                patientName: patient.name,
                recipientName: recipient.name,
                recipientEmail: recipient.email,
                status: transfer.status,
                expiresAt: transfer.expiresAt,
                createdAt: transfer.createdAt,
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Create transfer error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// GET /api/transfers — List all transfers for the current caregiver
export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // First, expire any stale pending transfers owned by this user
        await supabaseAdmin
            .from('PatientTransfer')
            .update({ status: 'expired' })
            .eq('fromCaregiverId', session.userId)
            .eq('status', 'pending')
            .lt('expiresAt', now())

        // Fetch incoming transfers (where I am the receiver)
        const { data: incoming, error: inErr } = await supabaseAdmin
            .from('PatientTransfer')
            .select('*')
            .eq('toCaregiverId', session.userId)
            .order('createdAt', { ascending: false })

        if (inErr) throw inErr

        // Fetch outgoing transfers (where I am the sender)
        const { data: outgoing, error: outErr } = await supabaseAdmin
            .from('PatientTransfer')
            .select('*')
            .eq('fromCaregiverId', session.userId)
            .order('createdAt', { ascending: false })

        if (outErr) throw outErr

        // Enrich with names
        const enrichTransfer = async (transfer: any, direction: 'incoming' | 'outgoing') => {
            const [patientRes, otherCaregiverRes] = await Promise.all([
                supabaseAdmin.from('Patient').select('name, photoUrl').eq('id', transfer.patientId).single(),
                supabaseAdmin.from('Caregiver').select('name, email').eq('id',
                    direction === 'incoming' ? transfer.fromCaregiverId : transfer.toCaregiverId
                ).single(),
            ])

            return {
                id: transfer.id,
                patientId: transfer.patientId,
                patientName: patientRes.data?.name || 'Unknown Patient',
                patientPhoto: patientRes.data?.photoUrl || null,
                otherCaregiverName: otherCaregiverRes.data?.name || 'Unknown',
                otherCaregiverEmail: otherCaregiverRes.data?.email || '',
                status: transfer.status,
                message: transfer.message,
                expiresAt: transfer.expiresAt,
                respondedAt: transfer.respondedAt,
                createdAt: transfer.createdAt,
                direction,
            }
        }

        const enrichedIncoming = await Promise.all(
            (incoming || []).map(t => enrichTransfer(t, 'incoming'))
        )
        const enrichedOutgoing = await Promise.all(
            (outgoing || []).map(t => enrichTransfer(t, 'outgoing'))
        )

        return NextResponse.json({
            incoming: enrichedIncoming,
            outgoing: enrichedOutgoing,
        })

    } catch (error) {
        console.error('List transfers error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
