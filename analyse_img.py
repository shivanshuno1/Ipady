from PIL import Image
import numpy as np

# Define a simple analyze_image function


def analyze_image(image: Image, dict_of_vars: dict):
    # Example logic: Convert image to grayscale and resize it
    grayscale_image = image.convert("L")  # Convert to grayscale
    resized_image = grayscale_image.resize((100, 100))  # Resize image

    # Example response: returning the resized image's size and a dummy variable
    image_data = {
        "size": resized_image.size,
        "mode": resized_image.mode,
        "dummy_var": dict_of_vars.get("dummy_var", "default_value")
    }

    # You can add further logic for more complex analysis
    # For example: perform edge detection, apply filters, or use machine learning models

    return [image_data]  # Returning a list of response data
