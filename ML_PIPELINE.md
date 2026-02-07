# ML Pipeline & Next Steps

This document outlines the remaining work for the Memora platform, focusing on machine learning model development, data collection, and production deployment.

---

## Current Status

### ✅ Completed
- [x] Caregiver Portal (Next.js) - CRUD for patients, memories, family
- [x] Mobile App (React Native/Expo) - UI, navigation, profile
- [x] Database Schema (Prisma + Supabase)
- [x] Authentication (Caregiver login, Patient PIN)
- [x] RLS Policies for production data security
- [x] Face Recognition V2 (DeepFace with VGG-Face) 
- [x] AI Therapy Flow (Gemini Prompt Engine)

### 🔄 In Progress
- [ ] Contacting Biotech for clinical dataset (optional)
- [ ] On-device optimization (Phase 7)

### ⏳ Pending
- [ ] Production Deployment
- [ ] Model Integration
- [ ] Performance Optimization

---

## Phase 1: Data Collection (2-3 weeks)

### 1.1 Dataset Requirements

For face recognition, we need:

| Data Type | Quantity | Purpose |
|-----------|----------|---------|
| Face images per person | 5-10 | Training embeddings |
| Different lighting conditions | 3+ | Robustness |
| Different angles | 3+ | Angle invariance |
| Different expressions | 2-3 | Natural variation |

### 1.2 Collection Strategy

```
Option A: Use Existing Photos
├── Extract faces from uploaded Memory photos
├── Cluster by person using MTCNN/dlib
└── Manual verification in portal

Option B: Dedicated Capture Flow
├── Add "Capture Training Photos" in mobile app
├── Guide user through 5-10 photo captures
├── Automatic quality validation
└── Upload to Supabase Storage
```

### 1.3 Data Pipeline Implementation

```python
# data_collection/pipeline.py

class DataCollector:
    def __init__(self):
        self.face_detector = MTCNN()
        self.supabase = create_client(URL, KEY)
    
    def extract_faces(self, image_url):
        """Download image and extract face crops"""
        img = load_image(image_url)
        faces = self.face_detector.detect_faces(img)
        return [crop_face(img, f) for f in faces]
    
    def process_family_member(self, member_id):
        """Process all photos for a family member"""
        photos = self.supabase.from_('FamilyMember')
            .select('photoUrls')
            .eq('id', member_id)
            .single()
        
        face_crops = []
        for url in photos['photoUrls']:
            crops = self.extract_faces(url)
            face_crops.extend(crops)
        
        return face_crops
```

---

## Phase 2: Model Training (2-3 weeks)

### 2.1 Model Architecture Options

| Model | Pros | Cons |
|-------|------|------|
| **FaceNet** | Proven accuracy, good embeddings | Requires many samples |
| **ArcFace** | State-of-the-art accuracy | Heavier model |
| **MobileFaceNet** | Mobile-optimized, fast | Slightly lower accuracy |
| **InsightFace** | Flexible, pre-trained | Complex setup |

**Recommendation**: Start with **MobileFaceNet** for edge deployment, with **FaceNet** as fallback for server-side.

### 2.2 Training Pipeline

```
training/
├── config/
│   └── training_config.yaml
├── data/
│   ├── raw/              # Raw images
│   ├── processed/        # Face crops
│   └── embeddings/       # Pre-computed embeddings
├── models/
│   ├── base_model.py     # Pre-trained backbone
│   └── classifier.py     # Per-patient classifier
├── scripts/
│   ├── preprocess.py     # Data preprocessing
│   ├── train.py          # Training script
│   ├── evaluate.py       # Evaluation metrics
│   └── export.py         # Export for mobile
└── notebooks/
    └── exploration.ipynb
```

### 2.3 Training Strategy

#### Per-Patient Models (Recommended)
Each patient gets their own model trained only on their family members.

```python
# train.py
def train_patient_model(patient_id):
    # 1. Fetch family members
    family = get_family_members(patient_id)
    
    # 2. Prepare dataset
    dataset = FamilyDataset(family)
    train_loader = DataLoader(dataset, batch_size=16)
    
    # 3. Fine-tune pre-trained model
    model = load_pretrained('mobilefacenet')
    classifier = nn.Linear(512, len(family))
    
    # 4. Train
    for epoch in range(epochs):
        for images, labels in train_loader:
            embeddings = model(images)
            loss = criterion(classifier(embeddings), labels)
            loss.backward()
            optimizer.step()
    
    # 5. Export
    export_model(model, f'models/{patient_id}.pt')
```

