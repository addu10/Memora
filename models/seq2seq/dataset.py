"""
Seq2Seq Dataset Handler
Dataset handling including sample data generation for prompt generation model.
"""

import os
import csv
import json
import random
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
import tensorflow as tf

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import seq2seq_config, data_config
from utils import Vocabulary, train_val_test_split


# ============================================================================
# Sample Data Templates (Kerala-focused)
# ============================================================================

SAMPLE_EVENTS = data_config.event_categories
SAMPLE_LOCATIONS = data_config.location_categories

SAMPLE_PEOPLE = [
    "Amma", "Achan", "Ammachi", "Appuppan", "Chechi", "Chetan",
    "Priya", "Arun", "Lakshmi", "Suresh", "Meera", "Rahul",
    "Uncle", "Aunty", "Cousin", "Friend", "Neighbor"
]

# Question templates for each event type
QUESTION_TEMPLATES = {
    "Onam": [
        "Who prepared the sadhya for this Onam celebration?",
        "What was your favorite dish at the Onam feast?",
        "Who made the pookalam that year?",
        "Which family members visited for Onam?",
        "What games did you play during Onam?"
    ],
    "Vishu": [
        "What items were in the Vishu kani that year?",
        "Who gave you Vishu kaineettam?",
        "What did you wear for Vishu?",
        "Which temple did you visit for Vishu?",
        "What special dishes were prepared?"
    ],
    "Christmas": [
        "Who decorated the Christmas tree?",
        "What gifts did you receive that Christmas?",
        "Which church did you attend for midnight mass?",
        "Who visited you during Christmas?",
        "What special food was prepared?"
    ],
    "Wedding": [
        "Whose wedding was this?",
        "What did you wear to the wedding?",
        "Who else attended from the family?",
        "Where was the wedding held?",
        "What was the most memorable moment?"
    ],
    "Birthday": [
        "Whose birthday was being celebrated?",
        "What cake did you have?",
        "Who came to the birthday party?",
        "What gifts were given?",
        "What was the birthday person's wish that year?"
    ],
    "Temple-Visit": [
        "Which temple did you visit?",
        "Who went with you to the temple?",
        "What did you pray for that day?",
        "What prasadam did you receive?",
        "Was there a special festival at the temple?"
    ],
    "Church-Visit": [
        "Which church did you visit?",
        "Who accompanied you?",
        "Was there a special service that day?",
        "What was the occasion for the visit?",
        "Who did you meet at the church?"
    ],
    "Family-Gathering": [
        "What was the occasion for this gathering?",
        "Who all came to the gathering?",
        "Where was this gathering held?",
        "What food was prepared?",
        "What did you talk about with the family?"
    ],
    "Travel": [
        "Where did you travel to?",
        "Who traveled with you?",
        "How did you reach there?",
        "What was the most beautiful thing you saw?",
        "What local food did you try?"
    ],
    "Daily-Life": [
        "What were you doing in this photo?",
        "Who was with you that day?",
        "Where was this photo taken?",
        "What time of day was this?",
        "What were you thinking about?"
    ]
}

# Default questions for events not in templates
DEFAULT_QUESTIONS = [
    "Who was with you in this moment?",
    "Where was this photo taken?",
    "What was the occasion?",
    "How were you feeling that day?",
    "What happened before this photo was taken?"
]


def generate_sample_dataset(
    num_samples: int = 500,
    output_path: str = None
) -> List[Dict]:
    """Generate synthetic training data for Seq2Seq model."""
    
    samples = []
    
    for i in range(num_samples):
        # Random metadata
        event = random.choice(SAMPLE_EVENTS)
        location = random.choice(SAMPLE_LOCATIONS)
        num_people = random.randint(1, 4)
        people = random.sample(SAMPLE_PEOPLE, min(num_people, len(SAMPLE_PEOPLE)))
        
        # Generate date in last 5 years (recent memories focus)
        year = random.randint(2020, 2024)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        date = f"{year}-{month:02d}-{day:02d}"
        
        # Create metadata string
        metadata = f"date:{date} event:{event} location:{location} people:{','.join(people)}"
        
        # Get questions for this event
        questions = QUESTION_TEMPLATES.get(event, DEFAULT_QUESTIONS)
        num_questions = random.randint(2, min(4, len(questions)))
        selected_questions = random.sample(questions, num_questions)
        
        # Personalize questions with people names
        personalized = []
        for q in selected_questions:
            if people and random.random() > 0.5:
                person = random.choice(people)
                if "who" in q.lower() or "family" in q.lower():
                    q = q.replace("the family", person)
            personalized.append(q)
        
        samples.append({
            "id": i,
            "date": date,
            "event": event,
            "location": location,
            "people": people,
            "metadata": metadata,
            "questions": personalized
        })
    
    # Save to file if path provided
    if output_path:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["id", "metadata", "question1", "question2", "question3", "question4"])
            for s in samples:
                questions = s["questions"] + [""] * (4 - len(s["questions"]))
                writer.writerow([s["id"], s["metadata"]] + questions[:4])
        
        print(f"✓ Generated {num_samples} samples saved to {output_path}")
    
    return samples


