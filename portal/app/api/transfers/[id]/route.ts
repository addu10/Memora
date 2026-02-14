// Patient Transfer Accept/Reject/Cancel API
import { NextResponse } from 'next/server'
import { supabaseAdmin, now } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

// PUT /api/transfers/[id] — Accept or Reject a transfer
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { action } = body

        // --- Validation ---
        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "accept" or "reject".' },
                { status: 400 }
            )
        }

        // --- Fetch the transfer ---
        const { data: transfer, error: fetchError } = await supabaseAdmin
            .from('PatientTransfer')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !transfer) {
            return NextResponse.json(
                { error: 'Transfer not found' },
                { status: 404 }
            )
        }

        // --- Security: Only the receiver can accept/reject ---
        if (transfer.toCaregiverId !== session.userId) {
            return NextResponse.json(
                { error: 'Only the receiving caregiver can accept or reject this transfer' },
                { status: 403 }
            )
        }

        // --- Check transfer is still valid ---
        if (transfer.status !== 'pending') {
            return NextResponse.json(
                { error: `This transfer has already been ${transfer.status}` },
                { status: 409 }
            )
        }

        // --- Check expiry ---
        if (new Date(transfer.expiresAt) < new Date()) {
            // Auto-expire it
            await supabaseAdmin
                .from('PatientTransfer')
                .update({ status: 'expired' })
                .eq('id', id)

            return NextResponse.json(
                { error: 'This transfer has expired' },
                { status: 410 }
            )
        }

        if (action === 'accept') {
            // --- ACCEPT: Atomically transfer ownership ---

            // 1. Verify the patient still belongs to the sender
            const { data: patient, error: patientErr } = await supabaseAdmin
                .from('Patient')
                .select('id, caregiverId')
                .eq('id', transfer.patientId)
                .eq('caregiverId', transfer.fromCaregiverId)
                .single()

            if (patientErr || !patient) {
                // Patient was deleted or already transferred
                await supabaseAdmin
                    .from('PatientTransfer')
                    .update({ status: 'cancelled', respondedAt: now() })
                    .eq('id', id)

                return NextResponse.json(
                    { error: 'This patient is no longer available for transfer. The sender may have deleted or already transferred this patient.' },
                    { status: 409 }
                )
            }

            // 2. Transfer the patient — update caregiverId
            const { error: transferErr } = await supabaseAdmin
                .from('Patient')
                .update({
                    caregiverId: transfer.toCaregiverId,
                    updatedAt: now(),
                })
                .eq('id', transfer.patientId)

            if (transferErr) throw transferErr

            // 3. Mark transfer as accepted
            const { error: statusErr } = await supabaseAdmin
                .from('PatientTransfer')
                .update({
                    status: 'accepted',
                    respondedAt: now(),
                })
                .eq('id', id)

            if (statusErr) throw statusErr

            return NextResponse.json({
                success: true,
                message: 'Patient transfer accepted successfully',
                transferId: id,
                patientId: transfer.patientId,
            })

        } else {
            // --- REJECT ---
            const { error: rejectErr } = await supabaseAdmin
                .from('PatientTransfer')
                .update({
                    status: 'rejected',
                    respondedAt: now(),
                })
                .eq('id', id)

            if (rejectErr) throw rejectErr

            return NextResponse.json({
                success: true,
                message: 'Patient transfer rejected',
            })
        }

    } catch (error) {
        console.error('Transfer respond error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE /api/transfers/[id] — Cancel a transfer (sender only)
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // --- Fetch the transfer ---
        const { data: transfer, error: fetchError } = await supabaseAdmin
            .from('PatientTransfer')
            .select('id, fromCaregiverId, status')
            .eq('id', id)
            .single()

        if (fetchError || !transfer) {
            return NextResponse.json(
                { error: 'Transfer not found' },
                { status: 404 }
            )
        }

        // --- Security: Only the sender can cancel ---
        if (transfer.fromCaregiverId !== session.userId) {
            return NextResponse.json(
                { error: 'Only the sending caregiver can cancel this transfer' },
                { status: 403 }
            )
        }

        // --- Can only cancel pending transfers ---
        if (transfer.status !== 'pending') {
            return NextResponse.json(
                { error: `Cannot cancel a transfer that has already been ${transfer.status}` },
                { status: 409 }
            )
        }

        // --- Cancel ---
        const { error: cancelErr } = await supabaseAdmin
            .from('PatientTransfer')
            .update({
                status: 'cancelled',
                respondedAt: now(),
            })
            .eq('id', id)

        if (cancelErr) throw cancelErr

        return NextResponse.json({
            success: true,
            message: 'Transfer cancelled successfully',
        })

    } catch (error) {
        console.error('Transfer cancel error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
