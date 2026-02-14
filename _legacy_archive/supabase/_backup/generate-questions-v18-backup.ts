// =====================================================
// BACKUP: Deployed generate-questions Edge Function v18
// Backed up on: 2026-02-14
// Reason: Before prompt rework to include full context
// To restore: deploy this file via Supabase MCP
// =====================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Condensed prompt for SHORT therapy questions
const THERAPY_SYSTEM_PROMPT = `Generate 3 SHORT therapy questions for a dementia patient.

RULES:
- Never ask "Do you remember?"
- Keep questions under 12 words
- Keep hints under 6 words
- Return ONLY JSON

{"questions": [
  {"question": "Q?", "hint": "H.", "difficulty": "easy", "type": "contextual"},
  {"question": "Q?", "hint": "H.", "difficulty": "medium", "type": "relational"},
  {"question": "Q?", "hint": "H.", "difficulty": "hard", "type": "emotional"}
]}`;

interface PhotoContext {
    photoUrl: string;
    photoIndex: number;
    totalPhotos: number;
    photoDescription: string;
    photoPeople: string[];
    facialExpressions: string;
    setting: string;
    activities: string;
    memoryTitle: string;
    memoryDescription: string;
    memoryEvent: string;
    memoryLocation: string;
    memoryDate: string;
    memoryPeople: string;
    memoryImportance: number;
}

interface GeneratedQuestion {
    question: string;
    hint: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'contextual' | 'relational' | 'emotional';
}

Deno.serve(async (req: Request) => {
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
            return jsonResponse({ error: 'photoContext is required' }, 400);
        }

        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
        if (!geminiApiKey) {
            console.error('[ERROR] GEMINI_API_KEY not configured');
            return jsonResponse({ error: 'AI service not configured' }, 500);
        }

        const photoDescription = buildPhotoDescription(photoContext);
        console.log('[INFO] Processing photo', photoContext.photoIndex, 'of', photoContext.totalPhotos);

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: THERAPY_SYSTEM_PROMPT + "\n\nContext: " + photoDescription
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('[ERROR] Gemini API:', geminiResponse.status, errorText);
            return successResponse(generateFallbackQuestions(photoContext), photoContext.photoUrl, true, 'api_error');
        }

        const geminiData = await geminiResponse.json();
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        console.log('[DEBUG] Response length:', generatedText?.length);

        if (!generatedText) {
            console.error('[ERROR] No text in response');
            return successResponse(generateFallbackQuestions(photoContext), photoContext.photoUrl, true, 'no_text');
        }

        // Parse JSON with salvage fallback
        let questions: GeneratedQuestion[];
        try {
            let jsonText = generatedText.trim();
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
            }

            const parsed = JSON.parse(jsonText);
            questions = parsed.questions || parsed;

            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('No questions array');
            }

            questions = questions.slice(0, 3).map((q, i) => ({
                question: q.question || 'What do you notice?',
                hint: q.hint || 'Look carefully.',
                difficulty: q.difficulty || ['easy', 'medium', 'hard'][i],
                type: q.type || ['contextual', 'relational', 'emotional'][i]
            }));

            console.log('[SUCCESS] Generated', questions.length, 'AI questions');

        } catch (parseError) {
            console.error('[ERROR] JSON parse:', parseError);

            // Try to salvage partial questions from truncated JSON
            const salvaged = salvagePartialJSON(generatedText, photoContext);
            if (salvaged.length > 0) {
                console.log('[SALVAGED]', salvaged.length, 'questions from partial JSON');
                return successResponse(salvaged, photoContext.photoUrl, false, 'ai_salvaged');
            }

            console.error('[DEBUG] Raw:', generatedText.substring(0, 200));
            return successResponse(generateFallbackQuestions(photoContext), photoContext.photoUrl, true, 'parse_error');
        }

        return successResponse(questions, photoContext.photoUrl, false, 'ai_generated');

    } catch (error) {
        console.error('[ERROR] Edge function:', error);
        return jsonResponse({ error: 'Internal server error', details: String(error) }, 500);
    }
});

// Extract questions from truncated/malformed JSON
function salvagePartialJSON(text: string, ctx: PhotoContext): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
    const types: ('contextual' | 'relational' | 'emotional')[] = ['contextual', 'relational', 'emotional'];

    // Find all complete question strings
    const questionMatches = text.matchAll(/"question"\s*:\s*"([^"]+)"/g);
    const hintMatches = [...text.matchAll(/"hint"\s*:\s*"([^"]+)"/g)];

    let i = 0;
    for (const match of questionMatches) {
        if (i >= 3) break;
        questions.push({
            question: match[1],
            hint: hintMatches[i]?.[1] || 'Think about it.',
            difficulty: difficulties[i],
            type: types[i]
        });
        i++;
    }

    // If we got some questions, fill remaining with fallback
    if (questions.length > 0 && questions.length < 3) {
        const fallback = generateFallbackQuestions(ctx);
        while (questions.length < 3) {
            questions.push(fallback[questions.length]);
        }
    }

    return questions;
}

function jsonResponse(data: any, status: number) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
}

function successResponse(questions: GeneratedQuestion[], photoUrl: string, isFallback: boolean, reason: string) {
    console.log('[RESPONSE] fallback:', isFallback, 'reason:', reason, 'count:', questions.length);
    return new Response(
        JSON.stringify({ success: true, questions, photoUrl, fallback: isFallback, reason }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
}

function buildPhotoDescription(ctx: PhotoContext): string {
    const parts = [];
    if (ctx.photoPeople?.length) parts.push(`People: ${ctx.photoPeople.slice(0, 2).join(', ')}`);
    if (ctx.activities) parts.push(`Activity: ${ctx.activities.substring(0, 30)}`);
    if (ctx.setting) parts.push(`Setting: ${ctx.setting.substring(0, 20)}`);
    return parts.join(' | ') || 'A photo';
}

function generateFallbackQuestions(ctx: PhotoContext): GeneratedQuestion[] {
    const idx = (ctx.photoIndex || 1) - 1;
    const p = ctx.photoPeople?.[0] || '';
    const act = ctx.activities || '';
    const set = ctx.setting || '';

    const sets: GeneratedQuestion[][] = [
        [
            { question: `What's the first thing you notice?`, hint: `Look at colors.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `Tell me about ${p}.` : `Who do you see?`, hint: `Describe them.`, difficulty: 'medium', type: 'relational' },
            { question: `How does this make you feel?`, hint: `Any feeling works.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: act ? `What's happening here?` : `Describe the scene.`, hint: `Focus on action.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `How do you know ${p}?` : `Who's here?`, hint: `Think of connections.`, difficulty: 'medium', type: 'relational' },
            { question: `What would you tell someone about this?`, hint: `Share the story.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: set ? `What sounds might you hear here?` : `Where is this?`, hint: `Imagine being there.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `What makes ${p} special?` : `Who's missing?`, hint: `Think of bonds.`, difficulty: 'medium', type: 'relational' },
            { question: `If this photo could talk, what would it say?`, hint: `Let it speak.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: `What season does this remind you of?`, hint: `Look at clothing.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `How has ${p} influenced you?` : `What traditions started here?`, hint: `Reflect on impact.`, difficulty: 'medium', type: 'relational' },
            { question: `What feeling fills you when you see this?`, hint: `Honor that feeling.`, difficulty: 'hard', type: 'emotional' }
        ]
    ];

    return sets[idx % sets.length];
}
