from PIL import Image
import glob

for file in glob.glob("*.png"):
    img = Image.open(file)
    img.convert("RGB").save(file.replace(".png", ".jpg"), "JPEG", quality=90)
    print(f"Converted: {file}")
