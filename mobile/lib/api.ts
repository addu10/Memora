// API Client for connecting mobile app directly to Supabase
// Handles all communication with the backend DB

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { Memory, FamilyMember, TherapySession, Patient, PatientStats, ApiResponse, SessionMemory } from './types';

class MemoraApiClient {
    private patientId: string | null = null;

    // Initialize with patient ID from storage
    async init(): Promise<void> {
        try {
            const patient = await AsyncStorage.getItem('patient');
            if (patient) {
                const parsed = JSON.parse(patient);
                this.patientId = parsed.id || null;
            }
        } catch (e) {
            console.error('Failed to init API client:', e);
        }
    }

    setPatientId(id: string): void {
        this.patientId = id;
    }

    private checkAuth(): ApiResponse<any> {
        if (!this.patientId) {
            return { error: 'No patient selected', status: 400 };
        }
        return { data: null, status: 200 }; // OK
    }

    // ============ MEMORIES ============

    async getMemories(): Promise<ApiResponse<Memory[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('Memory')
                .select('*')
                .eq('patientId', this.patientId)
                .order('date', { ascending: false });

            if (error) throw error;

            return { data: data as Memory[], status: 200 };
        } catch (e: any) {
            console.error('Fetch memories error:', e);
            return { error: e.message, status: 500 };
        }
    }

    async getMemory(id: string): Promise<ApiResponse<Memory>> {
        try {
            const { data, error } = await supabase
                .from('Memory')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data: data as Memory, status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    async getMemoriesByPerson(name: string): Promise<ApiResponse<Memory[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            // "people" is a text column, e.g. "Adnan, Amma". 
            // We use ilike for case-insensitive partial match.
            const { data, error } = await supabase
                .from('Memory')
                .select('*')
                .ilike('people', `%${name}%`)
                .eq('patientId', this.patientId)
                .order('date', { ascending: false });

            if (error) throw error;
            return { data: data as Memory[], status: 200 };
        } catch (e: any) {
            console.error('Fetch person memories error:', e);
            return { error: e.message, status: 500 };
        }
    }

    // ============ FAMILY ============

    async getFamilyMembers(): Promise<ApiResponse<FamilyMember[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('FamilyMember')
                .select('*')
                .eq('patientId', this.patientId);

            if (error) throw error;
            return { data: data as FamilyMember[], status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    async getFamilyMemberById(id: string): Promise<ApiResponse<FamilyMember>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('FamilyMember')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return { data: data as FamilyMember, status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    // ============ SESSIONS ============

    async createSession(session: {
        duration: number;
        mood: string;
        notes?: string;
        memories?: Array<{
            memoryId: string;
            recallScore: number;
            response?: string;
        }>;
    }): Promise<ApiResponse<TherapySession>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            // 1. Create Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('TherapySession')
                .insert({
                    patientId: this.patientId,
                    date: new Date().toISOString(),
                    duration: session.duration,
                    mood: session.mood,
                    notes: session.notes
                })
                .select()
                .single();

            if (sessionError) throw sessionError;

            // 2. Log Memory Responses (if any)
            if (session.memories && session.memories.length > 0) {
                // Note: We need a 'MemoryResponse' table to store these details properly.
                // For now, we will just log it or assuming there's a relation.
                // Detailed implementation depends on schema.
            }

            return { data: sessionData as TherapySession, status: 201 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    async getSessions(): Promise<ApiResponse<TherapySession[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('TherapySession')
                .select('*')
                .eq('patientId', this.patientId)
                .order('date', { ascending: false });

            if (error) throw error;
            return { data: data as TherapySession[], status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    // ============ PATIENT ============

    async getPatient(): Promise<ApiResponse<Patient & { caregiverName?: string }>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            // 1. Fetch Patient
            const { data: patient, error } = await supabase
                .from('Patient')
                .select('*')
                .eq('id', this.patientId)
                .single();

            if (error) throw error;

            let caregiverName = 'Unknown';
            if (patient.caregiverId) {
                // Fetch Caregiver Name
                const { data: caregiver } = await supabase
                    .from('Caregiver')
                    .select('name')
                    .eq('id', patient.caregiverId)
                    .single();

                if (caregiver && caregiver.name) {
                    caregiverName = caregiver.name;
                }
            }

            return { data: { ...patient, caregiverName } as any, status: 200 };
        } catch (e: any) {
            console.error('getPatient error:', e);
            return { error: e.message, status: 500 };
        }
    }

    async getPatientStats(): Promise<ApiResponse<PatientStats>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { count: memoryCount } = await supabase
                .from('Memory')
                .select('*', { count: 'exact', head: true })
                .eq('patientId', this.patientId);

            const { count: familyCount } = await supabase
                .from('FamilyMember')
                .select('*', { count: 'exact', head: true })
                .eq('patientId', this.patientId);

            return {
                data: {
                    sessionCount: 0,
                    memoryCount: memoryCount || 0,
                    familyCount: familyCount || 0,
                    averageRecall: 0
                },
                status: 200
            };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    async getLatestSessionMemories(): Promise<ApiResponse<SessionMemory[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('SessionMemory')
                .select('*, memoryId')
                .order('reviewedAt', { ascending: false });

            if (error) throw error;
            return { data: data as SessionMemory[], status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }
}

// Export singleton instance
export const api = new MemoraApiClient();

// Helper to check if API is available (Supabase check)
export async function isApiAvailable(): Promise<boolean> {
    try {
        const { data, error } = await supabase.from('Patient').select('id').limit(1);
        return !error;
    } catch {
        return false;
    }
}

export { MemoraApiClient };
