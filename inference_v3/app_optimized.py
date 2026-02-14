import gradio as gr
import os
import cv2
import numpy as np
import requests
from PIL import Image
import io
from deepface import DeepFace
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import lru_cache
import hashlib

# --- 1. CONFIGURATION ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# --- 2. MODELS ---
MODEL_NAME = "Facenet512"
DETECTOR = "opencv"
METRIC = "cosine"
THRESHOLD = 0.40

# Performance settings
MAX_WORKERS = 4  # Parallel verification threads
EMBEDDING_CACHE_SIZE = 128  # Cache embeddings for frequently used photos

# Warmup 
try:
    print(f"⏳ Warming up {MODEL_NAME}...")
    DeepFace.build_model(MODEL_NAME)
    print(f"✅ {MODEL_NAME} Loaded Successfully")
except Exception as e:
    print(f"⚠️ Model Warmup Warning: {e}")

# --- 3. EMBEDDING CACHE ---
# Cache database photo embeddings to avoid reprocessing same images

@lru_cache(maxsize=EMBEDDING_CACHE_SIZE)
def get_cached_embedding(photo_url_hash):
    """Cached wrapper - actual computation happens in compute_embedding"""
    # This is just for LRU mechanism, actual work in compute_embedding
    return None

def compute_embedding(image_array):
    """Extract embedding from image (core computation)"""
    try:
        embedding_objs = DeepFace.represent(
            img_path=image_array,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR,
            enforce_detection=False,
            align=True
        )
        if embedding_objs and len(embedding_objs) > 0:
            return np.array(embedding_objs[0]['embedding'])
        return None
    except Exception as e:
        print(f"Embedding extraction error: {e}")
        return None

# Global cache for embeddings
_embedding_cache = {}

def get_or_compute_embedding(photo_url, image_array):
    """Get embedding from cache or compute if not cached"""
    # Create hash of URL for cache key
    url_hash = hashlib.md5(photo_url.encode()).hexdigest()
    
    if url_hash in _embedding_cache:
        return _embedding_cache[url_hash]
    
    # Compute new embedding
    embedding = compute_embedding(image_array)
    
    # Store in cache if successful
    if embedding is not None:
        _embedding_cache[url_hash] = embedding
        
        # Limit cache size (keep most recent)
        if len(_embedding_cache) > EMBEDDING_CACHE_SIZE:
            # Remove oldest item
            oldest_key = next(iter(_embedding_cache))
            del _embedding_cache[oldest_key]
    
    return embedding

# --- 4. HELPER FUNCTIONS ---

def check_image_quality(image_array):
    """Check if image has sufficient quality (optimized version)"""
    if isinstance(image_array, np.ndarray):
        img = image_array
    else:
        img = np.array(image_array)
    
    height, width = img.shape[:2]
    
    if width < 100 or height < 100:
        return False, "Image too small (min 100x100)"
    
    # Fast quality checks
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    
    # Blur check (Laplacian variance)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur_score < 100:
        return False, f"Image too blurry (score: {blur_score:.1f})"
    
    # Brightness check
    brightness = np.mean(gray)
    if brightness < 30 or brightness > 225:
        return False, f"Poor lighting (brightness: {brightness:.1f})"
    
    return True, "OK"

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

def calculate_cosine_distance(embedding1, embedding2):
    """Fast cosine distance calculation"""
    # Normalize embeddings
    embedding1_norm = embedding1 / np.linalg.norm(embedding1)
    embedding2_norm = embedding2 / np.linalg.norm(embedding2)
    
    # Cosine similarity
    similarity = np.dot(embedding1_norm, embedding2_norm)
    
    # Convert to distance (0 = identical, 1 = completely different)
    distance = 1 - similarity
    
    return distance

def verify_single_photo(input_embedding, photo_url, member_name, photo_idx):
    """Verify against a single photo (for parallel processing)"""
    try:
        db_img_arr = download_image_as_array(photo_url)
        if db_img_arr is None:
            return None
        
        # Get or compute cached embedding for this photo
        db_embedding = get_or_compute_embedding(photo_url, db_img_arr)
        if db_embedding is None:
            return None
        
        # Fast distance calculation
        distance = calculate_cosine_distance(input_embedding, db_embedding)
        
        return distance
        
    except Exception as e:
        print(f"Photo verification error for {member_name} (photo {photo_idx}): {e}")
        return None

def verify_candidate_parallel(input_embedding, member):
    """Enhanced multi-photo verification with parallel processing"""
    name = member.get('name', 'Unknown')
    photo_urls = member.get('photoUrls', [])
    
    if not photo_urls:
        print(f"No photos for {name}")
        return None

    distances = []
    
    # Parallel verification of all photos
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_url = {
            executor.submit(verify_single_photo, input_embedding, url, name, idx): idx
            for idx, url in enumerate(photo_urls)
        }
        
        for future in as_completed(future_to_url):
            distance = future.result()
            if distance is not None:
                distances.append(distance)
    
    if not distances:
        return None
    
    # Use best (minimum) distance
    best_distance = min(distances)
    
    return {
        "member": member,
        "distance": best_distance,
        "photos_checked": len(distances)
    }

