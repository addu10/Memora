import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/db'
import { hash, compare } from 'bcryptjs'

export async function PUT(request: Request) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { currentPassword, newPassword } = await request.json()

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Both current and new passwords are required' },
                { status: 400 }
            )
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters' },
                { status: 400 }
            )
        }

        const caregiver = await prisma.caregiver.findUnique({
            where: { id: session.userId }
        })

        if (!caregiver) {
            return NextResponse.json({ error: 'Caregiver not found' }, { status: 404 })
        }

        const isValid = await compare(currentPassword, caregiver.password)
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 })
        }

        const hashedPassword = await hash(newPassword, 12)

        await prisma.caregiver.update({
            where: { id: session.userId },
            data: { password: hashedPassword }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
    }
}
