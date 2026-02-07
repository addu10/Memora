// Login API Route
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
        const { data: caregiver, error } = await supabaseAdmin
            .from('Caregiver')
            .select('*')
            .eq('email', email.toLowerCase())
            .single()

        if (error || !caregiver) {
            return NextResponse.json(
                { error: 'Email address not registered' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await verifyPassword(password, caregiver.password)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Incorrect password' },
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
