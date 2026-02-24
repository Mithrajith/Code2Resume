import sys
print(f"Python executable: {sys.executable}")
try:
    import torch
    print(f"✅ Torch installed: {torch.__version__}")
    print(f"   CUDA available: {torch.cuda.is_available()}")
except ImportError:
    print("❌ Torch NOT installed")

try:
    import torchvision
    print(f"✅ Torchvision installed: {torchvision.__version__}")
except ImportError as e:
    print(f"❌ Torchvision NOT installed: {e}")

try:
    import unsloth
    print("✅ Unsloth installed")
except ImportError as e:
    print(f"❌ Unsloth NOT installed: {e}")
