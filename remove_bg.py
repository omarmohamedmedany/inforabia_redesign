import sys
try:
    from PIL import Image
except ImportError:
    print("Please install Pillow first: pip install Pillow")
    sys.exit(1)

def make_white_transparent(image_path, output_path, tolerance=240):
    """
    Reads an image, looks for white (or near-white) pixels, 
    and converts them to transparent.
    """
    img = Image.open(image_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for item in data:
        # Check if the pixel is white-ish based on the tolerance
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            # Change to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Success! Image saved with transparent background to: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_image> <output_image>")
        print("Example: python remove_bg.py logo.png logo_transparent.png")
    else:
        make_white_transparent(sys.argv[1], sys.argv[2])
