"""
Memora ML Utilities
Shared utilities for data loading, preprocessing, and model export.
"""

import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
import os


# ============================================================================
# Vocabulary Management
# ============================================================================

class Vocabulary:
    """Manages vocabulary for text tokenization."""
    
    def __init__(self, special_tokens: List[str] = None):
        self.special_tokens = special_tokens or ["<PAD>", "<UNK>", "<START>", "<END>"]
        self.word2idx: Dict[str, int] = {}
        self.idx2word: Dict[int, str] = {}
        self._build_special_tokens()
    
    def _build_special_tokens(self):
        """Initialize with special tokens."""
        for idx, token in enumerate(self.special_tokens):
            self.word2idx[token] = idx
            self.idx2word[idx] = token
    
    def build_from_texts(self, texts: List[str], min_freq: int = 1) -> None:
        """Build vocabulary from a list of texts."""
        word_counts: Dict[str, int] = {}
        for text in texts:
            for word in text.lower().split():
                word_counts[word] = word_counts.get(word, 0) + 1
        
        idx = len(self.special_tokens)
        for word, count in sorted(word_counts.items()):
            if count >= min_freq and word not in self.word2idx:
                self.word2idx[word] = idx
                self.idx2word[idx] = word
                idx += 1
    
    def encode(self, text: str, max_length: int = None) -> List[int]:
        """Convert text to token indices."""
        tokens = text.lower().split()
        indices = [self.word2idx.get(t, self.word2idx["<UNK>"]) for t in tokens]
        
        if max_length:
            if len(indices) < max_length:
                indices = indices + [self.word2idx["<PAD>"]] * (max_length - len(indices))
            else:
                indices = indices[:max_length]
        
        return indices
    
    def decode(self, indices: List[int], skip_special: bool = True) -> str:
        """Convert token indices back to text."""
        words = []
        for idx in indices:
            word = self.idx2word.get(idx, "<UNK>")
            if skip_special and word in self.special_tokens:
                continue
            words.append(word)
        return " ".join(words)
    
    def save(self, path: str) -> None:
        """Save vocabulary to JSON file."""
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump({
                "word2idx": self.word2idx,
                "special_tokens": self.special_tokens
            }, f, ensure_ascii=False, indent=2)
    
    @classmethod
    def load(cls, path: str) -> "Vocabulary":
        """Load vocabulary from JSON file."""
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        vocab = cls(special_tokens=data["special_tokens"])
        vocab.word2idx = data["word2idx"]
        vocab.idx2word = {int(v): k for k, v in data["word2idx"].items()}
        return vocab
    
    def __len__(self) -> int:
        return len(self.word2idx)


# ============================================================================
# Image Processing
# ============================================================================

def load_and_preprocess_image(
    image_path: str,
    target_size: Tuple[int, int] = (224, 224),
    normalize: bool = True
) -> np.ndarray:
    """Load and preprocess an image for model input."""
    img = tf.io.read_file(image_path)
    img = tf.image.decode_image(img, channels=3, expand_animations=False)
    img = tf.image.resize(img, target_size)
    
    if normalize:
        img = img / 255.0
    
    return img.numpy()


