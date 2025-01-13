import base64
from io import BytesIO
from PIL import Image
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from apps.calculator.utils import analyze_image


# Sample Pydantic Model for the expected input


class ImageData(BaseModel):
    image: str
    dict_of_vars: Dict[str, str]


router = APIRouter()


@router.post('/calculate')
async def calculate(data: ImageData):
    try:
        # Log the incoming data for debugging
        # Log the first 50 characters of the image data
        print(f"Received image data: {data.image[:50]}...")
        print(f"Received dict_of_vars: {data.dict_of_vars}")

        # Decode the image from base64
        image_data = base64.b64decode(data.image.split(",")[1])
        image_bytes = BytesIO(image_data)
        image = Image.open(image_bytes)

        # Process the image using your analyze_image function
        responses = analyze_image(image, dict_of_vars=data.dict_of_vars)

        # Collect responses
        response_data = []
        for response in responses:
            response_data.append(response)
            print(f'Response in route: {response}')  # Log each response

        return {"message": "Image processed", "data": response_data, "status": "success"}

    except Exception as e:
        # Log the error before raising the exception
        print(f"Error processing image: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error processing image: {str(e)}")