def verify_all_candidates_parallel(input_embedding, candidates):
    """Verify against all family members in parallel"""
    results = []
    
    # Parallel verification across all family members
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_member = {
            executor.submit(verify_candidate_parallel, input_embedding, member): member
            for member in candidates
        }
        
        for future in as_completed(future_to_member):
            res = future.result()
            if res:
                results.append(res)
                name = res['member']['name']
                dist = res['distance']
                print(f" - Checked {name}: Distance {dist:.4f}")
    
    return results

def recognize_face(input_image, patient_id):
    """
    Optimized recognition with clear error states:
    1. No face in image → "No face detected"
    2. Face found but no match → "Unknown person"
    3. Face matches → Return person details
    """
    if input_image is None:
        return {"error": "No image provided", "match": False}
    
    if not patient_id or patient_id.strip() == "":
        return {"error": "Patient ID is required", "match": False}
    
    # STEP 1: Extract face and embedding from input (ONCE)
    print("🔍 Detecting face and extracting embedding...")
    try:
        # Extract face with alignment
        face_objs = DeepFace.extract_faces(
            img_path=input_image,
            detector_backend=DETECTOR,
            enforce_detection=True,
            align=True
        )
        
        if not face_objs or len(face_objs) == 0:
            return {
                "error": "No face detected in the image",
                "match": False,
                "error_type": "no_face",
                "suggestion": "Please upload an image with a clear, visible face"
            }
        
        # Check face detection confidence
        best_face = max(face_objs, key=lambda x: x['confidence'])
        face_confidence = best_face['confidence']
        
        print(f"✅ Face detected with confidence: {face_confidence:.2f}")
        
        if face_confidence < 0.85:
            return {
                "error": "Face detected but quality too low",
                "match": False,
                "error_type": "low_quality_face",
                "face_confidence": round(face_confidence, 2),
                "suggestion": "Please use a clearer image with better lighting"
            }
        
        # Extract embedding ONCE for input image
        input_embedding = compute_embedding(input_image)
        if input_embedding is None:
            return {
                "error": "Failed to extract face features",
                "match": False,
                "error_type": "embedding_error"
            }
            
    except ValueError as e:
        return {
            "error": "No face detected in the image",
            "match": False,
            "error_type": "no_face",
            "suggestion": "Please upload an image containing a human face"
        }
    except Exception as e:
        print(f"Face detection error: {e}")
        return {
            "error": f"Face detection failed: {str(e)}",
            "match": False,
            "error_type": "detection_error"
        }
    
    # STEP 2: Face detected ✓, now fetch family members
    print(f"👥 Fetching family for Patient: {patient_id}")
    candidates = fetch_family_members(patient_id)
    
    if not candidates:
        return {
            "name": "Unknown",
            "match": False,
            "confidence": 0.0,
            "error_type": "no_family_data",
            "message": "No family members found for this patient"
        }

    print(f"🚀 Verifying against {len(candidates)} family members (parallel mode)...")

    # STEP 3: Compare against all family members in parallel
    results = verify_all_candidates_parallel(input_embedding, candidates)

    # STEP 4: Analyze results
    if not results:
        return {
            "name": "Unknown",
            "relationship": "",
            "confidence": 0.0,
            "match": False,
            "error_type": "processing_error",
            "message": "Failed to process family member photos"
        }

    # Find best match
    results.sort(key=lambda x: x['distance'])
    best_match = results[0]
    best_distance = best_match['distance']
    
    print(f"✅ Best match: {best_match['member']['name']} with distance {best_distance:.4f}")

    # STEP 5: Decision - Match or Unknown Person
    if best_distance < THRESHOLD:
        # MATCHED - Known person
        confidence = max(0.0, min(1.0, 1.0 - best_distance))
        
        return {
            "id": best_match['member']['id'],
            "name": best_match['member']['name'],
            "relationship": best_match['member']['relationship'],
            "confidence": round(confidence, 2),
            "distance": round(best_distance, 4),
            "match": True,
            "error_type": None
        }
    else:
        # UNKNOWN PERSON - Face detected but doesn't match anyone
        confidence = max(0.0, min(1.0, 1.0 - best_distance))
        
        return {
            "name": "Unknown",
            "relationship": "",
            "confidence": round(confidence, 2),
            "distance": round(best_distance, 4),
            "match": False,
            "error_type": "unknown_person",
            "message": "Face detected but does not match any family member",
            "closest_match": best_match['member']['name'],
            "closest_distance": round(best_distance, 4)
        }

# --- 5. GRADIO INTERFACE ---

with gr.Blocks(title="Memora Face Recognition Enhanced") as demo:
    gr.Markdown("# Memora Face Recognition (Optimized)")
    gr.Markdown(f"**Model:** {MODEL_NAME} | **Detector:** {DETECTOR} | **Parallel Processing Enabled**")
    gr.Markdown(f"**Performance:** Embedding cache active | {MAX_WORKERS} parallel workers")
    
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
