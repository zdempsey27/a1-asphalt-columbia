"""
Asphalt Site Image Generator
=============================
Generates AI images for asphalt / paving websites using the Gemini API.
Saves images with correct naming conventions directly to your project's public/images/ folder.
Also generates logos, branded truck wraps, and all favicon sizes.

USAGE:
  Full run (all images + logo + truck + favicons):
    python generate-images.py

  Favicon only (free, no API key needed):
    python generate-images.py --favicons-only

SETUP:
1. Get an API key at https://aistudio.google.com/apikey
2. Enable billing (image generation requires a paid plan, ~$0.04/image)
3. Install dependencies:  pip install google-genai Pillow
4. Update the CONFIG section below
5. Run:  python generate-images.py

PER-SITE EDITS (Claude fills these in the research chat):
  API_KEY, OUTPUT_DIR, CITY, STATE, BUSINESS_NAME, REGION, SITE_FOCUS,
  the SETTINGS pools (tailor to the city), and SERVICES (must match config.js slugs).
"""

import os
import sys
import time
import base64
from pathlib import Path

from PIL import Image as PILImage

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

# ============================================================================
# CONFIG — EDIT THIS SECTION PER SITE
# ============================================================================

# Your Gemini API key — paste your existing key here.
API_KEY = "AIzaSyADtW9hJl4ocW53-2f1hEHB4D4G7mupwAo"

# Where to save images (your project's public/images folder)
OUTPUT_DIR = r"C:\Users\Owner\Documents\Three Oaks Digital\Website Creation\Asphalt Sites\a1-asphalt-columbia\public\images"

# Location context for prompts
CITY = "Columbia"
STATE = "South Carolina"
BUSINESS_NAME = "A1 Asphalt Columbia"
REGION = "the Midlands"

# Site Focus: "residential" | "commercial" | "mixed"
SITE_FOCUS = "mixed"

RESIDENTIAL_SETTINGS = [
    "a brick ranch home with a carport and mature loblolly pines, a Bermuda-grass lawn, established Midlands neighborhood, bright humid-summer sunlight",
    "a two-story home with vinyl siding and a two-car garage in a Northeast Columbia subdivision, young hardwoods and crepe myrtles, warm golden-hour light",
    "a historic one-story bungalow on a tree-lined street in an older Columbia neighborhood like Shandon, live oaks and azaleas, soft late-afternoon sun",
    "a newer home in a Lexington-area subdivision with fresh landscaping and a longer driveway, gently rolling terrain with pines, bright blue sky with cumulus clouds",
    "an upscale brick home with manicured landscaping and tall pines in a Forest Acres-style neighborhood, wide frontage, warm light with long soft shadows",
]

COMMERCIAL_SETTINGS = [
    "a strip retail plaza with storefronts along a busy Columbia commercial corridor like Two Notch Road, light poles and curbed islands, clear humid-daytime light",
    "a large Southern church campus with a wide parking lot and drive aisles, mature pines around the perimeter, soft golden-hour light",
    "a multi-tenant office park near downtown Columbia with marked entrances and sidewalks, landscaped islands, warm late-morning light",
    "an apartment-complex parking area with carports and landscaped medians in a Midlands suburb, bright overcast sky",
    "a medical or professional office off Harbison Boulevard with accessible parking near the entrance, tidy landscaping, clean daytime light",
]

# Single setting used as the branded-truck background
SETTING = (RESIDENTIAL_SETTINGS or COMMERCIAL_SETTINGS)[0]


def get_setting(index, context="res"):
    """Pick a setting from the pool matching the service context (res/com)."""
    pool = COMMERCIAL_SETTINGS if context == "com" else RESIDENTIAL_SETTINGS
    if not pool:
        pool = RESIDENTIAL_SETTINGS or COMMERCIAL_SETTINGS
    return pool[index % len(pool)]


