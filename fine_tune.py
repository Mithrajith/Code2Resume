import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import os
import json
import glob

# Free up GPU memory before starting
torch.cuda.empty_cache()
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

# --- Configuration ---
# RTX 2050 has 4GB VRAM. Using Qwen2.5-Coder-3B which is optimized for code tasks
# and fits well within the VRAM constraints.
max_seq_length = 1024  # Reduced from 2048 to save memory
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True 

# Use Qwen2.5-Coder-3B-Instruct as base model (optimized for code understanding)
model_name = "unsloth/Qwen2.5-Coder-3B-Instruct-bnb-4bit"

print("="*60)
print("🚀 Fine-tuning Qwen2.5-Coder-3B for Resume Generation")
print("="*60)

# --- 1. Load Model ---
print(f"\n📦 Loading base model: {model_name}...")
try:
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = model_name,
        max_seq_length = max_seq_length,
        dtype = dtype,
        load_in_4bit = load_in_4bit,
    )
    print("✅ Model loaded successfully!")
except RuntimeError as e:
    if "CUDA out of memory" in str(e):
        print("\n⚠️  OUT OF MEMORY ERROR")
        print("Your GPU doesn't have enough VRAM. Try closing other applications.")
        exit(1)
    else:
        raise e

# --- 2. Add LoRA Adapters ---
print("\n🔧 Adding LoRA adapters...")
model = FastLanguageModel.get_peft_model(
    model,
    r = 8, # Reduced from 16 to save memory
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj",
                      "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0, # Supports any, but = 0 is optimized
    bias = "none",    # Supports any, but = "none" is optimized
    use_gradient_checkpointing = "unsloth", # True or "unsloth" for very long context
    random_state = 3407,
    use_rslora = False,  # We support rank stabilized LoRA
    loftq_config = None, # And LoftQ
)
print("✅ LoRA adapters added")

# --- 3. Load Data ---
# Find all fine_tune_data.jsonl files in Git_details
print("\n📊 Loading training data...")
data_files = glob.glob("Git_details/*/fine_tune_data.jsonl")
if not data_files:
    print("❌ No training data found! Please run the app and analyze some GitHub profiles first.")
    exit(1)

print(f"Found {len(data_files)} dataset files:")
for f in data_files:
    line_count = sum(1 for _ in open(f))
    print(f"  - {f}: {line_count} samples")

# Combine all files
all_data = []
for fpath in data_files:
    with open(fpath, 'r') as f:
        for line in f:
            all_data.append(json.loads(line))

print(f"✅ Total training samples: {len(all_data)}")

# Create a temporary combined file
with open("combined_train.jsonl", "w") as f:
    for entry in all_data:
        f.write(json.dumps(entry) + "\n")

dataset = load_dataset("json", data_files="combined_train.jsonl", split="train")

# Format prompt (Qwen2.5 uses ChatML format, but Alpaca works too)
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

EOS_TOKEN = tokenizer.eos_token  # Define EOS token

def formatting_prompts_func(examples):
    """Format batch of examples into prompt format"""
    instructions = examples["instruction"]
    inputs = examples["input"]  
    outputs = examples["output"]
    
    texts = []
    for instruction, input_text, output in zip(instructions, inputs, outputs):
        text = alpaca_prompt.format(instruction, input_text, output) + EOS_TOKEN
        texts.append(text)
    return {"text": texts}  # Return dict with 'text' key

# Apply formatting to dataset
print("\n📝 Formatting dataset...")
dataset = dataset.map(formatting_prompts_func, batched=True, remove_columns=["instruction", "input", "output"])
print(f"✅ Dataset formatted: {len(dataset)} samples")

# --- 4. Train ---
print("\n🏋️  Starting training...")
print(f"  - Batch size: 1 (with 8x gradient accumulation)")
print(f"  - Training steps: 60")
print(f"  - Learning rate: 2e-4")
print(f"  - Optimizer: adamw_8bit")
print()


trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",  # Use pre-formatted text field
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False,
    args = TrainingArguments(
        per_device_train_batch_size = 1,
        gradient_accumulation_steps = 8,
        warmup_steps = 5,
        max_steps = 60,
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
        report_to = "none",
    ),
)

trainer.train()

# --- 5. Save ---
print("\n💾 Saving fine-tuned model...")
model.save_pretrained("lora_model")
tokenizer.save_pretrained("lora_model")

print("\n" + "="*60)
print("✅ Fine-tuning complete!")
print("="*60)
print("📁 Model saved to: ./lora_model")
print("\n📝 Next steps:")
print("  1. Merge LoRA weights with base model")
print("  2. Convert to GGUF format for Ollama")
print("  3. Create Modelfile and import to Ollama")
print("\nFor GGUF conversion, see: https://github.com/ggerganov/llama.cpp")
print("="*60)

