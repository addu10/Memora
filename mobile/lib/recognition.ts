
import { supabase } from './supabase';
import { Alert } from 'react-native';

export interface RecognitionResult {
    id?: string;
    name: string;
    confidence: number;
    relationship?: string;
    message?: string;
    match: boolean;
}

export async function recognizeFace(base64Image: string, patientId: string): Promise<RecognitionResult> {
    try {
        console.log(`Sending recognition request for patient: ${patientId}`);

        // Ensure base64 string is clean (sometimes prefixes cause issues depending on backend)
        // Our Python script expects raw pixel data or base64. Gradio handles base64 urls data:image/jpeg;base64,...
        // If expo-camera returns just the raw base64 string, we might need to prefix it for Gradio 
        // BUT app.py uses gr.Image(type="numpy"), Gradio client usually handles the conversion.
        // Let's send the raw base64 from Expo first.

        // We prepend data URI scheme if missing, as Gradio often expects it for base64 input
        const imageData = base64Image.startsWith('data:')
            ? base64Image
            : `data:image/jpeg;base64,${base64Image}`;

        const { data, error } = await supabase.functions.invoke('recognize-face', {
            body: {
                image: imageData,
                patientId: patientId
            }
        });

        if (error) {
            console.error('Supabase Function Error:', error);
            throw new Error(error.message || 'Cloud function failed');
        }

        console.log('Recognition Result:', data);
        return data as RecognitionResult;

    } catch (e: any) {
        console.error('Recognition Error:', e);
        throw e;
    }
}
