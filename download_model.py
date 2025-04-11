import os
import requests
from tqdm import tqdm

# Create models/ directory if it doesn't exist
os.makedirs("models", exist_ok=True)

# URL to the GGUF model file on Hugging Face
url = "https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.1-GGUF/resolve/main/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

# Path to save the file
output_path = "models/mistral-7b-instruct-v0.1.Q4_K_M.gguf"

# Streaming download with progress bar
response = requests.get(url, stream=True)
total_size = int(response.headers.get("content-length", 0))
block_size = 1024 * 1024  # 1 MB

print(f"Downloading to: {output_path}")
with open(output_path, "wb") as file, tqdm(
    desc="Downloading",
    total=total_size,
    unit="iB",
    unit_scale=True,
    unit_divisor=1024,
) as bar:
    for data in response.iter_content(block_size):
        file.write(data)
        bar.update(len(data))

print("✅ Download complete!")
