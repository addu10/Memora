// Authentication utilities
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET

// Warn at module load if JWT_SECRET not set (but don't throw to allow build to succeed)
if (!JWT_SECRET) {
    console.warn('⚠️ JWT_SECRET not set - using insecure default for development only')
}

const getJwtSecret = (): string => {
    if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production')
    }
    return JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-prod'
}

export interface JWTPayload {
    userId: string
    email: string
    name: string
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, getJwtSecret()) as JWTPayload
    } catch {
        return null
    }
}

export async function getSession(): Promise<JWTPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    return verifyToken(token)
}

export async function setSession(payload: JWTPayload): Promise<void> {
    const token = generateToken(payload)
    const cookieStore = await cookies()

    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
    })
}

export async function clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    cookieStore.delete('selectedPatientId')
}

