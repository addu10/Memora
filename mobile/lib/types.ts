// Shared TypeScript types for Memora platform
// Matches portal Prisma schema

export interface Patient {
    id: string;
    name: string;
    age: number;
    mmseScore?: number;
    diagnosis?: string;
    notes?: string;
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
    caregiverId: string;
}

export interface Memory {
    id: string;
    title: string;
    description?: string;
    photoUrls: string[];  // Array of image URLs
    date: string;
    event: string;  // "Onam", "Wedding", "Birthday", etc.
    location: string;  // "Home", "Temple", "Beach", etc.
    people: string;  // Comma-separated names
    importance: number;  // 1-5 scale
    patientId: string;
    createdAt: string;
    updatedAt: string;
}

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string;  // "Wife", "Son", "Daughter", etc.
    photoUrls: string[];  // Array of image URLs
    notes?: string;
    patientId: string;
    createdAt: string;
    updatedAt: string;
}

export interface TherapySession {
    id: string;
    date: string;
    duration: number;  // minutes
    mood: 'happy' | 'neutral' | 'sad' | 'confused';
    notes?: string;
    completed: boolean;
    patientId: string;
    caregiverId: string;
    memories?: SessionMemory[];
    createdAt: string;
    updatedAt: string;
}

export interface SessionMemory {
    id: string;
    recallScore: number;  // 1-5
    response?: string;
    promptsUsed?: string;  // JSON array
    sessionId: string;
    memoryId: string;
    memory?: Memory;
}

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

// Stats for display
export interface PatientStats {
    sessionCount: number;
    memoryCount: number;
    familyCount: number;
    averageRecall?: number;
}
