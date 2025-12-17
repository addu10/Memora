// Patient Stats API - for mobile dashboard
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSession } from '@/lib/auth'

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

        // Verify patient belongs to caregiver
        const patient = await prisma.patient.findFirst({
            where: { id, caregiverId: session.userId }
        })

        if (!patient) {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 })
        }

        // Get counts
        const [sessionCount, memoryCount, familyCount, sessions] = await Promise.all([
            prisma.therapySession.count({ where: { patientId: id } }),
            prisma.memory.count({ where: { patientId: id } }),
            prisma.familyMember.count({ where: { patientId: id } }),
            prisma.therapySession.findMany({
                where: { patientId: id },
                include: { memories: true },
                take: 10,
                orderBy: { date: 'desc' }
            })
        ])

        // Calculate average recall score
        let totalRecall = 0
        let recallCount = 0
        sessions.forEach(s => {
            s.memories.forEach(m => {
                totalRecall += m.recallScore
                recallCount++
            })
        })
        const averageRecall = recallCount > 0 ? totalRecall / recallCount : null

        return NextResponse.json({
            sessionCount,
            memoryCount,
            familyCount,
            averageRecall
        })
    } catch (error) {
        console.error('Get patient stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
