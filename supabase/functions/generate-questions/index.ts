import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Clinically-backed prompt for reminiscence therapy
const THERAPY_SYSTEM_PROMPT = `You are a certified reminiscence therapy facilitator for dementia and Alzheimer's patients.

CLINICAL GUIDELINES (Based on Alzheimer's Association best practices):
- Use open-ended questions that encourage storytelling
- NEVER ask "Do you remember...?" - this creates pressure and anxiety
- Focus on sensory details and emotions, not facts
- Use present tense to reduce memory pressure ("Tell me about..." not "What happened...")
- Start with easier contextual questions, progress to personal ones
- Provide supportive hints that guide without giving away answers

QUESTION TYPES:
1. CONTEXTUAL (Easy): About the scene, environment, colors, objects visible
2. RELATIONAL (Medium): About people, relationships, interactions
3. EMOTIONAL (Deeper): About feelings, significance, personal meaning

RESPONSE FORMAT:
Return a JSON object with exactly this structure:
{
  "questions": [
    {
      "question": "The therapy question to ask",
      "hint": "A supportive hint if they struggle",
      "difficulty": "easy|medium|hard",
      "type": "contextual|relational|emotional"
    }
  ]
}

Generate exactly 3 questions per photo, one of each type.`;

interface PhotoContext {
    photoUrl: string;
    memoryTitle: string;
    memoryEvent: string;
    memoryLocation: string;
    memoryDate: string;
    people: string[];
    description?: string;
    setting?: string;
    activities?: string;
    facialExpressions?: string;
}

interface GeneratedQuestion {
    question: string;
    hint: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'contextual' | 'relational' | 'emotional';
}

Deno.serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        });
    }

    try {
        const { photoContext } = await req.json() as { photoContext: PhotoContext };

        if (!photoContext) {
            return new Response(
                JSON.stringify({ error: 'photoContext is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Get API key from environment
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            console.error('GEMINI_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'AI service not configured' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Build the photo description prompt
        const photoDescription = buildPhotoDescription(photoContext);

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: THERAPY_SYSTEM_PROMPT },
                                { text: `\n\nPHOTO CONTEXT:\n${photoDescription}\n\nGenerate 3 therapy questions for this photo.` }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                        responseMimeType: 'application/json'
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('Gemini API error:', errorText);
            return new Response(
                JSON.stringify({ error: 'AI service error', details: errorText }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const geminiData = await geminiResponse.json();

        // Extract the generated text
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            return new Response(
                JSON.stringify({ error: 'No response from AI' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Parse the JSON response
        let questions: GeneratedQuestion[];
        try {
            const parsed = JSON.parse(generatedText);
            questions = parsed.questions || parsed;
        } catch (parseError) {
            console.error('Failed to parse Gemini response:', generatedText);
            // Return fallback questions based on context
            questions = generateFallbackQuestions(photoContext);
        }

        return new Response(
            JSON.stringify({
                success: true,
                questions,
                photoUrl: photoContext.photoUrl
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        );

    } catch (error) {
        console.error('Edge function error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: String(error) }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
});

function buildPhotoDescription(ctx: PhotoContext): string {
    const parts: string[] = [];

    parts.push(`Memory Title: ${ctx.memoryTitle}`);
    parts.push(`Event Type: ${ctx.memoryEvent}`);
    parts.push(`Location: ${ctx.memoryLocation}`);
    parts.push(`Date: ${ctx.memoryDate}`);

    if (ctx.people && ctx.people.length > 0) {
        parts.push(`People in Photo: ${ctx.people.join(', ')}`);
    }
    if (ctx.description) {
        parts.push(`Scene Description: ${ctx.description}`);
    }
    if (ctx.setting) {
        parts.push(`Setting: ${ctx.setting}`);
    }
    if (ctx.activities) {
        parts.push(`Activities: ${ctx.activities}`);
    }
    if (ctx.facialExpressions) {
        parts.push(`Expressions: ${ctx.facialExpressions}`);
    }

    return parts.join('\n');
}

function generateFallbackQuestions(ctx: PhotoContext): GeneratedQuestion[] {
    // Fallback questions when AI parsing fails
    return [
        {
            question: `Tell me about what you see in this photo from ${ctx.memoryEvent}.`,
            hint: `Look at the colors and objects. This was taken at ${ctx.memoryLocation}.`,
            difficulty: 'easy',
            type: 'contextual'
        },
        {
            question: ctx.people.length > 0
                ? `Who are these people with you? What do they mean to you?`
                : `Who would you have liked to share this moment with?`,
            hint: ctx.people.length > 0
                ? `I see ${ctx.people[0]} in this photo.`
                : `Think about your family or close friends.`,
            difficulty: 'medium',
            type: 'relational'
        },
        {
            question: `How does looking at this photo make you feel right now?`,
            hint: `It's okay to feel any emotion. Just share what comes to mind.`,
            difficulty: 'hard',
            type: 'emotional'
        }
    ];
}