# Services — MUST match config.js slugs. (slug, display_name, count, context)
SERVICES = [
    ("asphalt-paving",          "freshly paved asphalt driveway with smooth black surface and crisp clean edges", 3, "res"),
    ("asphalt-driveway-paving", "newly installed asphalt driveway leading up to a home garage", 3, "res"),
    ("parking-lot-paving",      "freshly paved commercial asphalt parking lot with a smooth uniform black surface", 3, "com"),
    ("asphalt-resurfacing",     "freshly resurfaced asphalt overlay on a driveway, deep black and uniform", 3, "res"),
    ("sealcoating",             "freshly sealcoated asphalt driveway with a deep matte-black finish", 3, "res"),
    ("asphalt-repair",          "repaired section of asphalt pavement blended flush into the existing surface", 3, "res"),
    ("crack-filling",           "asphalt surface with professionally filled and sealed cracks, clean black lines", 3, "res"),
    ("parking-lot-striping",    "freshly striped asphalt parking lot with crisp white and yellow line markings and accessible stalls", 3, "com"),
    ("pothole-repair",          "asphalt pothole patched flush and smooth with the surrounding pavement", 3, "com"),
    ("pavement-maintenance",    "well-maintained commercial asphalt lot, freshly sealed and re-striped", 3, "com"),
]

# Extra images. Crew prefix is "paving-crew" to match config.js.
EXTRA_IMAGES = [
    ("paving-crew", "professional asphalt paving crew laying hot asphalt with a paver machine and a steel drum roller", 4, "res"),
    ("hero",        "an attractive Columbia property with a freshly paved, smooth black asphalt surface in the foreground", 1, "res"),
    ("form-image",  "an asphalt paving contractor shaking hands with a property owner in front of a freshly paved driveway", 1, "res"),
]

# Rate limit delay (seconds between API requests)
RATE_LIMIT_DELAY = 7

# ============================================================================
# PROMPT TEMPLATES — Customize the style of generated images
# ============================================================================

def get_service_prompt(service_name, variation_num, image_index=0, context="res"):
    """Generate a unique prompt for each service image variation."""
    setting = get_setting(image_index, context)
    property_type = "commercial property" if context == "com" else "residential property"
    variations = {
        1: f"Professional photograph of a newly completed {service_name} at a {property_type} in {CITY}, {STATE}. The property is {setting}. The asphalt pavement is the main subject, shot from a slight angle showing depth, clean edges, and surface detail. Natural lighting, no text, no logos, no watermarks, no people. Photorealistic style.",
        2: f"Professional photograph of a {service_name} at a {property_type} in {REGION}. The property is {setting}. Different angle showing the full run of pavement across the property. Golden hour lighting, warm tones. No text, no logos, no watermarks, no people. Photorealistic style.",
        3: f"Professional close-up photograph of a {service_name} showing asphalt surface texture, compaction quality, and clean edge work. At a {property_type} in {CITY}, {STATE}. The property is {setting}. Sharp focus on the pavement. No text, no logos, no watermarks. Photorealistic style.",
    }
    return variations.get(variation_num, variations[1])


def get_extra_prompt(description, variation_num, image_index=0, context="res"):
    """Generate prompts for non-service images."""
    setting = get_setting(image_index, context)
    base = f"Professional photograph of {description} in {CITY}, {STATE}. The property is {setting}. No text, no logos, no watermarks, no signs. Photorealistic style."
    if variation_num == 1:
        return base
    elif variation_num == 2:
        return base.replace("Professional photograph", "Wide-angle professional photograph")
    elif variation_num == 3:
        return base.replace("Professional photograph", "Medium shot professional photograph") + " Different angle and composition."
    else:
        return base + f" Variation {variation_num}, different angle and composition."


# ============================================================================
# HELPER — Check if an image already exists in any format
# ============================================================================

IMAGE_EXTENSIONS = ['.jpeg', '.jpg', '.png', '.webp']

def image_exists(folder, basename):
    """Check if basename exists with any image extension."""
    for ext in IMAGE_EXTENSIONS:
        if (folder / f"{basename}{ext}").exists():
            return True
    return False


def find_image(folder, basename):
    """Find an image file by basename, returns path or None."""
    for ext in IMAGE_EXTENSIONS:
        path = folder / f"{basename}{ext}"
        if path.exists():
            return path
    return None


def get_mime_type(filepath):
    """Get MIME type from file extension."""
    ext = Path(filepath).suffix.lower()
    mime_map = {
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
    }
    return mime_map.get(ext, 'image/jpeg')


# ============================================================================
# LOGO GENERATOR — Creates a logo if none exists
# ============================================================================

