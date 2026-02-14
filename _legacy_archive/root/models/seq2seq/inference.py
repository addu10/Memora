"""
Seq2Seq Prompt Generation Inference
Utilities for generating prompts from photo metadata.
"""

import os
import sys
import json
import numpy as np
from pathlib import Path
from typing import List, Optional

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import tensorflow as tf

from config import seq2seq_config
from utils import Vocabulary


class PromptGenerator:
    """
    Generate contextual prompts for therapy sessions using trained Seq2Seq model.
    """
    
    def __init__(self, config=None, model_path: str = None, vocab_path: str = None):
        """
        Initialize the prompt generator.
        
        Args:
            config: Model configuration
            model_path: Path to trained model (Keras or TFLite)
            vocab_path: Path to vocabulary JSON
        """
        self.config = config or seq2seq_config
        self.model = None
        self.tflite_interpreter = None
        self.vocab = None
        
        # Load vocabulary
        vocab_path = vocab_path or self.config.vocab_path
        if Path(vocab_path).exists():
            self.vocab = Vocabulary.load(vocab_path)
            print(f"✓ Loaded vocabulary with {len(self.vocab)} tokens")
        else:
            print(f"⚠ Vocabulary not found at {vocab_path}")
        
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
            # Load TFLite model
            self.tflite_interpreter = tf.lite.Interpreter(model_path=str(model_path))
            self.tflite_interpreter.allocate_tensors()
            print(f"✓ Loaded TFLite model from {model_path}")
        else:
            # Load Keras model
            self.model = tf.keras.models.load_model(str(model_path))
            print(f"✓ Loaded Keras model from {model_path}")
    
    def load_from_checkpoint(self, checkpoint_dir: str = None) -> None:
        """Load model from checkpoint directory."""
        checkpoint_dir = checkpoint_dir or self.config.model_checkpoint_path
        checkpoint_dir = Path(checkpoint_dir)
        
        # Try loading Keras model first
        keras_path = checkpoint_dir / "final_model.keras"
        if keras_path.exists():
            self._load_model(str(keras_path))
            return
        
        # Try TFLite model
        tflite_path = Path(self.config.tflite_export_path)
        if tflite_path.exists():
            self._load_model(str(tflite_path))
            return
        
        print(f"⚠ No trained model found in {checkpoint_dir}")
    
    def generate_prompts(
        self,
        metadata: dict = None,
        metadata_str: str = None,
        num_prompts: int = 3,
        temperature: float = 0.7
    ) -> List[str]:
        """
        Generate therapy prompts from photo metadata.
        
        Args:
            metadata: Dictionary with keys: date, event, location, people
            metadata_str: Pre-formatted metadata string
            num_prompts: Number of prompts to generate
            temperature: Sampling temperature (higher = more diverse)
        
        Returns:
            List of generated prompt strings
        """
        if not self.vocab:
            return self._fallback_prompts(metadata)
        
        # Format metadata
        if metadata_str is None:
            if metadata is None:
                raise ValueError("Either metadata dict or metadata_str required")
            
            people_str = ",".join(metadata.get("people", []))
            metadata_str = (
                f"date:{metadata.get('date', 'unknown')} "
                f"event:{metadata.get('event', 'unknown')} "
                f"location:{metadata.get('location', 'unknown')} "
                f"people:{people_str}"
            )
        
        # Encode metadata
        encoder_input = self.vocab.encode(
            metadata_str,
            max_length=self.config.max_metadata_length
        )
        encoder_input = np.array([encoder_input])
        
        # Generate multiple prompts
        prompts = []
        for _ in range(num_prompts):
            prompt = self._generate_single_prompt(encoder_input, temperature)
            if prompt and prompt not in prompts:
                prompts.append(prompt)
        
        # If we couldn't generate enough, use fallback
        if len(prompts) < num_prompts:
            fallback = self._fallback_prompts(metadata)
            for p in fallback:
                if p not in prompts:
                    prompts.append(p)
                if len(prompts) >= num_prompts:
                    break
        
        return prompts[:num_prompts]
    
    def _generate_single_prompt(
        self,
        encoder_input: np.ndarray,
        temperature: float = 0.7
    ) -> Optional[str]:
        """Generate a single prompt using the model."""
        if self.model is None and self.tflite_interpreter is None:
            return None
        
        # Start with start token
        start_idx = self.vocab.word2idx.get(self.config.start_token, 2)
        end_idx = self.vocab.word2idx.get(self.config.end_token, 3)
        
        decoder_input = np.array([[start_idx]])
        generated_tokens = []
        
        for _ in range(self.config.max_question_length):
            # Get predictions
            if self.model:
                predictions = self.model.predict(
                    [encoder_input, decoder_input],
                    verbose=0
                )
            else:
                # TFLite inference
                predictions = self._tflite_predict(encoder_input, decoder_input)
            
            # Get last token predictions
            last_prediction = predictions[0, -1, :]
            
            # Apply temperature
            if temperature > 0:
                last_prediction = np.log(last_prediction + 1e-9) / temperature
                exp_preds = np.exp(last_prediction)
                last_prediction = exp_preds / np.sum(exp_preds)
            
            # Sample next token
            next_token = np.random.choice(len(last_prediction), p=last_prediction)
            
            if next_token == end_idx:
                break
            
            generated_tokens.append(next_token)
            
            # Update decoder input
            decoder_input = np.concatenate([
                decoder_input,
                np.array([[next_token]])
            ], axis=1)
        
        # Decode tokens to text
        prompt = self.vocab.decode(generated_tokens, skip_special=True)
        
        # Clean up and capitalize
        prompt = prompt.strip().capitalize()
        if prompt and not prompt.endswith("?"):
            prompt += "?"
        
        return prompt
    
    def _tflite_predict(
        self,
        encoder_input: np.ndarray,
        decoder_input: np.ndarray
    ) -> np.ndarray:
        """Run inference using TFLite interpreter."""
        input_details = self.tflite_interpreter.get_input_details()
        output_details = self.tflite_interpreter.get_output_details()
        
        # Set inputs
        self.tflite_interpreter.set_tensor(
            input_details[0]["index"],
            encoder_input.astype(np.float32)
        )
        self.tflite_interpreter.set_tensor(
            input_details[1]["index"],
            decoder_input.astype(np.float32)
        )
        
        # Run inference
        self.tflite_interpreter.invoke()
        
        # Get output
        output = self.tflite_interpreter.get_tensor(output_details[0]["index"])
        return output
    
    def _fallback_prompts(self, metadata: dict = None) -> List[str]:
        """Generate fallback prompts when model is not available."""
        if metadata is None:
            return [
                "Who was with you in this moment?",
                "Where was this photo taken?",
                "What was happening that day?"
            ]
        
        event = metadata.get("event", "")
        people = metadata.get("people", [])
        location = metadata.get("location", "")
        
        prompts = []
        
        if people:
            prompts.append(f"What was {people[0] if people else 'everyone'} doing in this photo?")
        
        if event:
            prompts.append(f"What do you remember about this {event.replace('-', ' ').lower()}?")
        
        if location:
            prompts.append(f"What was special about visiting {location.replace('-', ' ').lower()}?")
        
        prompts.extend([
            "How were you feeling that day?",
            "What happened after this photo was taken?",
            "Who else was there that you remember?"
        ])
        
        return prompts[:5]


# ============================================================================
# Main / Demo
# ============================================================================

if __name__ == "__main__":
    # Initialize generator
    generator = PromptGenerator()
    generator.load_from_checkpoint()
    
    # Test with sample metadata
    test_metadata = {
        "date": "2023-08-15",
        "event": "Onam",
        "location": "Home",
        "people": ["Amma", "Achan", "Priya"]
    }
    
    print("\n🧠 Generating prompts for:")
    print(f"   Event: {test_metadata['event']}")
    print(f"   Location: {test_metadata['location']}")
    print(f"   People: {', '.join(test_metadata['people'])}")
    
    prompts = generator.generate_prompts(metadata=test_metadata, num_prompts=5)
    
    print("\n📝 Generated Prompts:")
    for i, prompt in enumerate(prompts, 1):
        print(f"   {i}. {prompt}")
