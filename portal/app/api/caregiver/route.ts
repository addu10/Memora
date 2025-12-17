import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { hash, compare } from 'bcryptjs'

// GET /api/caregiver - Get profile
export async function GET(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const caregiver = await prisma.caregiver.findUnique({
        where: { id: session.userId },
        select: { name: true, email: true, phone: true }
    })

    return NextResponse.json(caregiver)
}

// PUT /api/caregiver - Update profile
export async function PUT(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, phone } = await request.json()

    const updated = await prisma.caregiver.update({
        where: { id: session.userId },
        data: { name, phone }
    })

    return NextResponse.json(updated)
}

// PUT /api/caregiver/password - Update password (in separate file ideally but handled via route structure)
// We'll create a separate route for this: app/api/caregiver/password/route.ts
