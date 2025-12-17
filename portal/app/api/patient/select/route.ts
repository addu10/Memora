// Patient Selection API
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { patientId } = await request.json()

        // Verify patient belongs to caregiver
        const patient = await prisma.patient.findFirst({
            where: { id: patientId, caregiverId: session.userId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('selectedPatientId', patientId, {
            httpOnly: true,
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