def augment_image(
    image: np.ndarray,
    rotation_range: float = 15.0,
    brightness_range: Tuple[float, float] = (0.8, 1.2),
    horizontal_flip: bool = True
) -> np.ndarray:
    """Apply data augmentation to an image."""
    # Random rotation
    if rotation_range > 0:
        angle = np.random.uniform(-rotation_range, rotation_range)
        # Simple rotation using TF
        image = tf.image.rot90(image, k=int(angle // 90) % 4).numpy()
    
    # Random brightness
    if brightness_range:
        factor = np.random.uniform(*brightness_range)
        image = np.clip(image * factor, 0, 1)
    
    # Random horizontal flip
    if horizontal_flip and np.random.random() > 0.5:
        image = np.fliplr(image)
    
    return image


# ============================================================================
# TFLite Export
# ============================================================================

def export_to_tflite(
    model: tf.keras.Model,
    output_path: str,
    quantize: bool = False,
    representative_dataset: Optional[callable] = None
) -> str:
    """Export a Keras model to TFLite format."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    
    # Enable TF ops for complex operations
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    # Optional quantization for smaller model size
    if quantize:
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        if representative_dataset:
            converter.representative_dataset = representative_dataset
    
    converter.experimental_enable_resource_variables = True
    
    tflite_model = converter.convert()
    
    with open(output_path, "wb") as f:
        f.write(tflite_model)
    
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"✓ Model exported to {output_path} ({size_mb:.2f} MB)")
    
    return output_path


# ============================================================================
# Training Utilities
# ============================================================================

class TrainingLogger(tf.keras.callbacks.Callback):
    """Custom callback for logging training progress."""
    
    def __init__(self, log_file: str = None):
        super().__init__()
        self.log_file = log_file
        self.history = {"loss": [], "val_loss": [], "accuracy": [], "val_accuracy": []}
    
    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        for key in self.history:
            if key in logs:
                self.history[key].append(logs[key])
        
        print(f"Epoch {epoch + 1}: loss={logs.get('loss', 0):.4f}, "
              f"val_loss={logs.get('val_loss', 0):.4f}, "
              f"accuracy={logs.get('accuracy', 0):.4f}")
        
        if self.log_file:
            Path(self.log_file).parent.mkdir(parents=True, exist_ok=True)
            with open(self.log_file, "a") as f:
                f.write(f"{epoch},{logs.get('loss', 0)},{logs.get('val_loss', 0)},"
                        f"{logs.get('accuracy', 0)},{logs.get('val_accuracy', 0)}\n")


def get_callbacks(
    checkpoint_path: str,
    early_stopping_patience: int = 5,
    log_file: str = None
) -> List[tf.keras.callbacks.Callback]:
    """Get standard training callbacks."""
    Path(checkpoint_path).parent.mkdir(parents=True, exist_ok=True)
    
    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            checkpoint_path,
            save_best_only=True,
            save_weights_only=True,
            monitor="val_loss",
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=early_stopping_patience,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        ),
        TrainingLogger(log_file)
    ]
    
    return callbacks


# ============================================================================
# Data Splitting
# ============================================================================

def train_val_test_split(
    data: List[Any],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    seed: int = 42
) -> Tuple[List[Any], List[Any], List[Any]]:
    """Split data into train, validation, and test sets."""
    np.random.seed(seed)
    indices = np.random.permutation(len(data))
    
    train_end = int(len(data) * train_ratio)
    val_end = train_end + int(len(data) * val_ratio)
    
    train_indices = indices[:train_end]
    val_indices = indices[train_end:val_end]
    test_indices = indices[val_end:]
    
    data_array = np.array(data, dtype=object)
    
    return (
        list(data_array[train_indices]),
        list(data_array[val_indices]),
        list(data_array[test_indices])
    )


# ============================================================================
# Metrics
# ============================================================================

def compute_accuracy(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    """Compute classification accuracy."""
    return np.mean(np.argmax(y_true, axis=-1) == np.argmax(y_pred, axis=-1))


def compute_recognition_metrics(
    distances: np.ndarray,
    labels: np.ndarray,
    threshold: float = 0.6
) -> Dict[str, float]:
    """Compute face recognition metrics."""
    predictions = distances < threshold
    
    true_positives = np.sum((predictions == True) & (labels == 0))
    false_positives = np.sum((predictions == True) & (labels == 1))
    true_negatives = np.sum((predictions == False) & (labels == 1))
    false_negatives = np.sum((predictions == False) & (labels == 0))
    
    accuracy = (true_positives + true_negatives) / len(labels)
    precision = true_positives / (true_positives + false_positives + 1e-9)
    recall = true_positives / (true_positives + false_negatives + 1e-9)
    f1 = 2 * precision * recall / (precision + recall + 1e-9)
    
    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1,
        "true_positives": int(true_positives),
        "false_positives": int(false_positives),
        "true_negatives": int(true_negatives),
        "false_negatives": int(false_negatives)
    }


if __name__ == "__main__":
    # Test vocabulary
    vocab = Vocabulary()
    texts = ["Who visited the temple?", "What did you eat for Onam?"]
    vocab.build_from_texts(texts)
    print(f"Vocabulary size: {len(vocab)}")
    
    encoded = vocab.encode("Who visited the temple?", max_length=10)
    print(f"Encoded: {encoded}")
    
    decoded = vocab.decode(encoded)
    print(f"Decoded: {decoded}")
