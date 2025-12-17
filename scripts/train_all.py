"""
Master Training Script for Memora
Train all models end-to-end with a single command.
"""

import os
import sys
import argparse
import time
from pathlib import Path

# Add models to path
sys.path.insert(0, str(Path(__file__).parent.parent / "models"))

from config import ensure_directories


def train_all_models(smoke_test: bool = False, skip_seq2seq: bool = False, skip_siamese: bool = False):
    """
    Train all Memora ML models.
    
    Args:
        smoke_test: Run minimal training for testing
        skip_seq2seq: Skip Seq2Seq training
        skip_siamese: Skip Siamese training
    """
    print("\n" + "="*70)
    print("🧠 MEMORA - Complete Model Training Pipeline")
    print("="*70)
    
    start_time = time.time()
    ensure_directories()
    results = {}
    
    # ========================================================================
    # 1. Seq2Seq Prompt Generation Model
    # ========================================================================
    if not skip_seq2seq:
        print("\n" + "-"*70)
        print("📝 PHASE 1: Seq2Seq Prompt Generation Model")
        print("-"*70)
        
        try:
            from seq2seq.train import train_seq2seq_model
            
            seq2seq_model = train_seq2seq_model(
                use_sample_data=True,
                smoke_test=smoke_test
            )
            results["seq2seq"] = "✓ Success"
        except Exception as e:
            print(f"\n❌ Seq2Seq training failed: {e}")
            results["seq2seq"] = f"✗ Failed: {e}"
    else:
        results["seq2seq"] = "⊘ Skipped"
    
    # ========================================================================
    # 2. Siamese Face Recognition Model
    # ========================================================================
    if not skip_siamese:
        print("\n" + "-"*70)
        print("👤 PHASE 2: Siamese Face Recognition Model")
        print("-"*70)
        
        try:
            from siamese.train import train_siamese_model
            
            siamese_model = train_siamese_model(
                use_sample_data=True,
                smoke_test=smoke_test
            )
            results["siamese"] = "✓ Success"
        except Exception as e:
            print(f"\n❌ Siamese training failed: {e}")
            results["siamese"] = f"✗ Failed: {e}"
    else:
        results["siamese"] = "⊘ Skipped"
    
    # ========================================================================
    # Summary
    # ========================================================================
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)
    
    print("\n" + "="*70)
    print("📊 TRAINING SUMMARY")
    print("="*70)
    print(f"\nTotal time: {minutes}m {seconds}s")
    print("\nModel Results:")
    for model, status in results.items():
        print(f"  {model}: {status}")
    
    print("\n" + "-"*70)
    print("📁 Output Locations:")
    print("-"*70)
    
    from config import seq2seq_config, siamese_config
    
    print(f"\nSeq2Seq Model:")
    print(f"  Checkpoints: {seq2seq_config.model_checkpoint_path}")
    print(f"  TFLite: {seq2seq_config.tflite_export_path}")
    
    print(f"\nSiamese Model:")
    print(f"  Checkpoints: {siamese_config.model_checkpoint_path}")
    print(f"  TFLite: {siamese_config.tflite_export_path}")
    
    print("\n" + "="*70)
    print("✅ TRAINING PIPELINE COMPLETE!")
    print("="*70)
    
    # Usage instructions
    print("\n📱 Next Steps:")
    print("-"*70)
    print("1. Copy TFLite models to mobile app:")
    print("   - prompt_generator.tflite → mobile/assets/models/")
    print("   - face_recognition.tflite → mobile/assets/models/")
    print("\n2. Test inference:")
    print("   python -c \"from models.seq2seq.inference import PromptGenerator; ...")
    print("   python -c \"from models.siamese.inference import FaceRecognizer; ...")
    print("\n3. Run the web portal:")
    print("   cd portal && npm run dev")
    print("\n4. Run the mobile app:")
    print("   cd mobile && npx expo start")
    
    return results


def parse_args():
    parser = argparse.ArgumentParser(
        description="Train all Memora ML models"
    )
    parser.add_argument(
        "--smoke-test",
        action="store_true",
        help="Run minimal training for testing (fast, ~1-2 min)"
    )
    parser.add_argument(
        "--skip-seq2seq",
        action="store_true",
        help="Skip Seq2Seq model training"
    )
    parser.add_argument(
        "--skip-siamese",
        action="store_true",
        help="Skip Siamese model training"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train_all_models(
        smoke_test=args.smoke_test,
        skip_seq2seq=args.skip_seq2seq,
        skip_siamese=args.skip_siamese
    )
