"""
Seq2Seq Prompt Generation Training Script
Complete training pipeline with callbacks, checkpointing, and TFLite export.
"""

import os
import sys
import argparse
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import tensorflow as tf
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import SparseCategoricalCrossentropy

from config import seq2seq_config, data_config, ensure_directories
from utils import get_callbacks, export_to_tflite
from model import build_seq2seq
from dataset import Seq2SeqDataset, generate_sample_dataset


def train_seq2seq_model(
    config=None,
    use_sample_data: bool = True,
    csv_path: str = None,
    smoke_test: bool = False
) -> tf.keras.Model:
    """
    Train the Seq2Seq prompt generation model.
    
    Args:
        config: Model configuration (uses default if None)
        use_sample_data: Generate and use sample data for training
        csv_path: Path to custom training data CSV
        smoke_test: Run minimal training for testing
    
    Returns:
        Trained Keras model
    """
    config = config or seq2seq_config
    ensure_directories()
    
    print("\n" + "="*60)
    print("🧠 MEMORA Seq2Seq Prompt Generation Training")
    print("="*60)
    
    # ========================================================================
    # Data Preparation
    # ========================================================================
    print("\n📊 Preparing dataset...")
    
    dataset = Seq2SeqDataset(config)
    
    if csv_path and Path(csv_path).exists():
        dataset.load_from_csv(csv_path)
    elif use_sample_data:
        # Generate sample data
        num_samples = 50 if smoke_test else 500
        samples = generate_sample_dataset(
            num_samples=num_samples,
            output_path=str(Path(data_config.sample_data_dir) / "prompt_training_data.csv")
        )
        dataset.load_from_samples(samples)
    else:
        raise ValueError("No training data available. Use --sample-data or provide --csv-path")
    
    # Build vocabulary
    dataset.build_vocabulary()
    dataset.save_vocabulary()
    
    # Prepare training data
    train_data, val_data, test_data = dataset.prepare_training_data()
    
    # Create TF datasets
    train_ds = dataset.create_tf_dataset(*train_data, shuffle=True)
    val_ds = dataset.create_tf_dataset(*val_data, shuffle=False)
    test_ds = dataset.create_tf_dataset(*test_data, shuffle=False)
    
    # ========================================================================
    # Model Building
    # ========================================================================
    print("\n🏗️ Building model...")
    
    model = build_seq2seq(
        vocab_size=len(dataset.vocab),
        embedding_dim=config.embedding_dim,
        lstm_units=config.lstm_units
    )
    
    model.compile(
        optimizer=Adam(learning_rate=config.learning_rate),
        loss=SparseCategoricalCrossentropy(),
        metrics=["accuracy"]
    )
    
    model.summary()
    
    # ========================================================================
    # Training
    # ========================================================================
    print("\n🚀 Starting training...")
    
    epochs = 3 if smoke_test else config.epochs
    
    callbacks = get_callbacks(
        checkpoint_path=str(Path(config.model_checkpoint_path) / "best_model.weights.h5"),
        early_stopping_patience=config.early_stopping_patience,
        log_file=str(Path(config.model_checkpoint_path) / "training_log.csv")
    )
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks,
        verbose=1
    )
    
    # ========================================================================
    # Evaluation
    # ========================================================================
    print("\n📈 Evaluating model...")
    
    test_loss, test_accuracy = model.evaluate(test_ds, verbose=0)
    print(f"Test Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_accuracy:.4f}")
    
    # ========================================================================
    # Export to TFLite
    # ========================================================================
    print("\n📦 Exporting to TFLite...")
    
    export_to_tflite(
        model=model,
        output_path=config.tflite_export_path,
        quantize=True
    )
    
    # ========================================================================
    # Save Final Model
    # ========================================================================
    final_model_path = str(Path(config.model_checkpoint_path) / "final_model.keras")
    model.save(final_model_path)
    print(f"✓ Final model saved to {final_model_path}")
    
    # Save training summary
    summary_path = str(Path(config.model_checkpoint_path) / "training_summary.txt")
    with open(summary_path, "w") as f:
        f.write("Seq2Seq Prompt Generation Training Summary\n")
        f.write("="*50 + "\n\n")
        f.write(f"Vocabulary size: {len(dataset.vocab)}\n")
        f.write(f"Training samples: {len(train_data[0])}\n")
        f.write(f"Validation samples: {len(val_data[0])}\n")
        f.write(f"Test samples: {len(test_data[0])}\n")
        f.write(f"Epochs trained: {len(history.history['loss'])}\n")
        f.write(f"Final test loss: {test_loss:.4f}\n")
        f.write(f"Final test accuracy: {test_accuracy:.4f}\n")
        f.write(f"\nTFLite model: {config.tflite_export_path}\n")
    
    print(f"✓ Training summary saved to {summary_path}")
    
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETE!")
    print("="*60 + "\n")
    
    return model


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Train Seq2Seq prompt generation model"
    )
    parser.add_argument(
        "--csv-path",
        type=str,
        help="Path to training data CSV"
    )
    parser.add_argument(
        "--sample-data",
        action="store_true",
        default=True,
        help="Generate and use sample data for training"
    )
    parser.add_argument(
        "--smoke-test",
        action="store_true",
        help="Run minimal training for testing"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=None,
        help="Override number of training epochs"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=None,
        help="Override batch size"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    
    # Override config if needed
    config = seq2seq_config
    if args.epochs:
        config.epochs = args.epochs
    if args.batch_size:
        config.batch_size = args.batch_size
    
    # Train
    model = train_seq2seq_model(
        config=config,
        use_sample_data=args.sample_data,
        csv_path=args.csv_path,
        smoke_test=args.smoke_test
    )
