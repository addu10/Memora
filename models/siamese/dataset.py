"""
Siamese Network Dataset Handler
Face detection, alignment, and pair generation for training.
"""

import os
import random
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import cv2

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

import tensorflow as tf

from config import siamese_config, data_config
from utils import load_and_preprocess_image, augment_image, train_val_test_split


# ============================================================================
# Face Detection (using OpenCV Haar Cascades - no external API)
# ============================================================================

class FaceDetector:
    """Simple face detector using OpenCV Haar Cascades."""
    
    def __init__(self):
        # Load pre-trained face detection model
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
        if self.face_cascade.empty():
            print("⚠ Could not load face cascade classifier")
    
    def detect_faces(
        self,
        image: np.ndarray,
        scale_factor: float = 1.1,
        min_neighbors: int = 5,
        min_size: Tuple[int, int] = (30, 30)
    ) -> List[Tuple[int, int, int, int]]:
        """
        Detect faces in an image.
        
        Returns:
            List of (x, y, width, height) tuples for each face
        """
        # Convert to grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=scale_factor,
            minNeighbors=min_neighbors,
            minSize=min_size
        )
        
        return [(x, y, w, h) for (x, y, w, h) in faces]
    
    def extract_face(
        self,
        image: np.ndarray,
        face_rect: Tuple[int, int, int, int],
        target_size: Tuple[int, int] = (224, 224),
        padding: float = 0.2
    ) -> np.ndarray:
        """
        Extract and align a face from the image.
        
        Args:
            image: Input image
            face_rect: (x, y, width, height) of face
            target_size: Output image size
            padding: Padding around face as fraction of face size
        """
        x, y, w, h = face_rect
        
        # Add padding
        pad_w = int(w * padding)
        pad_h = int(h * padding)
        
        x1 = max(0, x - pad_w)
        y1 = max(0, y - pad_h)
        x2 = min(image.shape[1], x + w + pad_w)
        y2 = min(image.shape[0], y + h + pad_h)
        
        # Crop face
        face = image[y1:y2, x1:x2]
        
        # Resize to target size
        face = cv2.resize(face, target_size)
        
        return face
    
    def detect_and_extract(
        self,
        image_path: str,
        target_size: Tuple[int, int] = (224, 224)
    ) -> Optional[np.ndarray]:
        """
        Detect and extract the largest face from an image.
        """
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        faces = self.detect_faces(image)
        
        if not faces:
            # If no face detected, return the whole image resized
            return cv2.resize(image, target_size)
        
        # Get largest face
        largest_face = max(faces, key=lambda f: f[2] * f[3])
        
        return self.extract_face(image, largest_face, target_size)


# ============================================================================
# Sample Data Generation
# ============================================================================