def generate_logo(client, output_path):
    """Generate a logo if no logo file exists."""
    if find_image(output_path, "logo"):
        print("  ⏭ Logo already exists, skipping")
        return True

    print("  ⏳ Generating logo...", end="", flush=True)

    prompt = (
        f"Create me a logo for my asphalt paving company called {BUSINESS_NAME} "
        f"located in {CITY}, {STATE}. The logo should be professional, "
        f"clean, and suitable for a local asphalt paving and sealcoating business. "
        f"Include the full business name '{BUSINESS_NAME}' in the logo text. "
        f"No background — transparent or white background. "
        f"Modern but trustworthy style."
    )

    result = generate_image_with_thinking(client, prompt, output_path / "logo.png", force_jpeg=False)
    if result:
        print(f" ✓ Saved")
        return True
    else:
        return False


# ============================================================================
# BRANDED TRUCK GENERATOR — Re-wraps truck with new logo/branding
# ============================================================================

def generate_branded_truck(client, output_path):
    """Generate a branded truck image using the existing truck + logo as reference."""
    if image_exists(output_path, "Branded-truck") or image_exists(output_path, "branded-truck"):
        flag_file = output_path / ".truck-branded"
        if flag_file.exists():
            print("  ⏭ Branded truck already generated for this site, skipping")
            return True

    # Find the existing truck image (could be from another site)
    truck_path = (
        find_image(output_path, "Branded-truck") or
        find_image(output_path, "branded-truck") or
        find_image(output_path, "Branded-truck-1") or
        find_image(output_path, "branded-truck-1")
    )

    # Find the logo
    logo_path = find_image(output_path, "logo")

    if not truck_path and not logo_path:
        print("  ⚠ No truck image or logo found — skipping branded truck")
        return False

    print("  ⏳ Generating branded truck wrap...", end="", flush=True)

    # Build the prompt and content parts
    content_parts = []

    # Add reference images
    if truck_path:
        with open(truck_path, 'rb') as f:
            truck_bytes = f.read()
        content_parts.append(
            types.Part.from_bytes(data=truck_bytes, mime_type=get_mime_type(truck_path))
        )

    if logo_path:
        with open(logo_path, 'rb') as f:
            logo_bytes = f.read()
        content_parts.append(
            types.Part.from_bytes(data=logo_bytes, mime_type=get_mime_type(logo_path))
        )

    # Build the prompt based on what we have
    if truck_path and logo_path:
        prompt_text = (
            f"Using the truck image and logo provided as reference, create a professional "
            f"photograph of a work truck with a vehicle wrap for '{BUSINESS_NAME}', "
            f"an asphalt paving company in {CITY}, {STATE}. "
            f"The truck wrap should prominently feature the company name '{BUSINESS_NAME}' "
            f"and incorporate the logo's design style and colors. "
            f"The truck should look like the reference truck but with the new branding. "
            f"The property is {SETTING}. Photorealistic style. No other text or phone numbers."
        )
    elif truck_path:
        prompt_text = (
            f"Using this truck image as reference, create a professional photograph of "
            f"a work truck with a vehicle wrap for '{BUSINESS_NAME}', "
            f"an asphalt paving company in {CITY}, {STATE}. "
            f"The truck wrap should prominently display '{BUSINESS_NAME}'. "
            f"The property is {SETTING}. Photorealistic style. No other text or phone numbers."
        )
    else:
        prompt_text = (
            f"Using this logo as reference, create a professional photograph of "
            f"a work truck with a vehicle wrap for '{BUSINESS_NAME}', "
            f"an asphalt paving company in {CITY}, {STATE}. "
            f"The truck wrap should incorporate the logo and prominently display "
            f"'{BUSINESS_NAME}'. The property is {SETTING}. Photorealistic style. No other text or phone numbers."
        )

    content_parts.append(prompt_text)

    # Determine output filename
    out_filename = f"Branded-truck-{CITY.lower().replace(' ', '-')}.png"
    out_path = output_path / out_filename

    result = generate_image_with_thinking(client, content_parts, out_path, is_parts=True)
    if result:
        print(f" ✓ Saved as {out_filename}")
        # Write flag so we know this truck was branded for this site
        (output_path / ".truck-branded").write_text(BUSINESS_NAME)
        return True
    else:
        return False


# ============================================================================
# FAVICON GENERATOR — No API needed, just resizes logo
# ============================================================================

