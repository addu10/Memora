
import { supabase } from './supabase';

// V3 Error Types
export type RecognitionErrorType =
    | 'no_face'           // No human face detected in image
    | 'low_quality_face'  // Face detected but blurry/dark
    | 'no_family_data'    // No family members for patient
    | 'processing_error'  // Failed to process family photos
    | 'unknown_person'    // Face detected but doesn't match anyone
    | 'detection_error'   // General detection failure
    | null;               // No error (successful match)

export interface RecognitionResult {
    // Core fields (optional for error cases)
    id?: string;
    name?: string;
    confidence?: number;
    relationship?: string;
    match: boolean;

    // V3 Error handling
    error?: string;
    error_type?: RecognitionErrorType;
    suggestion?: string;
    message?: string;

    // V3 Detailed metrics
    distance?: number;
    face_confidence?: number;
    closest_match?: string;
    closest_distance?: number;
}

// User-friendly error messages based on error_type
export function getErrorMessage(result: RecognitionResult): string {
    if (!result.error_type) return '';

    switch (result.error_type) {
        case 'no_face':
            return result.suggestion || 'No face detected. Please ensure your face is clearly visible.';
        case 'low_quality_face':
            return result.suggestion || 'Image quality too low. Please use better lighting.';
        case 'no_family_data':
            return 'No family members found for this patient.';
        case 'processing_error':
            return 'Could not process family photos. Please try again.';
        case 'unknown_person':
            return result.message || 'Face not recognized as a family member.';
        case 'detection_error':
            return result.error || 'Face detection failed. Please try again.';
        default:
            return result.error || 'Recognition failed.';
    }
}

export async function recognizeFace(base64Image: string, patientId: string): Promise<RecognitionResult> {
    try {
        console.log(`Sending recognition request for patient: ${patientId}`);

        // Ensure base64 string has data URI prefix for Gradio
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
            return {
                match: false,
                error: error.message || 'Cloud function failed',
                error_type: 'detection_error'
            };
        }

        console.log('Recognition Result:', data);

        // Handle V3 response format
        const result = data as RecognitionResult;

        // Log detailed info for debugging
        if (result.error_type) {
            console.log(`Recognition Error Type: ${result.error_type}`);
            if (result.suggestion) console.log(`Suggestion: ${result.suggestion}`);
        }

        return result;

    } catch (e: any) {
        console.error('Recognition Error:', e);
        return {
            match: false,
            error: e.message || 'Network error',
            error_type: 'detection_error'
        };
    }
}
