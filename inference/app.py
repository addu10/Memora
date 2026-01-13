import gradio as gr
import os
import cv2
import numpy as np
import tensorflow as tf
from PIL import Image
import io
from sklearn.metrics.pairwise import cosine_similarity



# --- 1. CONFIGURATION ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
MODEL_PATH = "model.tflite"

import requests

# Load Haar Cascade (Global)
# Uses built-in OpenCV classifier (fast, no extra deps)
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    print("✅ Loaded Haar Cascade Face Detector")
except Exception as e:
    print(f"⚠️ Failed to load Haar Cascade: {e}")
    face_cascade = None

# Load Model (Global to avoid reloading)
try:
    base_model = tf.keras.models.load_model("siamese_model.h5")
    print("✅ Loaded Custom Siamese Model")
except:
    print("⚠️ Custom model not found, loading MobileNetV2 (ImageNet) as fallback feature extractor")
    base_model = tf.keras.applications.MobileNetV2(
        weights='imagenet', 
        include_top=False, 
        pooling='avg',
        input_shape=(224, 224, 3)
    )

# --- 2. HELPER FUNCTIONS ---

def crop_face(image_pil, margin=10):
    """
    Detects face using OpenCV Haar Cascade and crops it. 
    Returns cropped PIL image. 
    If no face found, returns original image.
    """
    if face_cascade is None:
        return image_pil
        
    img_arr = np.array(image_pil)
    # Convert to Grayscale for detection
    try:
        if len(img_arr.shape) == 3:
            gray = cv2.cvtColor(img_arr, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_arr
            
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    except Exception as e:
        print(f"Error in detection: {e}")
        return image_pil
        
    if len(faces) == 0:
        print("No face detected, using full image.")
        return image_pil
        
    # Find largest face
    # x, y, w, h
    best_face = max(faces, key=lambda rect: rect[2] * rect[3])
    x, y, w, h = best_face
    
    # Add margin
    x = max(0, x - margin)
    y = max(0, y - margin)
    w = w + 2 * margin
    h = h + 2 * margin
    
    # Ensure within bounds
    height, width, _ = img_arr.shape
    w = min(w, width - x)
    h = min(h, height - y)
    
    # Crop
    cropped = image_pil.crop((x, y, x+w, y+h))
    return cropped

def preprocess_image(image_pil):
    """Convert PIL image to format expected by model (224x224, normalized)"""
    img = image_pil.resize((224, 224))
    img_array = np.array(img)
    # MobileNetV2 expects inputs in [-1, 1]
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0) # Add batch dimension
    return img_array

def get_embedding(image_pil):
    """Generate 1280-d (or model specific) embedding for a face"""
    # 1. Detect and Crop Face
    cropped_face = crop_face(image_pil)
    
    # 2. Preprocess
    processed_img = preprocess_image(cropped_face)
    
    # 3. Predict
    embedding = base_model.predict(processed_img)
    return embedding[0] # Return 1D array

def fetch_family_embeddings(patient_id):
    """
    Fetch family members for patient and computed embeddings using Supabase REST API.
    """
    # 1. Fetch Family Members via REST (No Supabase Client Dependency)
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: credentials missing")
        return []

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    
    # Query: select * from FamilyMember where patientId = eq.patient_id
    url = f"{SUPABASE_URL}/rest/v1/FamilyMember?select=*&patientId=eq.{patient_id}"
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Error fetching family: {response.text}")
            return []
            
        family_members = response.json()
    except Exception as e:
        print(f"Request failed: {e}")
        return []

    known_embeddings = []
    
    # 2. Process each member
    for member in family_members:
        if member.get('photoUrls') and len(member['photoUrls']) > 0:
            photo_url = member['photoUrls'][0]
            try:
                # Download photo
                resp = requests.get(photo_url)
                if resp.status_code == 200:
                    img = Image.open(io.BytesIO(resp.content)).convert('RGB')
                    emb = get_embedding(img)
                    known_embeddings.append({
                        "name": member['name'],
                        "id": member['id'],
                        "relationship": member['relationship'],
                        "embedding": emb
                    })
            except Exception as e:
                print(f"Error processing {member['name']}: {e}")
                
    return known_embeddings

# --- 3. CORE LOGIC ---

def recognize_face(input_image, patient_id):
    if input_image is None:
        return {"error": "No image provided"}
        
    print(f"Recognizing for Patient ID: {patient_id}")
    
    # 1. Generate Embedding for Input
    try:
        input_pil = Image.fromarray(input_image).convert('RGB')
        input_emb = get_embedding(input_pil)
    except Exception as e:
         return {"error": f"Failed to process input image: {str(e)}"}

    # 2. Fetch Known Embeddings
    known_faces = fetch_family_embeddings(patient_id)
    
    if not known_faces:
        return {
            "name": "Unknown",
            "confidence": 0.0,
            "message": "No family members found for this patient."
        }
        
    # 3. Compare (Cosine Similarity)
    # Prepare arrays for sklearn
    known_matrix = np.array([k['embedding'] for k in known_faces])
    input_vector = input_emb.reshape(1, -1)
    
    # Compute similarities
    similarities = cosine_similarity(input_vector, known_matrix)[0]
    
    # Find best match
    best_idx = np.argmax(similarities)
    best_score = float(similarities[best_idx])
    best_match = known_faces[best_idx]
    
    print(f"Best match: {best_match['name']} with score {best_score}")

    # Thresholding
    CONFIDENCE_THRESHOLD = 0.60
    
    if best_score > CONFIDENCE_THRESHOLD:
        return {
            "id": best_match['id'],
            "name": best_match['name'],
            "relationship": best_match['relationship'],
            "confidence": round(best_score, 2),
            "match": True
        }
    else:
        return {
            "name": "Unknown",
            "relationship": "",
            "confidence": round(best_score, 2),
            "match": False
        }

# --- 4. GRADIO INTERFACE (Blocks) ---

with gr.Blocks(title="Memora Face Recognition API") as demo:
    gr.Markdown("# Memora Face Recognition API")
    gr.Markdown("Siamese Network Inference backed by MobileNetV2")
    
    with gr.Row():
        with gr.Column():
            img_input = gr.Image(type="numpy", label="Upload Face")
            id_input = gr.Textbox(label="Patient ID", placeholder="Enter UUID")
            submit_btn = gr.Button("Recognize")
        
        with gr.Column():
            json_output = gr.JSON(label="Result")
    
    # Explicitly name the API endpoint "predict"
    submit_btn.click(
        fn=recognize_face,
        inputs=[img_input, id_input],
        outputs=json_output,
        api_name="predict"
    )

# Launch
if __name__ == "__main__":
    # verification of env vars
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️ WARNING: SUPABASE_URL or SUPABASE_KEY not set. Database lookups will fail.")
        
    demo.launch()
