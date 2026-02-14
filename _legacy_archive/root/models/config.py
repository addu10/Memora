"""
Memora ML Models Configuration
Centralized configuration for model hyperparameters, paths, and training settings.
"""

import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Any

# Base paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
EXPORTS_DIR = MODELS_DIR / "exports"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
EXPORTS_DIR.mkdir(exist_ok=True)


@dataclass
class Seq2SeqConfig:
    """Configuration for Seq2Seq prompt generation model."""
    
    # Model architecture
    vocab_size: int = 5000
    embedding_dim: int = 128
    lstm_units: int = 256
    attention_units: int = 128
    dropout_rate: float = 0.2
    
    # Training
    batch_size: int = 32
    epochs: int = 50
    learning_rate: float = 0.001
    early_stopping_patience: int = 5
    
    # Data
    max_metadata_length: int = 50  # Max tokens for photo metadata
    max_question_length: int = 30  # Max tokens for generated question
    
    # Paths
    model_checkpoint_path: str = str(MODELS_DIR / "seq2seq" / "checkpoints")
    tflite_export_path: str = str(EXPORTS_DIR / "prompt_generator.tflite")
    vocab_path: str = str(MODELS_DIR / "seq2seq" / "vocab.json")
    
    # Special tokens
    start_token: str = "<START>"
    end_token: str = "<END>"
    pad_token: str = "<PAD>"
    unk_token: str = "<UNK>"


@dataclass
class SiameseConfig:
    """Configuration for Siamese face recognition model."""
    
    # Model architecture
    image_size: tuple = (224, 224)
    embedding_dim: int = 128
    backbone: str = "mobilenetv2"  # Options: "mobilenetv2", "resnet50", "custom"
    freeze_backbone: bool = True
    
    # Training
    batch_size: int = 32
    epochs: int = 50
    learning_rate: float = 0.0001
    margin: float = 1.0  # Contrastive loss margin
    early_stopping_patience: int = 5
    
    # Data augmentation
    augment: bool = True
    rotation_range: float = 15.0
    brightness_range: tuple = (0.8, 1.2)
    horizontal_flip: bool = True
    
    # Inference
    recognition_threshold: float = 0.6  # Distance threshold for face matching
    
    # Paths
    model_checkpoint_path: str = str(MODELS_DIR / "siamese" / "checkpoints")
    tflite_export_path: str = str(EXPORTS_DIR / "face_recognition.tflite")
    embeddings_path: str = str(MODELS_DIR / "siamese" / "embeddings.npz")


@dataclass
class DataConfig:
    """Configuration for data paths and processing."""
    
    # Data directories
    raw_data_dir: str = str(DATA_DIR / "raw")
    processed_data_dir: str = str(DATA_DIR / "processed")
    sample_data_dir: str = str(DATA_DIR / "sample")
    
    # Photo metadata
    metadata_csv: str = str(DATA_DIR / "processed" / "photo_metadata.csv")
    questions_csv: str = str(DATA_DIR / "processed" / "questions.csv")
    
    # Face recognition data
    faces_dir: str = str(DATA_DIR / "processed" / "faces")
    family_photos_dir: str = str(DATA_DIR / "raw" / "family_photos")
    
    # Kerala/Malayalam specific
    event_categories: List[str] = field(default_factory=lambda: [
        "Onam", "Vishu", "Christmas", "Eid", "Wedding", "Birthday",
        "Temple-Visit", "Church-Visit", "Mosque-Visit", "Family-Gathering",
        "Festival", "Anniversary", "Graduation", "Travel", "Daily-Life"
    ])
    
    location_categories: List[str] = field(default_factory=lambda: [
        "Home", "Temple", "Church", "Mosque", "Beach", "Hill-Station",
        "Market", "Hospital", "School", "Office", "Restaurant", "Park",
        "Relative-House", "Friend-House", "Other"
    ])


# Global configuration instances
seq2seq_config = Seq2SeqConfig()
siamese_config = SiameseConfig()
data_config = DataConfig()


def get_config(model_type: str) -> Any:
    """Get configuration for a specific model type."""
    configs = {
        "seq2seq": seq2seq_config,
        "siamese": siamese_config,
        "data": data_config
    }
    return configs.get(model_type)


def ensure_directories():
    """Create all necessary directories."""
    directories = [
        DATA_DIR / "raw",
        DATA_DIR / "processed",
        DATA_DIR / "sample",
        DATA_DIR / "processed" / "faces",
        DATA_DIR / "raw" / "family_photos",
        MODELS_DIR / "seq2seq" / "checkpoints",
        MODELS_DIR / "siamese" / "checkpoints",
        EXPORTS_DIR
    ]
    for d in directories:
        Path(d).mkdir(parents=True, exist_ok=True)


if __name__ == "__main__":
    ensure_directories()
    print("✓ All directories created")
    print(f"\n📁 Data directory: {DATA_DIR}")
    print(f"📁 Models directory: {MODELS_DIR}")
    print(f"📁 Exports directory: {EXPORTS_DIR}")
