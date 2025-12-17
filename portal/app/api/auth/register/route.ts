// Register API Route
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword, setSession } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const { name, email, password, phone } = await request.json()

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existingUser = await prisma.caregiver.findUnique({
            where: { email: email.toLowerCase() }
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create caregiver
        const caregiver = await prisma.caregiver.create({
            data: {
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone: phone || null
            }
        })

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
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