class Seq2SeqDataset:
    """Dataset class for Seq2Seq prompt generation."""
    
    def __init__(self, config=None):
        self.config = config or seq2seq_config
        self.vocab = Vocabulary(special_tokens=[
            self.config.pad_token,
            self.config.unk_token,
            self.config.start_token,
            self.config.end_token
        ])
        self.samples = []
    
    def load_from_csv(self, csv_path: str) -> None:
        """Load training data from CSV file."""
        self.samples = []
        
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                questions = [row.get(f"question{i}", "") for i in range(1, 5)]
                questions = [q for q in questions if q]
                
                self.samples.append({
                    "metadata": row["metadata"],
                    "questions": questions
                })
        
        print(f"✓ Loaded {len(self.samples)} samples from {csv_path}")
    
    def load_from_samples(self, samples: List[Dict]) -> None:
        """Load training data from sample list."""
        self.samples = samples
        print(f"✓ Loaded {len(self.samples)} samples")
    
    def build_vocabulary(self, min_freq: int = 1) -> None:
        """Build vocabulary from loaded samples."""
        all_texts = []
        
        for sample in self.samples:
            all_texts.append(sample["metadata"])
            all_texts.extend(sample["questions"])
        
        self.vocab.build_from_texts(all_texts, min_freq=min_freq)
        print(f"✓ Built vocabulary with {len(self.vocab)} tokens")
    
    def save_vocabulary(self, path: str = None) -> None:
        """Save vocabulary to file."""
        path = path or self.config.vocab_path
        self.vocab.save(path)
        print(f"✓ Vocabulary saved to {path}")
    
    def load_vocabulary(self, path: str = None) -> None:
        """Load vocabulary from file."""
        path = path or self.config.vocab_path
        self.vocab = Vocabulary.load(path)
        print(f"✓ Vocabulary loaded from {path}")
    
    def prepare_training_data(
        self,
        train_ratio: float = 0.8,
        val_ratio: float = 0.1
    ) -> Tuple[tuple, tuple, tuple]:
        """Prepare data for training."""
        
        # Split samples
        train_samples, val_samples, test_samples = train_val_test_split(
            self.samples,
            train_ratio=train_ratio,
            val_ratio=val_ratio
        )
        
        def process_samples(samples):
            encoder_inputs = []
            decoder_inputs = []
            decoder_targets = []
            
            for sample in samples:
                metadata = sample["metadata"]
                
                for question in sample["questions"]:
                    # Encode metadata
                    enc_seq = self.vocab.encode(
                        metadata,
                        max_length=self.config.max_metadata_length
                    )
                    
                    # Encode question with start/end tokens
                    question_with_tokens = f"{self.config.start_token} {question} {self.config.end_token}"
                    dec_seq = self.vocab.encode(
                        question_with_tokens,
                        max_length=self.config.max_question_length + 2
                    )
                    
                    encoder_inputs.append(enc_seq)
                    decoder_inputs.append(dec_seq[:-1])  # Remove last token for input
                    decoder_targets.append(dec_seq[1:])  # Remove first token for target
            
            return (
                np.array(encoder_inputs),
                np.array(decoder_inputs),
                np.array(decoder_targets)
            )
        
        train_data = process_samples(train_samples)
        val_data = process_samples(val_samples)
        test_data = process_samples(test_samples)
        
        print(f"✓ Training samples: {len(train_data[0])}")
        print(f"✓ Validation samples: {len(val_data[0])}")
        print(f"✓ Test samples: {len(test_data[0])}")
        
        return train_data, val_data, test_data
    
    def create_tf_dataset(
        self,
        encoder_inputs: np.ndarray,
        decoder_inputs: np.ndarray,
        decoder_targets: np.ndarray,
        batch_size: int = None,
        shuffle: bool = True
    ) -> tf.data.Dataset:
        """Create a TensorFlow dataset for training."""
        batch_size = batch_size or self.config.batch_size
        
        dataset = tf.data.Dataset.from_tensor_slices((
            {"metadata_tokens": encoder_inputs, "decoder_tokens": decoder_inputs},
            decoder_targets
        ))
        
        if shuffle:
            dataset = dataset.shuffle(buffer_size=len(encoder_inputs))
        
        dataset = dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)
        
        return dataset


# ============================================================================
# Main
# ============================================================================

if __name__ == "__main__":
    # Generate sample data
    samples = generate_sample_dataset(
        num_samples=500,
        output_path=str(Path(data_config.sample_data_dir) / "prompt_training_data.csv")
    )
    
    # Test dataset loading
    dataset = Seq2SeqDataset()
    dataset.load_from_samples(samples)
    dataset.build_vocabulary()
    
    # Prepare training data
    train_data, val_data, test_data = dataset.prepare_training_data()
    
    print("\n✓ Dataset ready for training!")
    print(f"  Encoder input shape: {train_data[0].shape}")
    print(f"  Decoder input shape: {train_data[1].shape}")
    print(f"  Decoder target shape: {train_data[2].shape}")
