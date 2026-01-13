import requests
import json

url = "https://memora-ai-memoraai.hf.space/info"
try:
    resp = requests.get(url)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(e)
