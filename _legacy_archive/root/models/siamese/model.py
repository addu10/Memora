"""
Production Siamese Network for One-Shot Face Recognition
Uses MobileNetV2 backbone with transfer learning for high accuracy.
"""

from __future__ import annotations

import argparse
from typing import Tuple

import tensorflow as tf
from tensorflow.keras import Model, Sequential, layers
from tensorflow.keras.applications import MobileNetV2


def contrastive_loss(margin: float = 1.0):
    """
    Creates contrastive loss function for Siamese training.
    
    Args:
        margin: Margin for dissimilar pairs
    
    Label convention:
        0 = same person (want small distance)
        1 = different person (want large distance)
    """
    def loss(y_true, y_pred):
        y_true = tf.cast(y_true, y_pred.dtype)
        squared = tf.square(y_pred)
        margin_term = tf.square(tf.maximum(margin - y_pred, 0))
        return tf.reduce_mean((1 - y_true) * squared + y_true * margin_term)
    
    return loss


def build_embedding_base(
    embedding_dim: int = 128,
    backbone: str = "mobilenetv2",
    freeze_backbone: bool = True,
    input_shape: Tuple[int, int, int] = (224, 224, 3)
) -> Model:
    """
    Builds the embedding network (base for Siamese twins).
    
    Args:
        embedding_dim: Output embedding dimension
        backbone: Backbone network ("mobilenetv2", "resnet50", or "custom")
        freeze_backbone: Whether to freeze pretrained weights
        input_shape: Input image shape
    
    Returns:
        Keras Model that outputs embeddings
    """
    inputs = layers.Input(shape=input_shape, name="face_input")
    
    if backbone == "mobilenetv2":
        # MobileNetV2 backbone (optimized for mobile deployment)
        base_model = MobileNetV2(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape,
            pooling="avg"
        )
        
        if freeze_backbone:
            # Freeze all layers except last few
            for layer in base_model.layers[:-20]:
                layer.trainable = False
        
        x = base_model(inputs)
        
    elif backbone == "resnet50":
        from tensorflow.keras.applications import ResNet50
        base_model = ResNet50(
            weights="imagenet",
            include_top=False,
            input_shape=input_shape,
            pooling="avg"
        )
        
        if freeze_backbone:
            for layer in base_model.layers[:-30]:
                layer.trainable = False
        
        x = base_model(inputs)
        
    else:
        # Custom lightweight backbone for testing
        x = layers.Rescaling(1.0 / 255)(inputs)
        x = layers.Conv2D(32, 3, activation="relu", padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D()(x)
        
        x = layers.Conv2D(64, 3, activation="relu", padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D()(x)
        
        x = layers.Conv2D(128, 3, activation="relu", padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.MaxPooling2D()(x)
        
        x = layers.Conv2D(256, 3, activation="relu", padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.GlobalAveragePooling2D()(x)
    
    # Embedding layers
    x = layers.Dense(512, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.2)(x)
    embeddings = layers.Dense(embedding_dim, activation=None, name="embeddings")(x)
    
    # L2 normalize embeddings
    embeddings = layers.Lambda(
        lambda x: tf.math.l2_normalize(x, axis=1),
        name="l2_normalize"
    )(embeddings)
    
    return Model(inputs, embeddings, name="embedding_network")


def euclidean_distance(tensors):
    """Compute Euclidean distance between two embedding tensors."""
    x, y = tensors
    sum_square = tf.reduce_sum(tf.square(x - y), axis=1, keepdims=True)
    return tf.sqrt(tf.maximum(sum_square, tf.keras.backend.epsilon()))


def cosine_similarity(tensors):
    """Compute cosine similarity between two embedding tensors."""
    x, y = tensors
    # Already L2 normalized, so dot product = cosine similarity
    return 1 - tf.reduce_sum(x * y, axis=1, keepdims=True)


def build_siamese(
    embedding_dim: int = 128,
    backbone: str = "mobilenetv2",
    freeze_backbone: bool = True,
    distance_metric: str = "euclidean",
    input_shape: Tuple[int, int, int] = (224, 224, 3)
) -> Tuple[Model, Model]:
    """
    Build complete Siamese network for face recognition.
    
    Args:
        embedding_dim: Embedding dimension
        backbone: Backbone network type
        freeze_backbone: Whether to freeze backbone weights
        distance_metric: "euclidean" or "cosine"
        input_shape: Input image shape
    
    Returns:
        Tuple of (siamese_model, embedding_model)
    """
    # Build shared embedding network
    embedding_network = build_embedding_base(
        embedding_dim=embedding_dim,
        backbone=backbone,
        freeze_backbone=freeze_backbone,
        input_shape=input_shape
    )
    
    # Siamese inputs
    input_a = layers.Input(shape=input_shape, name="image_a")
    input_b = layers.Input(shape=input_shape, name="image_b")
    
    # Get embeddings (shared weights)
    embedding_a = embedding_network(input_a)
    embedding_b = embedding_network(input_b)
    
    # Distance computation
    if distance_metric == "cosine":
        distance = layers.Lambda(cosine_similarity, name="cosine_distance")(
            [embedding_a, embedding_b]
        )
    else:
        distance = layers.Lambda(euclidean_distance, name="euclidean_distance")(
            [embedding_a, embedding_b]
        )
    
    # Build models
    siamese_model = Model(
        [input_a, input_b],
        distance,
        name="siamese_network"
    )
    
    return siamese_model, embedding_network


def accuracy_at_threshold(threshold: float = 0.5):
    """Metric for accuracy at a given distance threshold."""
    def accuracy(y_true, y_pred):
        # y_true: 0 = same, 1 = different
        # y_pred: distance (low = same, high = different)
        predictions = tf.cast(y_pred > threshold, y_pred.dtype)
        correct = tf.cast(tf.equal(predictions, y_true), tf.float32)
        return tf.reduce_mean(correct)
    
    accuracy.__name__ = f"accuracy@{threshold}"
    return accuracy


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Siamese Network for Face Recognition"
    )
    parser.add_argument("--embedding-dim", type=int, default=128)
    parser.add_argument(
        "--backbone",
        type=str,
        default="custom",
        choices=["mobilenetv2", "resnet50", "custom"]
    )
    parser.add_argument("--summary", action="store_true", help="Print model summary")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    
    siamese_model, embedding_network = build_siamese(
        embedding_dim=args.embedding_dim,
        backbone=args.backbone
    )
    
    siamese_model.compile(
        optimizer="adam",
        loss=contrastive_loss(),
        metrics=[accuracy_at_threshold(0.5), accuracy_at_threshold(0.6)]
    )
    
    if args.summary:
        print("\n" + "="*60)
        print("Embedding Network:")
        print("="*60)
        embedding_network.summary()
        
        print("\n" + "="*60)
        print("Siamese Network:")
        print("="*60)
        siamese_model.summary()


if __name__ == "__main__":
    main()



