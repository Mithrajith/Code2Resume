#!/usr/bin/env python3
"""Test the formatting function"""

from datasets import load_dataset
import sys
sys.path.insert(0, '/home/zypher/PROJECT/Code2Resume/env/lib/python3.12/site-packages')

# Load a small sample
dataset = load_dataset("json", data_files="Git_details/zypher/fine_tune_data.jsonl", split="train[:5]")

print("Dataset structure:")
print(dataset)
print("\nFirst example:")
print(dataset[0])
print("\nKeys:", dataset[0].keys())

# Test formatting function
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

def formatting_prompts_func(examples):
    """Format batch of examples"""
    print(f"\nFormatting function called with type: {type(examples)}")
    print(f"Keys: {examples.keys() if hasattr(examples, 'keys') else 'N/A'}")
    
    instructions = examples["instruction"]
    inputs = examples["input"]
    outputs = examples["output"]
    
    print(f"Instructions type: {type(instructions)}, len: {len(instructions) if isinstance(instructions, list) else 'N/A'}")
    
    texts = []
    for instruction, input_text, output in zip(instructions, inputs, outputs):
        text = alpaca_prompt.format(instruction, input_text, output) + "</s>"
        texts.append(text)
    
    print(f"Returning {len(texts)} formatted texts")
    return texts

# Test with batch
print("\n" + "="*60)
print("Testing formatting function:")
print("="*60)
batch = {
    "instruction": dataset["instruction"][:2],
    "input": dataset["input"][:2],
    "output": dataset["output"][:2]
}
result = formatting_prompts_func(batch)
print(f"\nResult: {len(result)} texts")
print(f"First text preview: {result[0][:100]}...")
