import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, pin } = body

        if (!name || !pin) {
            return NextResponse.json(
                { error: 'Name and PIN are required' },
                { status: 400 }
            )
        }

        // Case-insensitive name search, exact PIN match
        const patient = await prisma.patient.findFirst({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                },
                pin: pin
            },
            select: {
                id: true,
                name: true,
                photoUrl: true
            }
        })

        if (!patient) {
            return NextResponse.json(
                { error: 'Invalid name or PIN' },
                { status: 401 }
            )
        }

        return NextResponse.json({
            patientId: patient.id,
            name: patient.name,
            photoUrl: patient.photoUrl
        })

    } catch (error) {
        console.error('Patient login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
