
const urls = [
    "https://memora-ai-memoraai.hf.space/predict",
    "https://memora-ai-memoraai.hf.space/api/predict",
    "https://memora-ai-memoraai.hf.space/run/predict",
    "https://memora-ai-memoraai.hf.space/call/predict",
    "https://memora-ai-memoraai.hf.space/gradio_api/call/predict"
];

async function checkUrl(url) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: ["test", "test"] })
        });
        console.log(`${url} -> ${res.status} ${res.statusText} (${res.headers.get('content-type')})`);
    } catch (err) {
        console.log(`${url} -> Error: ${err.message}`);
    }
}

urls.forEach(checkUrl);
