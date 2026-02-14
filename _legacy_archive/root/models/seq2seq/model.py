"""
Minimal Seq2Seq + attention scaffold for prompt generation.
Run with `--summary` to print model architecture.
"""

from __future__ import annotations

import argparse
from typing import Tuple

import tensorflow as tf
from tensorflow.keras import Model, layers


def build_seq2seq(
    vocab_size: int,
    embedding_dim: int = 128,
    lstm_units: int = 128,
) -> Model:
    """Constructs an encoder-decoder model with additive attention."""
    # Encoder
    encoder_inputs = layers.Input(shape=(None,), name="metadata_tokens")
    x = layers.Embedding(vocab_size, embedding_dim, mask_zero=True)(encoder_inputs)
    encoder_outputs, state_h, state_c = layers.LSTM(
        lstm_units, return_sequences=True, return_state=True
    )(x)

    # Decoder
    decoder_inputs = layers.Input(shape=(None,), name="decoder_tokens")
    decoder_emb = layers.Embedding(vocab_size, embedding_dim, mask_zero=True)(
        decoder_inputs
    )
    attention = layers.AdditiveAttention(name="attention")(
        [decoder_emb, encoder_outputs]
    )
    decoder_concat = layers.Concatenate()([decoder_emb, attention])
    decoder_lstm = layers.LSTM(lstm_units, return_sequences=True)
    decoder_outputs = decoder_lstm(decoder_concat, initial_state=[state_h, state_c])

    outputs = layers.TimeDistributed(
        layers.Dense(vocab_size, activation="softmax"), name="token_probs"
    )(decoder_outputs)

    return Model([encoder_inputs, decoder_inputs], outputs, name="seq2seq_attention")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocab-size", type=int, default=5000)
    parser.add_argument("--summary", action="store_true", help="Print model summary")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model = build_seq2seq(vocab_size=args.vocab_size)
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    if args.summary:
        model.summary()


if __name__ == "__main__":
    main()


