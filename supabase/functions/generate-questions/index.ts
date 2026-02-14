import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ─────────────────────────────────────────────────────────────────
// Clinically-grounded reminiscence therapy prompt
// Based on Alzheimer's Association best practices
// v19 — Full context, personalized questions
// ─────────────────────────────────────────────────────────────────
const THERAPY_SYSTEM_PROMPT = `You are a reminiscence therapy facilitator for an Alzheimer's patient viewing personal photos.

RULES:
- NEVER say "Do you remember?" — causes anxiety
- Use present tense: "Tell me about..." not "What happened..."
- Progress: easy (scene) → medium (people) → hard (feelings)
- Use specific names and places from context
- STRICT: Questions MUST be under 15 words. Keep them short and warm.
- STRICT: Hints MUST be under 6 words.
- Do NOT narrate or describe the photo back. Just ask.

Return ONLY this JSON, nothing else:
{"questions": [
  {"question": "...", "hint": "...", "difficulty": "easy", "type": "contextual"},
  {"question": "...", "hint": "...", "difficulty": "medium", "type": "relational"},
  {"question": "...", "hint": "...", "difficulty": "hard", "type": "emotional"}
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
        console.log('[INFO] Context length:', photoDescription.length, 'chars');

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: THERAPY_SYSTEM_PROMPT + "\n\nPHOTO CONTEXT:\n" + photoDescription
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
                question: q.question || 'What do you notice in this photo?',
                hint: q.hint || 'Look carefully.',
                difficulty: q.difficulty || (['easy', 'medium', 'hard'] as const)[i],
                type: q.type || (['contextual', 'relational', 'emotional'] as const)[i]
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

// ─────────────────────────────────────────────────────────────────
// Build rich photo description using ALL available context
// ─────────────────────────────────────────────────────────────────
function buildPhotoDescription(ctx: PhotoContext): string {
    const parts: string[] = [];

    // Memory-level context (the event this photo belongs to)
    if (ctx.memoryTitle) parts.push(`Event: ${ctx.memoryTitle}`);
    if (ctx.memoryEvent) parts.push(`Type: ${ctx.memoryEvent}`);
    if (ctx.memoryLocation) parts.push(`Location: ${ctx.memoryLocation}`);
    if (ctx.memoryDate) parts.push(`Date: ${ctx.memoryDate}`);
    if (ctx.memoryDescription) parts.push(`About: ${ctx.memoryDescription}`);

    // Photo-specific context (caregiver-labeled details)
    if (ctx.photoPeople?.length) parts.push(`People in photo: ${ctx.photoPeople.join(', ')}`);
    if (ctx.memoryPeople) parts.push(`Other people involved: ${ctx.memoryPeople}`);
    if (ctx.photoDescription) parts.push(`Scene: ${ctx.photoDescription}`);
    if (ctx.activities) parts.push(`Activities: ${ctx.activities}`);
    if (ctx.setting) parts.push(`Setting: ${ctx.setting}`);
    if (ctx.facialExpressions) parts.push(`Expressions: ${ctx.facialExpressions}`);

    // Session context
    if (ctx.memoryImportance) parts.push(`Importance to patient: ${ctx.memoryImportance}/5`);
    parts.push(`Photo ${ctx.photoIndex} of ${ctx.totalPhotos}`);

    return parts.join('\n');
}

// ─────────────────────────────────────────────────────────────────
// Extract questions from truncated/malformed JSON
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// Context-aware fallback questions (4 rotating sets)
// ─────────────────────────────────────────────────────────────────
function generateFallbackQuestions(ctx: PhotoContext): GeneratedQuestion[] {
    const idx = (ctx.photoIndex || 1) - 1;
    const p = ctx.photoPeople?.[0] || '';
    const loc = ctx.memoryLocation || '';
    const title = ctx.memoryTitle || '';
    const act = ctx.activities || '';
    const set = ctx.setting || '';

    const sets: GeneratedQuestion[][] = [
        [
            { question: loc ? `Tell me what you see in this photo from ${loc}.` : `What's the first thing you notice in this photo?`, hint: `Look at the colors and background.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `Tell me about ${p} — what makes them special to you?` : `Who do you see here, and how do you know them?`, hint: p ? `Think about ${p}.` : `Look at their faces.`, difficulty: 'medium', type: 'relational' },
            { question: title ? `How does looking at "${title}" make you feel right now?` : `How does this photo make you feel?`, hint: `Any feeling is welcome.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: act ? `What's happening in this moment? It looks lively.` : `Can you describe the scene in this photo?`, hint: `Focus on the action.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `How did you and ${p} first meet or become close?` : `Who would you love to share this moment with?`, hint: `Think about your connections.`, difficulty: 'medium', type: 'relational' },
            { question: `If you could step back into this moment, what would you say?`, hint: `Imagine being right there.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: set ? `What sounds or smells do you imagine in this ${set}?` : `Where was this photo taken?`, hint: `Imagine being there again.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `What is your favorite thing about ${p}?` : `Who else might have been here that day?`, hint: `Think of good memories.`, difficulty: 'medium', type: 'relational' },
            { question: `If this photo could talk, what story would it tell?`, hint: `Let the photo speak.`, difficulty: 'hard', type: 'emotional' }
        ],
        [
            { question: loc ? `What season or time of year does ${loc} remind you of?` : `What season does this remind you of?`, hint: `Look at the clothing and light.`, difficulty: 'easy', type: 'contextual' },
            { question: p ? `How has ${p} influenced your life or shaped who you are?` : `What traditions or routines did this day start?`, hint: `Reflect on their impact.`, difficulty: 'medium', type: 'relational' },
            { question: `What feeling fills your heart when you look at this?`, hint: `Honor whatever you feel.`, difficulty: 'hard', type: 'emotional' }
        ]
    ];

    return sets[idx % sets.length];
}
