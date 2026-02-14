
import requests
import json

url = "https://memora-ai-memoraai.hf.space/info"
print(f"Fetching Info from {url}...")
try:
    resp = requests.get(url, timeout=10)
    print(f"Status: {resp.status_code}")
    print("Content-Type:", resp.headers.get('content-type'))
    if "application/json" in resp.headers.get('content-type', ''):
        info = resp.json()
        print("Named Endpoints:", json.dumps(info.get("named_endpoints"), indent=2))
        print("Full Info:", json.dumps(info, indent=2))
    else:
        print("Body:", resp.text[:500])
except Exception as e:
    print(f"Failed: {e}")