#### Shared Embedding Model
Single model generates embeddings, per-patient matching.

```python
# inference.py
def recognize_face(image, patient_id):
    # 1. Generate embedding
    embedding = model.encode(image)
    
    # 2. Load patient's family embeddings
    family_embeddings = load_embeddings(patient_id)
    
    # 3. Find nearest neighbor
    distances = cosine_similarity(embedding, family_embeddings)
    match_idx = np.argmax(distances)
    
    if distances[match_idx] > THRESHOLD:
        return family_embeddings.names[match_idx]
    return "Unknown"
```

### 2.4 Evaluation Metrics

| Metric | Target |
|--------|--------|
| Accuracy | > 95% |
| False Positive Rate | < 5% |
| Inference Time (Mobile) | < 200ms |
| Model Size | < 10MB |

---

## Phase 3: Model Deployment (1-2 weeks)

### 3.1 Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| **On-Device (TFLite/ONNX)** | Fast, works offline | Limited compute |
| **Cloud API (Lambda/Cloud Run)** | Powerful, updateable | Latency, requires internet |
| **Hybrid** | Best of both | Complex architecture |

**Recommendation**: Start with **Cloud API**, migrate to on-device later.

### 3.2 Cloud Deployment Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────>│   API Gateway   │────>│  Lambda/Cloud   │
│                 │     │   (Supabase     │     │    Function     │
│  Camera Capture │     │    Edge)        │     │  (Model Serve)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   Model Store   │
                                               │    (S3/GCS)     │
                                               └─────────────────┘
```

### 3.3 Supabase Edge Function (Recommended)

```typescript
// supabase/functions/recognize-face/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { image, patientId } = await req.json()
  
  // 1. Decode base64 image
  const imageBytes = decode(image)
  
  // 2. Call ML model service
  const response = await fetch(INFERENCE_URL, {
    method: 'POST',
    body: JSON.stringify({ image: imageBytes, patientId })
  })
  
  const result = await response.json()
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 3.4 Mobile Integration

```typescript
// mobile/lib/recognition.ts
export async function recognizeFace(imageUri: string): Promise<RecognitionResult> {
  // 1. Convert image to base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64
  })
  
  // 2. Call recognition API
  const { data, error } = await supabase.functions.invoke('recognize-face', {
    body: { image: base64, patientId }
  })
  
  if (error) throw error
  
  return {
    name: data.name,
    confidence: data.confidence,
    relationship: data.relationship
  }
}
```

---

## Phase 4: Production Readiness (1-2 weeks)

### 4.1 Testing Checklist

- [ ] Unit tests for API endpoints
- [ ] Integration tests for mobile ↔ backend
- [ ] Model accuracy validation on held-out data
- [ ] Performance testing under load
- [ ] Security audit (RLS, auth, input validation)

### 4.2 Monitoring & Logging

```yaml
# Recommended services
Monitoring:
  - Supabase Dashboard (DB metrics)
  - Sentry (Error tracking)
  - Analytics (Usage patterns)

Logging:
  - Supabase Logs (API calls)
  - Custom logs (Model inference)
```

### 4.3 Deployment Checklist

- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Mobile app signed for production
- [ ] App store assets prepared

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1** | 2-3 weeks | Data collection pipeline, Training dataset |
| **Phase 2** | 2-3 weeks | Trained model, Evaluation metrics |
| **Phase 3** | 1-2 weeks | Deployed API, Mobile integration |
| **Phase 4** | 1-2 weeks | Production-ready platform |

**Total Estimated Time**: 6-10 weeks

---

## Immediate Next Steps

1. **Data Collection Setup**
   - Implement face extraction script
   - Add photo upload flow in portal
   - Create data validation checks

2. **Model Prototyping**
   - Set up training environment (GPU/Colab)
   - Test pre-trained models on sample data
   - Benchmark accuracy vs speed

3. **API Design**
   - Define recognition endpoint contract
   - Implement Supabase Edge Function
   - Test end-to-end flow

---

## Resources

### Tutorials
- [FaceNet Paper](https://arxiv.org/abs/1503.03832)
- [MobileFaceNet](https://arxiv.org/abs/1804.07573)
- [InsightFace GitHub](https://github.com/deepinsight/insightface)

### Tools
- [MTCNN (Face Detection)](https://github.com/ipazc/mtcnn)
- [TensorFlow Lite](https://www.tensorflow.org/lite)
- [ONNX Runtime](https://onnxruntime.ai/)

### Datasets (for pre-training)
- LFW (Labeled Faces in the Wild)
- MS-Celeb-1M
- VGGFace2
