import gradio as gr
import os
import cv2
import numpy as np
import requests
from PIL import Image
import io
from deepface import DeepFace
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- 1. CONFIGURATION ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# --- 2. MODELS ---
# Using VGG-Face for maximum confirmed accuracy
MODEL_NAME = "VGG-Face"
METRIC = "cosine"
THRESHOLD = 0.40  
# Parallelism Configuration
MAX_WORKERS = 4 

# Warmup 
try:
    print(f"⏳ Warming up {MODEL_NAME}...")
    DeepFace.build_model(MODEL_NAME)
    print(f"✅ {MODEL_NAME} Loaded Successfully")
except Exception as e:
    print(f"⚠️ Model Warmup Warning: {e}")

# --- 3. HELPER FUNCTIONS ---

def fetch_family_members(patient_id):
    """Fetch family members from Supabase"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Supabase credentials missing")
        return []

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

    try:
        url = f"{SUPABASE_URL}/rest/v1/FamilyMember?select=*&patientId=eq.{patient_id}"
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            return response.json()
        return []
    except Exception as e:
        print(f"Fetch Error: {e}")
        return []

def download_image_as_array(url):
    """Download image to numpy array"""
    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            img = Image.open(io.BytesIO(resp.content)).convert('RGB')
            return np.array(img)
    except:
        return None
    return None

def verify_single_candidate(input_image, member):
    """
    Helper function to run DeepFace.verify for a single candidate.
    This includes downloading the candidate photo.
    """
    name = member.get('name', 'Unknown')
    photo_urls = member.get('photoUrls', [])
    
    if not photo_urls:
        return None

    # Check first photo
    db_img_arr = download_image_as_array(photo_urls[0])
    if db_img_arr is None:
        return None

    try:
        # Use verify() for proven accuracy
        result = DeepFace.verify(
            img1_path=input_image,
            img2_path=db_img_arr,
            model_name=MODEL_NAME,
            distance_metric=METRIC,
            enforce_detection=False,
            align=True
        )
        return {
            "member": member,
            "distance": result['distance']
        }
    except Exception as e:
        print(f"Verification error for {name}: {e}")
        return None

def recognize_face(input_image, patient_id):
    """
    Main function: Uses ThreadPool to verify against all candidates in parallel.
    """
    if input_image is None:
        return {"error": "No image provided"}
    
    # 1. Fetch Candidates
    print(f"🔍 Fetching family for Patient: {patient_id}")
    candidates = fetch_family_members(patient_id)
    
    if not candidates:
        return {"name": "Unknown", "match": False, "confidence": 0.0, "message": "No family members found"}

    best_match = None
    lowest_distance = 100.0

    # 2. Parallel Verification
    # We submit all candidates to the thread pool
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        # Create a dictionary to map futures to candidates (if needed)
        future_to_member = {
            executor.submit(verify_single_candidate, input_image, member): member 
            for member in candidates
        }

        print(f"🚀 verifying {len(candidates)} candidates in parallel...")

        for future in as_completed(future_to_member):
            res = future.result()
            if res:
                dist = res['distance']
                name = res['member']['name']
                print(f" - Checked {name}: Distance {dist:.4f}")
                
                if dist < lowest_distance:
                    lowest_distance = dist
                    best_match = res['member']

    # 3. Final Decision
    if lowest_distance < THRESHOLD and best_match:
        return {
            "id": best_match['id'],
            "name": best_match['name'],
            "relationship": best_match['relationship'],
            "confidence": round((1.0 - lowest_distance), 2),
            "match": True
        }
    else:
        return {
            "name": "Unknown",
            "relationship": "",
            "confidence": round((1.0 - lowest_distance), 2) if best_match else 0.0,
            "match": False
        }

# --- 4. GRADIO INTERFACE ---

with gr.Blocks(title="Memora Face Recognition V2 (Threaded)") as demo:
    gr.Markdown("# Memora Face Recognition V2")
    gr.Markdown(f"Powered by **{MODEL_NAME}** (Parallelized)")
    
    with gr.Row():
        with gr.Column():
            img_input = gr.Image(type="numpy", label="Upload Face")
            id_input = gr.Textbox(label="Patient ID", placeholder="Enter UUID")
            submit_btn = gr.Button("Recognize")
        
        with gr.Column():
            json_output = gr.JSON(label="Result")
    
    submit_btn.click(
        fn=recognize_face,
        inputs=[img_input, id_input],
        outputs=json_output,
        api_name="predict"
    )

if __name__ == "__main__":
    demo.launch()
