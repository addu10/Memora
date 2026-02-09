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
    photos?: MemoryPhoto[];  // Per-photo details
}

// NEW: Per-photo labeling for AI question generation
export interface MemoryPhoto {
    id: string;
    memoryId: string;
    photoUrl: string;
    photoIndex: number;
    people: string[];  // People visible in THIS photo
    description?: string;  // What's happening in photo
    facialExpressions?: string;  // happy, sad, neutral
    setting?: string;  // indoor, outdoor, temple, beach
    activities?: string;  // cooking, praying, playing
    generatedQuestions?: GeneratedQuestion[];  // AI cache
    questionsGeneratedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface GeneratedQuestion {
    question: string;
    hint: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'contextual' | 'relational' | 'emotional';
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
    recallScore: number;  // 1-5 overall score
    response?: string;
    promptsUsed?: string;  // JSON array
    photoScores?: PhotoScore[];  // Per-photo scores
    notes?: string;  // Caregiver observations
    reviewedAt?: string;
    sessionId: string;
    memoryId: string;
    memory?: Memory;
}

// NEW: Per-photo score tracking
export interface PhotoScore {
    photoId: string;
    score: number;  // 1-5
    skipped: boolean;
    questionAsked?: string;
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
    // Alternative property names used by home.tsx
    totalMemories?: number;
    totalSessions?: number;
    totalFamily?: number;
}