def generate_sample_face_dataset(
    num_identities: int = 10,
    images_per_identity: int = 8,
    output_dir: str = None,
    image_size: Tuple[int, int] = (224, 224)
) -> Dict[str, List[str]]:
    """
    Generate synthetic face dataset for training demonstrations.
    Creates color variations of base patterns as "faces".
    
    Args:
        num_identities: Number of unique people
        images_per_identity: Number of images per person
        output_dir: Directory to save images
        image_size: Image dimensions
    
    Returns:
        Dictionary mapping person name to list of image paths
    """
    output_dir = Path(output_dir or data_config.sample_data_dir) / "faces"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Sample Kerala names for identities
    names = [
        "Amma", "Achan", "Priya", "Arun", "Lakshmi",
        "Suresh", "Meera", "Rahul", "Ammachi", "Appuppan",
        "Sreeja", "Vishnu", "Deepa", "Anand", "Kavitha"
    ][:num_identities]
    
    dataset = {}
    
    for i, name in enumerate(names):
        person_dir = output_dir / name
        person_dir.mkdir(exist_ok=True)
        
        # Generate base color for this identity
        base_hue = (i / num_identities) * 180
        
        image_paths = []
        
        for j in range(images_per_identity):
            # Create synthetic "face" with unique pattern per identity
            img = np.zeros((*image_size, 3), dtype=np.uint8)
            
            # Fill with identity-specific color
            hue = base_hue + random.uniform(-10, 10)
            saturation = 150 + random.randint(-30, 30)
            value = 180 + random.randint(-40, 40)
            
            img[:, :] = [hue, saturation, value]
            img = cv2.cvtColor(img, cv2.COLOR_HSV2BGR)
            
            # Add identity-specific pattern (circle in center)
            center = (image_size[0] // 2, image_size[1] // 2)
            radius = 60 + random.randint(-10, 10)
            color = (
                50 + (i * 20) % 200,
                100 + (i * 15) % 150,
                150 + (i * 10) % 100
            )
            cv2.circle(img, center, radius, color, -1)
            
            # Add some variation (smaller circles)
            for _ in range(3):
                cx = random.randint(30, image_size[0] - 30)
                cy = random.randint(30, image_size[1] - 30)
                r = random.randint(10, 25)
                cv2.circle(img, (cx, cy), r, color, -1)
            
            # Add noise for variation
            noise = np.random.randint(-20, 20, img.shape, dtype=np.int16)
            img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            
            # Save image
            img_path = person_dir / f"{name}_{j:02d}.jpg"
            cv2.imwrite(str(img_path), img)
            image_paths.append(str(img_path))
        
        dataset[name] = image_paths
    
    print(f"✓ Generated {num_identities} identities × {images_per_identity} images")
    print(f"  Saved to: {output_dir}")
    
    return dataset


# ============================================================================
# Pair Generation for Training
# ============================================================================

def create_pairs(
    dataset: Dict[str, List[str]],
    pairs_per_identity: int = 20
) -> Tuple[List[Tuple[str, str]], List[int]]:
    """
    Create positive and negative pairs for Siamese training.
    
    Args:
        dataset: Dictionary mapping identity to list of image paths
        pairs_per_identity: Number of pairs to create per identity
    
    Returns:
        Tuple of (pairs, labels) where:
        - pairs: List of (image_path1, image_path2) tuples
        - labels: List of labels (0 = same person, 1 = different person)
    """
    pairs = []
    labels = []
    
    identities = list(dataset.keys())
    
    for identity in identities:
        images = dataset[identity]
        
        # Positive pairs (same person)
        num_positives = min(pairs_per_identity // 2, len(images) * (len(images) - 1) // 2)
        for _ in range(num_positives):
            img1, img2 = random.sample(images, 2)
            pairs.append((img1, img2))
            labels.append(0)  # Same person
        
        # Negative pairs (different people)
        other_identities = [id for id in identities if id != identity]
        for _ in range(pairs_per_identity - num_positives):
            other_id = random.choice(other_identities)
            img1 = random.choice(images)
            img2 = random.choice(dataset[other_id])
            pairs.append((img1, img2))
            labels.append(1)  # Different person
    
    # Shuffle
    combined = list(zip(pairs, labels))
    random.shuffle(combined)
    pairs, labels = zip(*combined)
    
    return list(pairs), list(labels)


# ============================================================================
# Dataset Class
# ============================================================================

class SiameseDataset:
    """Dataset class for Siamese face recognition training."""
    
    def __init__(self, config=None):
        self.config = config or siamese_config
        self.detector = FaceDetector()
        self.dataset: Dict[str, List[str]] = {}
    
    def load_from_directory(self, directory: str) -> None:
        """
        Load face images from directory structure.
        
        Expected structure:
        directory/
        ├── Person1/
        │   ├── img1.jpg
        │   └── img2.jpg
        └── Person2/
            └── img1.jpg
        """
        directory = Path(directory)
        self.dataset = {}
        
        for person_dir in directory.iterdir():
            if person_dir.is_dir():
                person_name = person_dir.name
                images = []
                
                for img_path in person_dir.glob("*.[jJ][pP][gG]"):
                    images.append(str(img_path))
                for img_path in person_dir.glob("*.[pP][nN][gG]"):
                    images.append(str(img_path))
                
                if images:
                    self.dataset[person_name] = images
        
        print(f"✓ Loaded {len(self.dataset)} identities from {directory}")
        for name, images in self.dataset.items():
            print(f"  {name}: {len(images)} images")
    
    def load_sample_data(self, num_identities: int = 10, images_per_identity: int = 8) -> None:
        """Generate and load sample data."""
        self.dataset = generate_sample_face_dataset(
            num_identities=num_identities,
            images_per_identity=images_per_identity
        )
    
    def prepare_training_data(
        self,
        pairs_per_identity: int = 30,
        train_ratio: float = 0.7,
        val_ratio: float = 0.15
    ) -> Tuple[tuple, tuple, tuple]:
        """
        Prepare data for training.
        
        Returns:
            Tuple of (train_data, val_data, test_data)
            Each contains (image_pairs, labels)
        """
        # Create pairs
        all_pairs, all_labels = create_pairs(self.dataset, pairs_per_identity)
        
        # Split
        indices = list(range(len(all_pairs)))
        train_idx, val_idx, test_idx = train_val_test_split(
            indices,
            train_ratio=train_ratio,
            val_ratio=val_ratio
        )
        
        def get_subset(indices):
            pairs = [all_pairs[i] for i in indices]
            labels = [all_labels[i] for i in indices]
            return pairs, labels
        
        train_data = get_subset(train_idx)
        val_data = get_subset(val_idx)
        test_data = get_subset(test_idx)
        
        print(f"✓ Training pairs: {len(train_data[0])}")
        print(f"✓ Validation pairs: {len(val_data[0])}")
        print(f"✓ Test pairs: {len(test_data[0])}")
        
        return train_data, val_data, test_data
    
    def _load_and_preprocess(
        self,
        image_path: str,
        augment: bool = False
    ) -> np.ndarray:
        """Load and preprocess a single image."""
        img = load_and_preprocess_image(
            image_path,
            target_size=self.config.image_size,
            normalize=True
        )
        
        if augment and self.config.augment:
            img = augment_image(
                img,
                rotation_range=self.config.rotation_range,
                brightness_range=self.config.brightness_range,
                horizontal_flip=self.config.horizontal_flip
            )
        
        return img
    
    def create_tf_dataset(
        self,
        pairs: List[Tuple[str, str]],
        labels: List[int],
        batch_size: int = None,
        shuffle: bool = True,
        augment: bool = False
    ) -> tf.data.Dataset:
        """Create TensorFlow dataset."""
        batch_size = batch_size or self.config.batch_size
        
        def load_pair(pair_idx):
            path1, path2 = pairs[pair_idx.numpy()]
            img1 = self._load_and_preprocess(path1, augment=augment)
            img2 = self._load_and_preprocess(path2, augment=augment)
            return img1, img2
        
        def tf_load_pair(idx):
            img1, img2 = tf.py_function(
                load_pair,
                [idx],
                [tf.float32, tf.float32]
            )
            img1.set_shape((*self.config.image_size, 3))
            img2.set_shape((*self.config.image_size, 3))
            return (img1, img2)
        
        # Create dataset from indices
        indices = tf.data.Dataset.from_tensor_slices(list(range(len(pairs))))
        labels_ds = tf.data.Dataset.from_tensor_slices(
            np.array(labels, dtype=np.float32)
        )
        
        # Load images
        images_ds = indices.map(tf_load_pair, num_parallel_calls=tf.data.AUTOTUNE)
        
        # Combine with labels
        dataset = tf.data.Dataset.zip((images_ds, labels_ds))
        
        # Format for model input
        dataset = dataset.map(
            lambda x, y: ({"image_a": x[0], "image_b": x[1]}, y),
            num_parallel_calls=tf.data.AUTOTUNE
        )
        
        if shuffle:
            dataset = dataset.shuffle(buffer_size=min(len(pairs), 1000))
        
        dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
        
        return dataset


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    # Test dataset generation
    dataset = SiameseDataset()
    dataset.load_sample_data(num_identities=5, images_per_identity=6)
    
    # Prepare training data
    train_data, val_data, test_data = dataset.prepare_training_data(
        pairs_per_identity=20
    )
    
    print("\n✓ Dataset ready for training!")
