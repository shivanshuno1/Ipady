import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from constants import SERVER_URL, PORT, ENV
# Ensure this import is correct
from apps.calculator._init_ import router as calculator_router

# Add project root to sys.path
project_root = os.path.dirname(
    os.path.abspath(__file__))  # Directory of main.py
if project_root not in sys.path:
    sys.path.append(project_root)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

# Create the FastAPI app
app = FastAPI(lifespan=lifespan)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Root route


@app.get("/")
async def root():
    return {"message": "Server is running"}

# Include router for calculator functionality
app.include_router(calculator_router, tags=["calculate"])


# Run the app
if __name__ == "__main__":
    uvicorn.run(
        "main:app", host=SERVER_URL, port=int(PORT), reload=(ENV == "dev")
    )
