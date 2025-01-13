from pydantic import BaseModel, validator
import base64


class ImageData(BaseModel):
    image: str  # Base64 encoded image
    dict_of_vars: dict  # Additional variables as a dictionary

    @validator('image')
    def validate_base64(cls, v):
        # Check if base64 is valid by attempting to decode it
        try:
            # Ensure that the base64 part is valid
            base64.b64decode(v.split(",")[1])
        except (base64.binascii.Error, IndexError):
            raise ValueError("Invalid base64 encoded image")
        return v
