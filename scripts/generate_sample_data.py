"""
Sample Data Generator for Memora
Generates training data for both Seq2Seq and Siamese models.
"""

import os
import sys
import argparse
from pathlib import Path

# Add models to path
sys.path.insert(0, str(Path(__file__).parent.parent / "models"))

from config import ensure_directories, data_config


def generate_all_sample_data(smoke_test: bool = False):
    """
    Generate sample data for all models.
    
    Args:
        smoke_test: Generate minimal data for testing
    """
    print("\n" + "="*60)
    print("📊 MEMORA Sample Data Generator")
    print("="*60)
    
    ensure_directories()
    
    # ========================================================================
    # Seq2Seq Prompt Generation Data
    # ========================================================================
    print("\n1️⃣ Generating Seq2Seq training data...")
    
    from seq2seq.dataset import generate_sample_dataset as gen_seq2seq
    
    num_samples = 50 if smoke_test else 500
    samples = gen_seq2seq(
        num_samples=num_samples,
        output_path=str(Path(data_config.sample_data_dir) / "prompt_training_data.csv")
    )
    
    print(f"   ✓ Generated {len(samples)} prompt training samples")
    
    # ========================================================================
    # Siamese Face Recognition Data
    # ========================================================================
    print("\n2️⃣ Generating Siamese face recognition data...")
    
    from siamese.dataset import generate_sample_face_dataset as gen_faces
    
    num_identities = 5 if smoke_test else 10
    images_per_id = 4 if smoke_test else 8
    
    face_dataset = gen_faces(
        num_identities=num_identities,
        images_per_identity=images_per_id,
        output_dir=str(Path(data_config.sample_data_dir) / "faces")
    )
    
    total_images = sum(len(imgs) for imgs in face_dataset.values())
    print(f"   ✓ Generated {len(face_dataset)} identities with {total_images} total images")
    
    # ========================================================================
    # Summary
    # ========================================================================
    print("\n" + "="*60)
    print("✅ SAMPLE DATA GENERATION COMPLETE!")
    print("="*60)
    print(f"\nData saved to: {data_config.sample_data_dir}")
    print("\nGenerated files:")
    print(f"  📝 Seq2Seq: prompt_training_data.csv ({num_samples} samples)")
    print(f"  👥 Siamese: faces/ ({num_identities} people × {images_per_id} images)")
    print("\nNext steps:")
    print("  python scripts/train_all.py        # Train all models")
    print("  python scripts/train_all.py --smoke-test  # Quick test")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Generate sample training data for Memora models"
    )
    parser.add_argument(
        "--smoke-test",
        action="store_true",
        help="Generate minimal data for testing"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    generate_all_sample_data(smoke_test=args.smoke_test)
