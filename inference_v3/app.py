import gradio as gr
import os
import cv2
import numpy as np
import requests
from PIL import Image
import io
from deepface import DeepFace

# --- 1. CONFIGURATION ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

# --- 2. MODELS ---
MODEL_NAME = "Facenet512"  # Excellent accuracy + stability
DETECTOR = "opencv"        # Fast and thread-safe (upgrade to mtcnn for better accuracy)
METRIC = "cosine"
THRESHOLD = 0.40

# Warmup 
try:
    print(f"⏳ Warming up {MODEL_NAME}...")
    DeepFace.build_model(MODEL_NAME)
    print(f"✅ {MODEL_NAME} Loaded Successfully")
except Exception as e:
    print(f"⚠️ Model Warmup Warning: {e}")

# --- 3. HELPER FUNCTIONS ---

def check_image_quality(image_array):
    """Check if image has sufficient quality"""
    if isinstance(image_array, np.ndarray):
        img = Image.fromarray(image_array)
    else:
        img = image_array
    
    width, height = img.size
    
    if width < 100 or height < 100:
        return False, "Image too small (min 100x100)"
    
    gray = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    if blur_score < 100:
        return False, f"Image too blurry (score: {blur_score:.1f})"
    
    brightness = np.mean(gray)
    if brightness < 30 or brightness > 225:
        return False, f"Poor lighting (brightness: {brightness:.1f})"
    
    return True, "OK"

def validate_and_extract_face(image_array):
    """Validate face detection in image"""
    try:
        face_objs = DeepFace.extract_faces(
            img_path=image_array,
            detector_backend=DETECTOR,
            enforce_detection=True,
            align=True
        )
        
        if not face_objs:
            return None
        
        best_face = max(face_objs, key=lambda x: x['confidence'])
        
        if best_face['confidence'] < 0.85:
            print(f"⚠️ Low face confidence: {best_face['confidence']:.2f}")
            return None
        
        return best_face['face']
        
    except Exception as e:
        print(f"Face validation error: {e}")
        return None

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

def verify_candidate(input_image, member):
    """Enhanced multi-photo verification"""
    name = member.get('name', 'Unknown')
    photo_urls = member.get('photoUrls', [])
    
    if not photo_urls:
        print(f"No photos for {name}")
        return None

    distances = []
    
    # Check ALL available photos
    for idx, photo_url in enumerate(photo_urls):
        db_img_arr = download_image_as_array(photo_url)
        if db_img_arr is None:
            continue

        try:
            result = DeepFace.verify(
                img1_path=input_image,
                img2_path=db_img_arr,
                model_name=MODEL_NAME,
                distance_metric=METRIC,
                detector_backend=DETECTOR,
                enforce_detection=False,
                align=True
            )
            
            distances.append(result['distance'])
            
        except Exception as e:
            print(f"Verification error for {name} (photo {idx}): {e}")
            continue
    
    if not distances:
        return None
    
    # Use best (minimum) distance
    best_distance = min(distances)
    
    return {
        "member": member,
        "distance": best_distance,
        "photos_checked": len(distances)
    }

def recognize_face(input_image, patient_id):
    """
    Recognition with clear error states:
    1. No face in image → "No face detected"
    2. Face found but no match → "Unknown person"
    3. Face matches → Return person details
    """
    if input_image is None:
        return {"error": "No image provided", "match": False}
    
    if not patient_id or patient_id.strip() == "":
        return {"error": "Patient ID is required", "match": False}
    
    # STEP 1: Check if image contains a face
    print("🔍 Detecting face in input image...")
    try:
        face_objs = DeepFace.extract_faces(
            img_path=input_image,
            detector_backend=DETECTOR,
            enforce_detection=True,  # Will raise error if no face
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
            
    except ValueError as e:
        # DeepFace raises ValueError when no face is found
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
    print(f"🔍 Fetching family for Patient: {patient_id}")
    candidates = fetch_family_members(patient_id)
    
    if not candidates:
        return {
            "name": "Unknown",
            "match": False,
            "confidence": 0.0,
            "error_type": "no_family_data",
            "message": "No family members found for this patient"
        }

    print(f"🚀 Verifying against {len(candidates)} family members...")

    # STEP 3: Compare against family members
    results = []
    for member in candidates:
        res = verify_candidate(input_image, member)
        if res:
            results.append(res)
            name = res['member']['name']
            dist = res['distance']
            print(f" - Checked {name}: Distance {dist:.4f}")

    # STEP 4: Analyze results
    if not results:
        # Face detected but couldn't process family photos
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
    
    print(f"Best match: {best_match['member']['name']} with distance {best_distance:.4f}")

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
# --- 4. GRADIO INTERFACE ---

with gr.Blocks(title="Memora Face Recognition Enhanced") as demo:
    gr.Markdown("# Memora Face Recognition (Enhanced)")
    gr.Markdown(f"**Model:** {MODEL_NAME} | **Detector:** {DETECTOR} | **Quality Checks Enabled**")
    
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