def generate_favicons():
    """Generate all favicon sizes from logo. No API needed — free."""
    output_path = Path(OUTPUT_DIR)
    public_path = output_path.parent

    logo_path = find_image(output_path, "logo")
    if not logo_path:
        print("  ⚠ No logo file found in images folder — skipping favicons")
        print(f"    Expected logo.png (or .jpg/.webp) at: {output_path}")
        return False

    print("\nFAVICONS")
    print("-" * 40)

    logo = PILImage.open(logo_path).convert("RGBA")

    favicon_sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-48x48.png": 48,
        "apple-touch-icon.png": 180,
        "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512,
    }

    for filename, size in favicon_sizes.items():
        filepath = public_path / filename
        resized = logo.resize((size, size), PILImage.LANCZOS)
        resized.save(filepath, "PNG")
        print(f"  ✓ {filename} ({size}x{size})")

    ico_path = public_path / "favicon.ico"
    icon_sizes = [(16, 16), (32, 32), (48, 48)]
    logo.save(ico_path, format="ICO", sizes=icon_sizes)
    print(f"  ✓ favicon.ico (16+32+48)")

    print(f"\n📁 Favicons saved to: {public_path}")
    return True


# ============================================================================
# IMAGE GENERATION ENGINE
# ============================================================================

MAX_RETRIES = 3

def generate_image(client, prompt, output_path, attempt=1):
    """Generate a single image from a text prompt and save it."""
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        )
        return _save_image_from_response(response, output_path)
    except Exception as e:
        return _handle_error(e, client, prompt, output_path, attempt, generate_image)


def generate_image_with_thinking(client, content, output_path, is_parts=False, force_jpeg=True, attempt=1):
    """Generate an image with thinking mode enabled (for logo + truck). 
    Content can be a string prompt or a list of Parts."""
    try:
        contents = content if is_parts else content
        response = client.models.generate_content(
            model="gemini-2.5-flash-image",
            contents=contents,
            config=types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
                thinking_config=types.ThinkingConfig(thinking_budget=2048),
            ),
        )
        return _save_image_from_response(response, output_path, force_jpeg=force_jpeg)
    except Exception as e:
        return _handle_error(e, client, content, output_path, attempt,
                           lambda c, p, o, a: generate_image_with_thinking(c, p, o, is_parts, force_jpeg, a))


def _save_image_from_response(response, output_path, force_jpeg=True):
    """Extract and save image from Gemini response.
    force_jpeg=True converts to JPEG for smaller file size (best for photos).
    force_jpeg=False keeps original format (best for logos needing transparency)."""
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image_data = part.inline_data.data

            if isinstance(image_data, str):
                raw_bytes = base64.b64decode(image_data)
            else:
                raw_bytes = image_data

            base_path = str(output_path).rsplit(".", 1)[0]

            if force_jpeg:
                # Convert to JPEG for smaller file size
                from io import BytesIO
                img = PILImage.open(BytesIO(raw_bytes)).convert("RGB")
                final_path = base_path + ".jpeg"
                img.save(final_path, "JPEG", quality=85, optimize=True)
            else:
                # Keep as PNG (for logos that need transparency)
                final_path = base_path + ".png"
                with open(final_path, "wb") as f:
                    f.write(raw_bytes)

            return final_path

    print(f"  ⚠ No image in response")
    return None


