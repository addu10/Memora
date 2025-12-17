// Login API Route
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, setSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Find caregiver
        const caregiver = await prisma.caregiver.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (!caregiver) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, caregiver.password)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Set session
        await setSession({
            userId: caregiver.id,
            email: caregiver.email,
            name: caregiver.name
        })

        return NextResponse.json({
            success: true,
            user: {
                id: caregiver.id,
                name: caregiver.name,
                email: caregiver.email
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
