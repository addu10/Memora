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
            console.log('[API] Initializing client...');
            const patient = await AsyncStorage.getItem('patient');
            if (patient) {
                const parsed = JSON.parse(patient);
                this.patientId = parsed.id || null;
                console.log(`[API] Client initialized with patientId: ${this.patientId}`);
            } else {
                console.log('[API] Client initialized. No patient found in storage.');
            }
        } catch (e) {
            console.error('[API] Failed to init API client:', e);
        }
    }

    setPatientId(id: string): void {
        console.log(`[API] Updating patientId to: ${id}`);
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
            console.log(`[API] Fetching memories for patient: ${this.patientId}`);
            const { data, error } = await supabase
                .from('Memory')
                .select('*')
                .eq('patientId', this.patientId)
                .order('date', { ascending: false });

            if (error) throw error;

            console.log(`[API] Successfully fetched ${data?.length || 0} memories.`);
            return { data: data as Memory[], status: 200 };
        } catch (e: any) {
            console.error('[API] Fetch memories error:', e);
            return { error: e.message, status: 500 };
        }
    }

    async getEventTypes(): Promise<ApiResponse<string[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            const { data, error } = await supabase
                .from('Memory')
                .select('event')
                .eq('patientId', this.patientId);

            if (error) throw error;

            // Extract unique non-null events
            const allEvents = data.map(m => m.event).filter(Boolean) as string[];
            const uniqueEvents = Array.from(new Set(allEvents));

            return { data: uniqueEvents, status: 200 };
        } catch (e: any) {
            console.error('Fetch event types error:', e);
            return { error: e.message, status: 500 };
        }
    }

    async getMemory(id: string): Promise<ApiResponse<Memory>> {
        try {
            const { data, error } = await supabase
                .from('Memory')
                .select('*')
                .eq('id', id)
                .eq('patientId', this.patientId)
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

    async getTaggedPhotos(name: string, memoryIds: string[]): Promise<ApiResponse<string[]>> {
        try {
            if (memoryIds.length === 0) return { data: [], status: 200 };

            // Fetch from MemoryPhoto table where name is in the people array
            // Scope via memory connection if possible, but for direct query we use memoryId in
            const { data, error } = await supabase
                .from('MemoryPhoto')
                .select('photoUrl, people, memoryId')
                .in('memoryId', memoryIds);

            if (error) throw error;

            // Filter manually since Postgres array case-insensitivity can be tricky
            const filtered = data
                .filter(p => p.people && Array.isArray(p.people) &&
                    p.people.some((pName: string) => pName.toLowerCase().includes(name.toLowerCase())))
                .map(p => p.photoUrl);

            return { data: filtered, status: 200 };
        } catch (e: any) {
            console.error('Fetch tagged photos error:', e);
            return { error: e.message, status: 500 };
        }
    }

    // ============ FAMILY ============

    async getFamilyMembers(): Promise<ApiResponse<FamilyMember[]>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            console.log(`[API] Fetching family members for patient: ${this.patientId}`);
            const { data, error } = await supabase
                .from('FamilyMember')
                .select('*')
                .eq('patientId', this.patientId);

            if (error) throw error;
            console.log(`[API] Successfully fetched ${data?.length || 0} family members.`);
            return { data: data as FamilyMember[], status: 200 };
        } catch (e: any) {
            console.error('[API] Fetch family members error:', e.message);
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
            console.log(`[API] Creating session for patient: ${this.patientId}. Mood: ${session.mood}, Duration: ${session.duration}m`);
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
            console.log(`[API] Session saved successfully. ID: ${sessionData.id}`);

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

    async login(name: string, pin: string): Promise<ApiResponse<Patient>> {
        try {
            console.log(`[API] Attempting RPC login for: ${name}`);
            const { data, error } = await supabase.rpc('login_patient', {
                p_name: name,
                p_pin: pin
            });

            if (error) {
                console.error(`[API] Login RPC error for '${name}':`, error.message);
                throw error;
            }

            if (!data || data.error) {
                console.warn(`[API] Login failed: ${data?.error || 'No matching patient'} for '${name}'`);
                return { error: data?.error || 'Invalid name or PIN', status: 401 };
            }

            // Map RPC response 'patientId' to expected 'id' for the app
            const patientData = {
                ...data,
                id: data.patientId
            };

            console.log(`[API] Login successful for patient: ${patientData.id}`);
            return { data: patientData as Patient, status: 200 };
        } catch (e: any) {
            return { error: e.message, status: 500 };
        }
    }

    // ============ PATIENT ============

    async getPatient(): Promise<ApiResponse<Patient & { caregiverName?: string }>> {
        const auth = this.checkAuth();
        if (auth.error) return { error: auth.error, status: auth.status };

        try {
            console.log(`[API] Fetching full patient profile for ID: ${this.patientId}`);
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
            console.log(`[API] Fetching aggregated stats for patient: ${this.patientId}`);
            const { count: memoryCount } = await supabase
                .from('Memory')
                .select('*', { count: 'exact', head: true })
                .eq('patientId', this.patientId);

            const { count: familyCount } = await supabase
                .from('FamilyMember')
                .select('*', { count: 'exact', head: true })
                .eq('patientId', this.patientId);

            const { count: sessionCount } = await supabase
                .from('TherapySession')
                .select('*', { count: 'exact', head: true })
                .eq('patientId', this.patientId);

            return {
                data: {
                    // Required properties
                    sessionCount: sessionCount || 0,
                    memoryCount: memoryCount || 0,
                    familyCount: familyCount || 0,
                    averageRecall: 0,
                    // Alternative names used by home.tsx
                    totalMemories: memoryCount || 0,
                    totalSessions: sessionCount || 0,
                    totalFamily: familyCount || 0,
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
            console.log(`[API] Fetching latest session memories queue...`);
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
