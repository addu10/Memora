
import requests
import json

base_url = "https://memora-ai-memoraai.hf.space"
endpoints = [
    "/call/predict",
    "/run/predict",
    "/api/predict",
    "/predict"
]

data = {
    "data": [
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42AAAAAASUVORK5CYII=", # Tiny 1x1 base64 image
        "test_patient_id"
    ]
}

print(f"Testing connectivity to {base_url}...")

for ep in endpoints:
    url = base_url + ep
    print(f"\n--- Testing {ep} ---")
    try:
        resp = requests.post(url, json=data, timeout=10)
        print(f"Status: {resp.status_code}")
        print(f"Content-Type: {resp.headers.get('content-type', 'unknown')}")
        print("Body sample:", resp.text[:200].replace('\n', ' '))
    except Exception as e:
        print(f"Failed: {e}")
