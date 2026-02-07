// Register API Route
import { NextResponse } from 'next/server'
import { supabaseAdmin, generateId, now } from '@/lib/supabase'
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

        // Strict Password Validation
        if (password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            )
        }

        if (!/\d/.test(password)) {
            return NextResponse.json(
                { error: 'Password must contain at least one number' },
                { status: 400 }
            )
        }

        // Phone Validation (if provided)
        if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
            return NextResponse.json(
                { error: 'Invalid phone number format' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const { data: existingUser } = await supabaseAdmin
            .from('Caregiver')
            .select('id')
            .eq('email', email.toLowerCase())
            .single()

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            )
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create caregiver
        const { data: caregiver, error: createError } = await supabaseAdmin
            .from('Caregiver')
            .insert({
                id: generateId(),
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                phone: phone || null,
                updatedAt: now()
            })
            .select()
            .single()

        if (createError) throw createError

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
