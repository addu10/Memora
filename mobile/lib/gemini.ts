import { supabase } from './supabase';

export interface GeneratedQuestion {
    questions: string[];
    hints: string[];
    difficulty: string[];
}

export async function generateTherapyQuestions(photoData: {
    title: string;
    event: string;
    location: string;
    people: string[];
    description: string;
    setting: string;
    activities: string;
    facialExpressions: string;
}): Promise<GeneratedQuestion | null> {
    try {
        const { data, error } = await supabase.functions.invoke('generate-questions', {
            body: photoData
        });

        if (error) {
            console.error('Edge function error:', error);
            return null;
        }

        return data as GeneratedQuestion;
    } catch (err) {
        console.error('Question generation failed:', err);
        return null;
    }
}
