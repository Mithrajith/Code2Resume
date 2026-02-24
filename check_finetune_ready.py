#!/usr/bin/env python3
"""
Check if system is ready for fine-tuning
"""
import sys
import os

def check_item(name, check_func, fix_cmd=None):
    """Check a requirement and print status"""
    try:
        result = check_func()
        if result:
            print(f"✅ {name}")
            return True
        else:
            print(f"❌ {name}")
            if fix_cmd:
                print(f"   Fix: {fix_cmd}")
            return False
    except Exception as e:
        print(f"❌ {name}: {e}")
        if fix_cmd:
            print(f"   Fix: {fix_cmd}")
        return False

print("="*60)
print("🔍 Fine-tuning Readiness Check")
print("="*60)
print()

checks_passed = []

# Check 1: CUDA availability
def check_cuda():
    import torch
    return torch.cuda.is_available()

checks_passed.append(check_item(
    "CUDA GPU Available",
    check_cuda,
    "Install NVIDIA drivers and CUDA toolkit"
))

# Check 2: PyTorch
def check_pytorch():
    import torch
    return torch.__version__
    
checks_passed.append(check_item(
    "PyTorch Installed",
    check_pytorch,
    "pip install torch"
))

# Check 3: Training data
def check_data():
    import glob
    files = glob.glob("Git_details/*/fine_tune_data.jsonl")
    if files:
        total_samples = 0
        for f in files:
            total_samples += sum(1 for _ in open(f))
        print(f"   Found {len(files)} files with {total_samples} samples")
        return True
    return False

checks_passed.append(check_item(
    "Training Data Available",
    check_data,
    "Analyze GitHub profiles in the web app first"
))

# Check 4: Unsloth
def check_unsloth():
    import unsloth
    return True

checks_passed.append(check_item(
    "Unsloth Installed",
    check_unsloth,
    "./install_finetune_deps.sh"
))

# Check 5: TRL
def check_trl():
    import trl
    return True

checks_passed.append(check_item(
    "TRL Installed",
    check_trl,
    "./install_finetune_deps.sh"
))

# Check 6: PEFT
def check_peft():
    import peft
    return True

checks_passed.append(check_item(
    "PEFT Installed",
    check_peft,
    "./install_finetune_deps.sh"
))

# Check 7: GPU VRAM
def check_vram():
    import torch
    if torch.cuda.is_available():
        vram_gb = torch.cuda.get_device_properties(0).total_memory / 1e9
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {vram_gb:.1f}GB")
        return vram_gb >= 3.0
    return False

checks_passed.append(check_item(
    "Sufficient VRAM (≥3GB)",
    check_vram,
    "Close other GPU applications or use a larger GPU"
))

print()
print("="*60)
if all(checks_passed):
    print("✅ All checks passed! Ready to fine-tune.")
    print()
    print("Run: ./run_finetune.sh")
else:
    print("❌ Some checks failed. Please fix the issues above.")
    print()
    print("Common fixes:")
    print("  1. Install dependencies: ./install_finetune_deps.sh")
    print("  2. Generate training data: Use the web app to analyze GitHub")
    sys.exit(1)
print("="*60)
