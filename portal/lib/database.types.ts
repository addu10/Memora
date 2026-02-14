export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            Caregiver: {
                Row: {
                    createdAt: string
                    email: string
                    id: string
                    name: string
                    password: string
                    phone: string | null
                    updatedAt: string
                }
                Insert: {
                    createdAt?: string
                    email: string
                    id: string
                    name: string
                    password: string
                    phone?: string | null
                    updatedAt: string
                }
                Update: {
                    createdAt?: string
                    email?: string
                    id?: string
                    name?: string
                    password?: string
                    phone?: string | null
                    updatedAt?: string
                }
                Relationships: []
            }
            FamilyMember: {
                Row: {
                    createdAt: string
                    id: string
                    name: string
                    notes: string | null
                    patientId: string
                    photoUrls: string[] | null
                    relationship: string
                    updatedAt: string
                }
                Insert: {
                    createdAt?: string
                    id: string
                    name: string
                    notes?: string | null
                    patientId: string
                    photoUrls?: string[] | null
                    relationship: string
                    updatedAt: string
                }
                Update: {
                    createdAt?: string
                    id?: string
                    name?: string
                    notes?: string | null
                    patientId?: string
                    photoUrls?: string[] | null
                    relationship?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "FamilyMember_patientId_fkey"
                        columns: ["patientId"]
                        isOneToOne: false
                        referencedRelation: "Patient"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Memory: {
                Row: {
                    createdAt: string
                    date: string
                    description: string | null
                    event: string
                    id: string
                    importance: number
                    location: string
                    patientId: string
                    people: string
                    photoUrls: string[] | null
                    title: string
                    updatedAt: string
                }
                Insert: {
                    createdAt?: string
                    date: string
                    description?: string | null
                    event: string
                    id: string
                    importance?: number
                    location: string
                    patientId: string
                    people: string
                    photoUrls?: string[] | null
                    title: string
                    updatedAt: string
                }
                Update: {
                    createdAt?: string
                    date?: string
                    description?: string | null
                    event?: string
                    id?: string
                    importance?: number
                    location?: string
                    patientId?: string
                    people?: string
                    photoUrls?: string[] | null
                    title?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Memory_patientId_fkey"
                        columns: ["patientId"]
                        isOneToOne: false
                        referencedRelation: "Patient"
                        referencedColumns: ["id"]
                    },
                ]
            }
            MemoryPhoto: {
                Row: {
                    activities: string | null
                    createdAt: string | null
                    description: string | null
                    facialExpressions: string | null
                    generatedQuestions: Json | null
                    id: string
                    memoryId: string
                    people: string[] | null
                    photoIndex: number | null
                    photoUrl: string
                    questionsGeneratedAt: string | null
                    setting: string | null
                    updatedAt: string | null
                }
                Insert: {
                    activities?: string | null
                    createdAt?: string | null
                    description?: string | null
                    facialExpressions?: string | null
                    generatedQuestions?: Json | null
                    id?: string
                    memoryId: string
                    people?: string[] | null
                    photoIndex?: number | null
                    photoUrl: string
                    questionsGeneratedAt?: string | null
                    setting?: string | null
                    updatedAt?: string | null
                }
                Update: {
                    activities?: string | null
                    createdAt?: string | null
                    description?: string | null
                    facialExpressions?: string | null
                    generatedQuestions?: Json | null
                    id?: string
                    memoryId?: string
                    people?: string[] | null
                    photoIndex?: number | null
                    photoUrl?: string
                    questionsGeneratedAt?: string | null
                    setting?: string | null
                    updatedAt?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "MemoryPhoto_memoryId_fkey"
                        columns: ["memoryId"]
                        isOneToOne: false
                        referencedRelation: "Memory"
                        referencedColumns: ["id"]
                    },
                ]
            }
            Patient: {
                Row: {
                    age: number
                    caregiverId: string
                    createdAt: string
                    diagnosis: string | null
                    id: string
                    mmseScore: number | null
                    name: string
                    notes: string | null
                    photoUrl: string | null
                    pin: string
                    updatedAt: string
                }
                Insert: {
                    age: number
                    caregiverId: string
                    createdAt?: string
                    diagnosis?: string | null
                    id: string
                    mmseScore?: number | null
                    name: string
                    notes?: string | null
                    photoUrl?: string | null
                    pin?: string
                    updatedAt: string
                }
                Update: {
                    age?: number
                    caregiverId?: string
                    createdAt?: string
                    diagnosis?: string | null
                    id?: string
                    mmseScore?: number | null
                    name?: string
                    notes?: string | null
                    photoUrl?: string | null
                    pin?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "Patient_caregiverId_fkey"
                        columns: ["caregiverId"]
                        isOneToOne: false
                        referencedRelation: "Caregiver"
                        referencedColumns: ["id"]
                    },
                ]
            }
            SessionMemory: {
                Row: {
                    id: string
                    memoryId: string
                    notes: string | null
                    photoScores: Json | null
                    promptsUsed: string | null
                    recallScore: number
                    response: string | null
                    reviewedAt: string | null
                    sessionId: string
                }
                Insert: {
                    id: string
                    memoryId: string
                    notes?: string | null
                    photoScores?: Json | null
                    promptsUsed?: string | null
                    recallScore: number
                    response?: string | null
                    reviewedAt?: string | null
                    sessionId: string
                }
                Update: {
                    id?: string
                    memoryId?: string
                    notes?: string | null
                    photoScores?: Json | null
                    promptsUsed?: string | null
                    recallScore?: number
                    response?: string | null
                    reviewedAt?: string | null
                    sessionId?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "SessionMemory_memoryId_fkey"
                        columns: ["memoryId"]
                        isOneToOne: false
                        referencedRelation: "Memory"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "SessionMemory_sessionId_fkey"
                        columns: ["sessionId"]
                        isOneToOne: false
                        referencedRelation: "TherapySession"
                        referencedColumns: ["id"]
                    },
                ]
            }
            TherapySession: {
                Row: {
                    caregiverId: string
                    completed: boolean
                    createdAt: string
                    date: string
                    duration: number
                    id: string
                    mood: string
                    notes: string | null
                    patientId: string
                    updatedAt: string
                }
                Insert: {
                    caregiverId: string
                    completed?: boolean
                    createdAt?: string
                    date?: string
                    duration: number
                    id: string
                    mood: string
                    notes?: string | null
                    patientId: string
                    updatedAt: string
                }
                Update: {
                    caregiverId?: string
                    completed?: boolean
                    createdAt?: string
                    date?: string
                    duration?: number
                    id?: string
                    mood?: string
                    notes?: string | null
                    patientId?: string
                    updatedAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "TherapySession_caregiverId_fkey"
                        columns: ["caregiverId"]
                        isOneToOne: false
                        referencedRelation: "Caregiver"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "TherapySession_patientId_fkey"
                        columns: ["patientId"]
                        isOneToOne: false
                        referencedRelation: "Patient"
                        referencedColumns: ["id"]
                    },
                ]
            }
            PatientTransfer: {
                Row: {
                    id: string
                    patientId: string
                    fromCaregiverId: string
                    toCaregiverId: string
                    status: string
                    transferToken: string
                    message: string | null
                    expiresAt: string
                    respondedAt: string | null
                    createdAt: string
                }
                Insert: {
                    id?: string
                    patientId: string
                    fromCaregiverId: string
                    toCaregiverId: string
                    status?: string
                    transferToken?: string
                    message?: string | null
                    expiresAt: string
                    respondedAt?: string | null
                    createdAt?: string
                }
                Update: {
                    id?: string
                    patientId?: string
                    fromCaregiverId?: string
                    toCaregiverId?: string
                    status?: string
                    transferToken?: string
                    message?: string | null
                    expiresAt?: string
                    respondedAt?: string | null
                    createdAt?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "PatientTransfer_patientId_fkey"
                        columns: ["patientId"]
                        isOneToOne: false
                        referencedRelation: "Patient"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "PatientTransfer_fromCaregiverId_fkey"
                        columns: ["fromCaregiverId"]
                        isOneToOne: false
                        referencedRelation: "Caregiver"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "PatientTransfer_toCaregiverId_fkey"
                        columns: ["toCaregiverId"]
                        isOneToOne: false
                        referencedRelation: "Caregiver"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            login_patient: { Args: { p_name: string; p_pin: string }; Returns: Json }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenient type aliases
export type Caregiver = Tables<'Caregiver'>
export type Patient = Tables<'Patient'>
export type Memory = Tables<'Memory'>
export type MemoryPhoto = Tables<'MemoryPhoto'>
export type FamilyMember = Tables<'FamilyMember'>
export type TherapySession = Tables<'TherapySession'>
export type SessionMemory = Tables<'SessionMemory'>
export type PatientTransfer = Tables<'PatientTransfer'>

// Insert types
export type CaregiverInsert = TablesInsert<'Caregiver'>
export type PatientInsert = TablesInsert<'Patient'>
export type MemoryInsert = TablesInsert<'Memory'>
export type MemoryPhotoInsert = TablesInsert<'MemoryPhoto'>
export type FamilyMemberInsert = TablesInsert<'FamilyMember'>
export type TherapySessionInsert = TablesInsert<'TherapySession'>
export type SessionMemoryInsert = TablesInsert<'SessionMemory'>
export type PatientTransferInsert = TablesInsert<'PatientTransfer'>

// Update types
export type CaregiverUpdate = TablesUpdate<'Caregiver'>
export type PatientUpdate = TablesUpdate<'Patient'>
export type MemoryUpdate = TablesUpdate<'Memory'>
export type MemoryPhotoUpdate = TablesUpdate<'MemoryPhoto'>
export type FamilyMemberUpdate = TablesUpdate<'FamilyMember'>
export type TherapySessionUpdate = TablesUpdate<'TherapySession'>
export type SessionMemoryUpdate = TablesUpdate<'SessionMemory'>
export type PatientTransferUpdate = TablesUpdate<'PatientTransfer'>

// Photo score type for session therapy
export interface PhotoScore {
    photoId: string
    score: number
    skipped: boolean
    questionAsked?: string
}
