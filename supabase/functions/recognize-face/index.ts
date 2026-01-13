
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { client } from "https://esm.sh/@gradio/client";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. CORS Setup
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { image, patientId } = await req.json()

        if (!image || !patientId) {
            throw new Error('Missing image or patientId')
        }

        const HF_SPACE_URL = Deno.env.get('HF_SPACE_URL')
        if (!HF_SPACE_URL) {
            throw new Error('HF_SPACE_URL not configured')
        }

        // Extract base URL if it includes endpoint path
        // e.g. https://memora-ai-memoraai.hf.space/call/predict -> https://memora-ai-memoraai.hf.space/
        // We need the root URL for the client
        const spaceUrl = HF_SPACE_URL.split('/call/')[0].split('/api/')[0].split('/run/')[0];

        console.log(`Connecting to Space: ${spaceUrl} for patient ${patientId}`)

        // 2. Connect to Gradio Client
        // The client will automatically find the correct endpoint info
        const app = await client(spaceUrl);

        // Convert base64 to Blob for Gradio Client to handle upload
        // Remove header if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "image/jpeg" });

        // 3. Make Prediction
        // api_name is "predict" as set in app.py blocks
        const result = await app.predict("/predict", [
            blob,
            patientId
        ]);

        console.log("Prediction result:", result)

        if (result && result.data && result.data[0]) {
            return new Response(JSON.stringify(result.data[0]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } else {
            console.error("HF Unexpected Response:", result)
            throw new Error('ML model returned unexpected data format')
        }

    } catch (error) {
        console.error("Edge Function Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
