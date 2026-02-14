"""
Siamese Network Training Script
Complete training pipeline with pair generation, augmentation, and TFLite export.
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

from config import siamese_config, data_config, ensure_directories
from utils import get_callbacks, export_to_tflite, compute_recognition_metrics
from model import build_siamese, contrastive_loss, accuracy_at_threshold
from dataset import SiameseDataset


def train_siamese_model(
    config=None,
    use_sample_data: bool = True,
    data_dir: str = None,
    smoke_test: bool = False
) -> tf.keras.Model:
    """
    Train the Siamese face recognition model.
    
    Args:
        config: Model configuration (uses default if None)
        use_sample_data: Generate and use sample data for training
        data_dir: Path to directory with face images
        smoke_test: Run minimal training for testing
    
    Returns:
        Trained Keras model (embedding network)
    """
    config = config or siamese_config
    ensure_directories()
    
    print("\n" + "="*60)
    print("🧠 MEMORA Siamese Face Recognition Training")
    print("="*60)
    
    # ========================================================================
    # Data Preparation
    # ========================================================================
    print("\n📊 Preparing dataset...")
    
    dataset = SiameseDataset(config)
    
    if data_dir and Path(data_dir).exists():
        dataset.load_from_directory(data_dir)
    elif use_sample_data:
        num_identities = 5 if smoke_test else 10
        images_per_id = 4 if smoke_test else 8
        dataset.load_sample_data(
            num_identities=num_identities,
            images_per_identity=images_per_id
        )
    else:
        raise ValueError("No training data available. Use --sample-data or provide --data-dir")
    
    # Prepare training data
    pairs_per_id = 10 if smoke_test else 30
    train_data, val_data, test_data = dataset.prepare_training_data(
        pairs_per_identity=pairs_per_id
    )
    
    # Create TF datasets
    train_ds = dataset.create_tf_dataset(
        train_data[0], train_data[1],
        shuffle=True, augment=True
    )
    val_ds = dataset.create_tf_dataset(
        val_data[0], val_data[1],
        shuffle=False, augment=False
    )
    
    # ========================================================================
    # Model Building
    # ========================================================================
    print("\n🏗️ Building model...")
    
    backbone = "custom" if smoke_test else config.backbone
    
    siamese_model, embedding_network = build_siamese(
        embedding_dim=config.embedding_dim,
        backbone=backbone,
        freeze_backbone=config.freeze_backbone
    )
    
    siamese_model.compile(
        optimizer=Adam(learning_rate=config.learning_rate),
        loss=contrastive_loss(margin=config.margin),
        metrics=[
            accuracy_at_threshold(0.5),
            accuracy_at_threshold(config.recognition_threshold)
        ]
    )
    
    print("\nEmbedding Network Summary:")
    embedding_network.summary()
    
    # ========================================================================
    # Training
    # ========================================================================
    print("\n🚀 Starting training...")
    
    epochs = 3 if smoke_test else config.epochs
    
    callbacks = get_callbacks(
        checkpoint_path=str(Path(config.model_checkpoint_path) / "best_siamese.weights.h5"),
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
    
    # Get test predictions
    test_ds = dataset.create_tf_dataset(
        test_data[0], test_data[1],
        shuffle=False, augment=False
    )
    
    test_distances = []
    test_labels = []
    
    for batch_x, batch_y in test_ds:
        distances = siamese_model.predict(batch_x, verbose=0)
        test_distances.extend(distances.flatten())
        test_labels.extend(batch_y.numpy().flatten())
    
    test_distances = np.array(test_distances)
    test_labels = np.array(test_labels)
    
    # Compute metrics
    metrics = compute_recognition_metrics(
        test_distances,
        test_labels,
        threshold=config.recognition_threshold
    )
    
    print(f"\nTest Results (threshold={config.recognition_threshold}):")
    print(f"  Accuracy: {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall: {metrics['recall']:.4f}")
    print(f"  F1 Score: {metrics['f1_score']:.4f}")
    
    # ========================================================================
    # Save Embedding Network for Inference
    # ========================================================================
    print("\n📦 Saving models...")
    
    # Save embedding network (used for face recognition)
    embedding_path = str(Path(config.model_checkpoint_path) / "embedding_network.keras")
    embedding_network.save(embedding_path)
    print(f"✓ Embedding network saved to {embedding_path}")
    
    # Save full Siamese model
    siamese_path = str(Path(config.model_checkpoint_path) / "siamese_model.keras")
    siamese_model.save(siamese_path)
    print(f"✓ Siamese model saved to {siamese_path}")
    
    # ========================================================================
    # Export to TFLite
    # ========================================================================
    print("\n📱 Exporting to TFLite for mobile deployment...")
    
    export_to_tflite(
        model=embedding_network,
        output_path=config.tflite_export_path,
        quantize=True
    )
    
    # ========================================================================
    # Save Training Summary
    # ========================================================================
    summary_path = str(Path(config.model_checkpoint_path) / "training_summary.txt")
    with open(summary_path, "w") as f:
        f.write("Siamese Face Recognition Training Summary\n")
        f.write("="*50 + "\n\n")
        f.write(f"Backbone: {backbone}\n")
        f.write(f"Embedding dimension: {config.embedding_dim}\n")
        f.write(f"Number of identities: {len(dataset.dataset)}\n")
        f.write(f"Training pairs: {len(train_data[0])}\n")
        f.write(f"Validation pairs: {len(val_data[0])}\n")
        f.write(f"Test pairs: {len(test_data[0])}\n")
        f.write(f"Epochs trained: {len(history.history['loss'])}\n")
        f.write(f"\nTest Metrics:\n")
        f.write(f"  Accuracy: {metrics['accuracy']:.4f}\n")
        f.write(f"  Precision: {metrics['precision']:.4f}\n")
        f.write(f"  Recall: {metrics['recall']:.4f}\n")
        f.write(f"  F1 Score: {metrics['f1_score']:.4f}\n")
        f.write(f"\nTFLite model: {config.tflite_export_path}\n")
    
    print(f"✓ Training summary saved to {summary_path}")
    
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETE!")
    print("="*60 + "\n")
    
    return embedding_network


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Train Siamese face recognition model"
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        help="Path to directory containing face images"
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
        "--backbone",
        type=str,
        default=None,
        choices=["mobilenetv2", "resnet50", "custom"],
        help="Backbone network to use"
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    
    # Override config if needed
    config = siamese_config
    if args.epochs:
        config.epochs = args.epochs
    if args.backbone:
        config.backbone = args.backbone
    
    # Train
    model = train_siamese_model(
        config=config,
        use_sample_data=args.sample_data,
        data_dir=args.data_dir,
        smoke_test=args.smoke_test
    )
