import { supabase } from './supabase';

export interface GeneratedQuestion {
    questions: string[];
    hints: string[];
    difficulty: string[];
}

export async function generateTherapyQuestions(photoData: {
    // Photo-specific context
    photoUrl: string;
    photoIndex: number;
    totalPhotos: number;
    photoDescription: string;
    photoPeople: string[];
    facialExpressions: string;
    setting: string;
    activities: string;
    // Memory-level context
    memoryTitle: string;
    memoryDescription: string;
    memoryEvent: string;
    memoryLocation: string;
    memoryDate: string;
    memoryPeople: string;
    memoryImportance: number;
}): Promise<GeneratedQuestion | null> {
    try {
        const { data, error } = await supabase.functions.invoke('generate-questions', {
            body: { photoContext: photoData }
        });

        if (error) {
            console.error('Edge function error:', error);
            return null;
        }

        // The edge function returns: { success, questions: [{question, hint, difficulty, type}], photoUrl }
        // We need to transform it to: { questions: string[], hints: string[], difficulty: string[] }
        if (data && data.questions && Array.isArray(data.questions)) {
            return {
                questions: data.questions.map((q: any) => q.question),
                hints: data.questions.map((q: any) => q.hint),
                difficulty: data.questions.map((q: any) => q.difficulty)
            };
        }

        console.warn('Unexpected response format from generate-questions:', data);
        return null;
    } catch (err) {
        console.error('Question generation failed:', err);
        return null;
    }
}

