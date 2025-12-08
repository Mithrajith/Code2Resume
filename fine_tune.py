import torch
from unsloth import FastLanguageModel
from datasets import load_dataset
from trl import SFTTrainer
from transformers import TrainingArguments
import os
import json
import glob

# --- Configuration ---
# RTX 2050 has 4GB VRAM. We MUST use 4-bit quantization and small batch sizes.
# We prefer Llama-3.2-3B for this hardware, but user requested Llama-3.1.
# We will try Llama-3.1-8B with extreme optimization.
max_seq_length = 2048 
dtype = None # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True 

model_name = "unsloth/Meta-Llama-3.1-8B-bnb-4bit"

# --- 1. Load Model ---
print(f"Loading model: {model_name}...")
try:
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = model_name,
        max_seq_length = max_seq_length,
        dtype = dtype,
        load_in_4bit = load_in_4bit,
    )
except RuntimeError as e:
    if "CUDA out of memory" in str(e):
        print("\n\n⚠️  OUT OF MEMORY ERROR DETECTED ⚠️")
        print("Your RTX 2050 (4GB VRAM) is struggling with Llama-3.1-8B.")
        print("Switching to Llama-3.2-3B which is much faster and fits your GPU.\n")
        model_name = "unsloth/Llama-3.2-3B-Instruct-bnb-4bit"
        model, tokenizer = FastLanguageModel.from_pretrained(
            model_name = model_name,
            max_seq_length = max_seq_length,
            dtype = dtype,
            load_in_4bit = load_in_4bit,
        )
    else:
        raise e

# --- 2. Add LoRA Adapters ---
model = FastLanguageModel.get_peft_model(
    model,
    r = 16, # Choose any number > 0 ! Suggested 8, 16, 32, 64, 128
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

# --- 3. Load Data ---
# Find all fine_tune_data.jsonl files in Git_details
data_files = glob.glob("Git_details/*/fine_tune_data.jsonl")
if not data_files:
    print("❌ No training data found! Please run the app and analyze some GitHub profiles first.")
    exit(1)

print(f"Found {len(data_files)} dataset files. Loading...")

# Combine all files
all_data = []
for fpath in data_files:
    with open(fpath, 'r') as f:
        for line in f:
            all_data.append(json.loads(line))

# Create a temporary combined file
with open("combined_train.jsonl", "w") as f:
    for entry in all_data:
        f.write(json.dumps(entry) + "\n")

dataset = load_dataset("json", data_files="combined_train.jsonl", split="train")

# Format prompt
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    inputs       = examples["input"]
    outputs      = examples["output"]
    texts = []
    for instruction, input, output in zip(instructions, inputs, outputs):
        text = alpaca_prompt.format(instruction, input, output) + tokenizer.eos_token
        texts.append(text)
    return { "text" : texts, }

dataset = dataset.map(formatting_prompts_func, batched = True)

# --- 4. Train ---
print("Starting training...")
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    dataset_num_proc = 2,
    packing = False, # Can make training 5x faster for short sequences.
    args = TrainingArguments(
        per_device_train_batch_size = 1, # Keep extremely low for 4GB VRAM
        gradient_accumulation_steps = 8, # Increase to simulate larger batch size
        warmup_steps = 5,
        max_steps = 60, # Adjust based on data size
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

trainer.train()

# --- 5. Save ---
print("Saving model...")
model.save_pretrained("lora_model") # Local saving
tokenizer.save_pretrained("lora_model")

print("✅ Fine-tuning complete! Model saved to 'lora_model'.")
print("To use this model with Ollama, you need to convert it to GGUF format.")