def _handle_error(e, client, content, output_path, attempt, retry_fn):
    """Handle API errors with retry logic."""
    error_msg = str(e)
    if ("429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg) and attempt < MAX_RETRIES:
        wait_time = 30 * attempt
        print(f"\n    ⏳ Rate limited (attempt {attempt}/{MAX_RETRIES}). Waiting {wait_time}s...", end="", flush=True)
        time.sleep(wait_time)
        return retry_fn(client, content, output_path, attempt + 1)
    else:
        print(f"\n    ✗ Error: {error_msg[:200]}")
        return None


# ============================================================================
# MAIN
# ============================================================================

def main():
    favicons_only = "--favicons-only" in sys.argv

    if favicons_only:
        print("=" * 60)
        print(f"FAVICON GENERATOR — {CITY}, {STATE}")
        print("=" * 60)
        generate_favicons()
        print("\n" + "=" * 60)
        print("DONE")
        print("=" * 60)
        return

    # Validate config
    if genai is None:
        print("Missing google-genai. Run: pip install google-genai")
        sys.exit(1)

    if API_KEY == "PASTE_YOUR_GEMINI_API_KEY_HERE":
        print("=" * 60)
        print("SETUP REQUIRED")
        print("=" * 60)
        print()
        print("1. Go to https://aistudio.google.com/apikey")
        print("2. Click 'Create API Key' and enable billing")
        print("3. Copy the key and paste it into this script's API_KEY variable")
        print()
        print("For favicons only (free, no API key needed):")
        print("  python generate-images.py --favicons-only")
        print()
        sys.exit(1)

    # Create output directory
    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)

    # Initialize client
    client = genai.Client(api_key=API_KEY)

    # Calculate totals
    total_service = sum(count for _, _, count, _ in SERVICES)
    total_extra = sum(count for _, _, count, _ in EXTRA_IMAGES)
    total = total_service + total_extra + 2  # +2 for logo and truck

    print("=" * 60)
    print(f"ASPHALT IMAGE GENERATOR — {BUSINESS_NAME}")
    print("=" * 60)
    print(f"Output: {OUTPUT_DIR}")
    print(f"Site Focus: {SITE_FOCUS}")
    print(f"Images to generate: up to {total} (skips existing)")
    print("=" * 60)
    print()

    generated = 0
    skipped = 0
    failed = 0

    # ---- STEP 1: Logo ----
    print("LOGO")
    print("-" * 40)
    if find_image(output_path, "logo"):
        print("  ⏭ Logo already exists, skipping")
        skipped += 1
    else:
        result = generate_logo(client, output_path)
        if result:
            generated += 1
        else:
            failed += 1
        time.sleep(RATE_LIMIT_DELAY)

    # ---- STEP 2: Branded Truck ----
    print(f"\nBRANDED TRUCK")
    print("-" * 40)
    flag_file = output_path / ".truck-branded"
    if flag_file.exists() and flag_file.read_text().strip() == BUSINESS_NAME:
        print("  ⏭ Branded truck already generated for this site, skipping")
        skipped += 1
    else:
        result = generate_branded_truck(client, output_path)
        if result:
            generated += 1
        else:
            failed += 1
        time.sleep(RATE_LIMIT_DELAY)

    # ---- STEP 3: Service Images ----
    print(f"\nSERVICE IMAGES")
    print("-" * 40)
    global_image_index = 0
    for slug, display_name, count, context in SERVICES:
        print(f"\n📸 {display_name} ({count} images)")
        for i in range(1, count + 1):
            basename = f"{slug}-{i}"

            if image_exists(output_path, basename):
                print(f"  ⏭ {basename} already exists, skipping")
                skipped += 1
                global_image_index += 1
                continue

            filename = f"{basename}.jpeg"
            filepath = output_path / filename

            prompt = get_service_prompt(display_name, i, global_image_index, context)
            global_image_index += 1
            print(f"  ⏳ Generating {basename}...", end="", flush=True)

            result = generate_image(client, prompt, filepath)
            if result:
                print(f" ✓ Saved")
                generated += 1
            else:
                failed += 1

            time.sleep(RATE_LIMIT_DELAY)

    # ---- STEP 4: Extra Images ----
    print(f"\n\nEXTRA IMAGES")
    print("-" * 40)
    extra_image_index = 0
    for prefix, description, count, context in EXTRA_IMAGES:
        print(f"\n📸 {prefix} ({count} images)")
        for i in range(1, count + 1):
            basename = f"{prefix}-{i}"

            if image_exists(output_path, basename):
                print(f"  ⏭ {basename} already exists, skipping")
                skipped += 1
                extra_image_index += 1
                continue

            filename = f"{basename}.jpeg"
            filepath = output_path / filename

            prompt = get_extra_prompt(description, i, extra_image_index, context)
            extra_image_index += 1
            print(f"  ⏳ Generating {basename}...", end="", flush=True)

            result = generate_image(client, prompt, filepath)
            if result:
                print(f" ✓ Saved")
                generated += 1
            else:
                failed += 1

            time.sleep(RATE_LIMIT_DELAY)

    # ---- STEP 5: Favicons ----
    generate_favicons()

    # ---- Summary ----
    print("\n" + "=" * 60)
    print("DONE")
    print("=" * 60)
    print(f"✓ Generated: {generated}")
    if skipped:
        print(f"⏭ Skipped (already exist): {skipped}")
    if failed:
        print(f"✗ Failed: {failed}")
    print(f"📁 Saved to: {OUTPUT_DIR}")
    print()

    images = sorted([f for f in os.listdir(output_path) if f.endswith(('.jpeg', '.jpg', '.png', '.webp'))])
    print(f"Images in folder ({len(images)}):")
    for img in images:
        print(f"  {img}")


if __name__ == "__main__":
    main()
