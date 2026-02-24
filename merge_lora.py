#!/usr/bin/env python3
"""
Merge LoRA weights with base model for deployment
"""
import torch
from unsloth import FastLanguageModel
import os

print("="*60)
print("🔄 Merging LoRA weights with base model")
print("="*60)

# Check if LoRA model exists
if not os.path.exists("lora_model"):
    print("❌ Error: lora_model directory not found!")
    print("Please run fine-tuning first: ./run_finetune.sh")
    exit(1)

max_seq_length = 2048
dtype = None
load_in_4bit = True

print("\n📦 Loading fine-tuned model...")
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "lora_model",
    max_seq_length = max_seq_length,
    dtype = dtype,
    load_in_4bit = load_in_4bit,
)

print("\n🔗 Merging LoRA adapters...")
# Merge to 16bit for better compatibility
model = FastLanguageModel.for_inference(model)

print("\n💾 Saving merged model...")
output_dir = "merged_model"
model.save_pretrained_merged(output_dir, tokenizer, save_method = "merged_16bit")

print("\n" + "="*60)
print("✅ Model merged successfully!")
print("="*60)
print(f"📁 Merged model saved to: ./{output_dir}")
print("\n📝 Next steps:")
print("  1. Convert to GGUF format using llama.cpp")
print("  2. Create Modelfile for Ollama")
print("  3. Import to Ollama: ollama create resume-model -f Modelfile")
print("="*60)
