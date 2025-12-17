"""
Siamese Network Face Recognition Inference
Utilities for recognizing faces using trained model.
"""

import os
import sys
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import tensorflow as tf

from config import siamese_config
from dataset import FaceDetector


class FaceRecognizer:
    """
    Recognize faces using trained Siamese network.
    
    Uses one-shot learning: compare input face against reference embeddings
    stored for each known person.
    """
    
    def __init__(self, config=None, model_path: str = None):
        """
        Initialize the face recognizer.
        
        Args:
            config: Model configuration
            model_path: Path to trained embedding model (Keras or TFLite)
        """
        self.config = config or siamese_config
        self.model = None
        self.tflite_interpreter = None
        self.detector = FaceDetector()
        
        # Store known face embeddings
        self.known_faces: Dict[str, List[np.ndarray]] = {}
        
        # Load model
        if model_path:
            self._load_model(model_path)
    
    def _load_model(self, model_path: str) -> None:
        """Load Keras or TFLite model."""
        model_path = Path(model_path)
        
        if not model_path.exists():
            print(f"⚠ Model not found at {model_path}")
            return
        
        if str(model_path).endswith(".tflite"):
            self.tflite_interpreter = tf.lite.Interpreter(model_path=str(model_path))
            self.tflite_interpreter.allocate_tensors()
            print(f"✓ Loaded TFLite model from {model_path}")
        else:
            self.model = tf.keras.models.load_model(str(model_path))
            print(f"✓ Loaded Keras model from {model_path}")
    
    def load_from_checkpoint(self, checkpoint_dir: str = None) -> None:
        """Load model from checkpoint directory."""
        checkpoint_dir = checkpoint_dir or self.config.model_checkpoint_path
        checkpoint_dir = Path(checkpoint_dir)
        
        # Try embedding network first
        keras_path = checkpoint_dir / "embedding_network.keras"
        if keras_path.exists():
            self._load_model(str(keras_path))
            return
        
        # Try TFLite model
        tflite_path = Path(self.config.tflite_export_path)
        if tflite_path.exists():
            self._load_model(str(tflite_path))
            return
        
        print(f"⚠ No trained model found in {checkpoint_dir}")
    
    def _get_embedding(self, image: np.ndarray) -> np.ndarray:
        """
        Get embedding vector for a face image.
        
        Args:
            image: Preprocessed face image (224, 224, 3) normalized to [0, 1]
        
        Returns:
            Embedding vector (128-dim)
        """
        if self.model is None and self.tflite_interpreter is None:
            raise ValueError("No model loaded")
        
        # Ensure correct shape
        if len(image.shape) == 3:
            image = np.expand_dims(image, axis=0)
        
        image = image.astype(np.float32)
        
        if self.model:
            embedding = self.model.predict(image, verbose=0)
        else:
            # TFLite inference
            input_details = self.tflite_interpreter.get_input_details()
            output_details = self.tflite_interpreter.get_output_details()
            
            self.tflite_interpreter.set_tensor(input_details[0]["index"], image)
            self.tflite_interpreter.invoke()
            embedding = self.tflite_interpreter.get_tensor(output_details[0]["index"])
        
        return embedding[0]
    
    def _preprocess_image(self, image_path: str) -> Optional[np.ndarray]:
        """Load and preprocess an image for embedding."""
        import cv2
        
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Detect and extract face
        face = self.detector.detect_and_extract(
            image_path,
            target_size=self.config.image_size
        )
        
        if face is None:
            # Use resized full image as fallback
            face = cv2.resize(img, self.config.image_size)
        
        # Normalize to [0, 1]
        face = face.astype(np.float32) / 255.0
        
        return face
    
    def register_person(
        self,
        name: str,
        image_paths: List[str] = None,
        images: List[np.ndarray] = None
    ) -> int:
        """
        Register a person's face(s) for recognition.
        
        Args:
            name: Person's name
            image_paths: List of paths to face images
            images: List of preprocessed face images
        
        Returns:
            Number of embeddings registered
        """
        embeddings = []
        
        if image_paths:
            for path in image_paths:
                face = self._preprocess_image(path)
                if face is not None:
                    try:
                        emb = self._get_embedding(face)
                        embeddings.append(emb)
                    except Exception as e:
                        print(f"  ⚠ Could not process {path}: {e}")
        
        if images:
            for img in images:
                try:
                    emb = self._get_embedding(img)
                    embeddings.append(emb)
                except Exception as e:
                    print(f"  ⚠ Could not process image: {e}")
        
        if embeddings:
            self.known_faces[name] = embeddings
            print(f"✓ Registered {name} with {len(embeddings)} embeddings")
        
        return len(embeddings)
    
    def register_from_directory(self, directory: str) -> Dict[str, int]:
        """
        Register all people from a directory structure.
        
        Expected structure:
        directory/
        ├── Person1/
        │   ├── img1.jpg
        │   └── img2.jpg
        └── Person2/
            └── img1.jpg
        
        Returns:
            Dictionary mapping name to number of embeddings
        """
        directory = Path(directory)
        results = {}
        
        for person_dir in directory.iterdir():
            if person_dir.is_dir():
                name = person_dir.name
                image_paths = []
                
                for ext in ["*.jpg", "*.jpeg", "*.png", "*.JPG", "*.JPEG", "*.PNG"]:
                    image_paths.extend(person_dir.glob(ext))
                
                if image_paths:
                    count = self.register_person(name, image_paths=[str(p) for p in image_paths])
                    results[name] = count
        
        print(f"\n✓ Registered {len(results)} people from {directory}")
        return results
    
    def recognize(
        self,
        image_path: str = None,
        image: np.ndarray = None,
        threshold: float = None
    ) -> Tuple[Optional[str], float, Dict[str, float]]:
        """
        Recognize a face.
        
        Args:
            image_path: Path to face image
            image: Preprocessed face image
            threshold: Recognition threshold (lower = stricter)
        
        Returns:
            Tuple of (recognized_name, confidence, all_distances)
            recognized_name is None if no match found
        """
        threshold = threshold or self.config.recognition_threshold
        
        # Get input embedding
        if image_path:
            face = self._preprocess_image(image_path)
            if face is None:
                return None, 0.0, {}
        elif image is not None:
            face = image
        else:
            raise ValueError("Either image_path or image required")
        
        query_embedding = self._get_embedding(face)
        
        # Compare against all known faces
        all_distances = {}
        best_match = None
        best_distance = float("inf")
        
        for name, embeddings in self.known_faces.items():
            # Get minimum distance to any of this person's embeddings
            min_distance = float("inf")
            for emb in embeddings:
                distance = np.linalg.norm(query_embedding - emb)
                min_distance = min(min_distance, distance)
            
            all_distances[name] = min_distance
            
            if min_distance < best_distance:
                best_distance = min_distance
                best_match = name
        
        # Check if match is within threshold
        if best_distance < threshold:
            confidence = 1.0 - (best_distance / threshold)  # Higher = better match
            return best_match, confidence, all_distances
        else:
            return None, 0.0, all_distances
    
    def recognize_in_image(
        self,
        image_path: str,
        threshold: float = None
    ) -> List[Dict]:
        """
        Detect and recognize all faces in an image.
        
        Returns:
            List of dicts with keys: name, confidence, bbox
        """
        import cv2
        
        threshold = threshold or self.config.recognition_threshold
        
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            return []
        
        # Detect faces
        faces = self.detector.detect_faces(img)
        
        results = []
        for face_rect in faces:
            # Extract face
            face = self.detector.extract_face(
                img, face_rect,
                target_size=self.config.image_size
            )
            
            # Normalize
            face = face.astype(np.float32) / 255.0
            
            # Recognize
            name, confidence, _ = self.recognize(image=face, threshold=threshold)
            
            results.append({
                "name": name or "Unknown",
                "confidence": confidence,
                "bbox": face_rect  # (x, y, w, h)
            })
        
        return results
    
    def save_embeddings(self, path: str = None) -> None:
        """Save registered embeddings to file."""
        path = path or self.config.embeddings_path
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        
        # Convert to numpy arrays
        data = {
            name: np.array(embeddings)
            for name, embeddings in self.known_faces.items()
        }
        
        np.savez(path, **data)
        print(f"✓ Saved embeddings to {path}")
    
    def load_embeddings(self, path: str = None) -> None:
        """Load registered embeddings from file."""
        path = path or self.config.embeddings_path
        
        if not Path(path).exists():
            print(f"⚠ No embeddings found at {path}")
            return
        
        data = np.load(path)
        self.known_faces = {name: list(data[name]) for name in data.files}
        print(f"✓ Loaded {len(self.known_faces)} identities from {path}")


# ============================================================================
# Main / Demo
# ============================================================================

if __name__ == "__main__":
    # Initialize recognizer
    recognizer = FaceRecognizer()
    recognizer.load_from_checkpoint()
    
    # Check if sample data exists for demo
    from config import data_config
    sample_faces_dir = Path(data_config.sample_data_dir) / "faces"
    
    if sample_faces_dir.exists():
        print("\n📸 Demo: Registering faces from sample data...")
        
        # Register known faces
        recognizer.register_from_directory(str(sample_faces_dir))
        
        # Test recognition on a random image
        import random
        all_images = list(sample_faces_dir.rglob("*.jpg"))
        
        if all_images:
            test_image = random.choice(all_images)
            print(f"\n🔍 Testing recognition on: {test_image.name}")
            
            name, confidence, distances = recognizer.recognize(image_path=str(test_image))
            
            if name:
                print(f"   ✓ Recognized: {name} (confidence: {confidence:.2f})")
            else:
                print(f"   ⚠ Unknown face")
            
            print("\n   All distances:")
            for person, dist in sorted(distances.items(), key=lambda x: x[1]):
                print(f"      {person}: {dist:.4f}")
    else:
        print("\n⚠ No sample data found. Run training first:")
        print("   python train.py --sample-data")
