
import json
import os
import tempfile
from pathlib import Path

import whisper
import requests
from fastapi import FastAPI, File, HTTPException, UploadFile

app = FastAPI(title="Recipe Hub Extraction API")

MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")
OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://127.0.0.1:11434/api/generate"
)

MAX_SIZE = 25 * 1024 * 1024

PROMPT = """
Convert this cooking video transcript into a recipe.

Return JSON containing:
title, description, servings, prep_time,
cook_time, ingredients, instructions,
equipment, temperature, dietary_tags,
and missing_information.

Do not invent measurements, cooking times,
temperatures, or ingredients.

Use null for unknown information.
Return only valid JSON.

TRANSCRIPT:
"""

@app.post("/extract")
async def extract(video: UploadFile = File(...)):
    if not video.content_type or not video.content_type.startswith("video/"):
        raise HTTPException(400, "Only video uploads are supported.")

    suffix = Path(video.filename or "").suffix.lower()
    if suffix not in {".mp4", ".mov", ".webm", ".m4v"}:
        raise HTTPException(400, "Unsupported video format.")

    with tempfile.TemporaryDirectory() as folder:
        path = Path(folder) / f"upload{suffix}"

        size = 0
        with path.open("wb") as output:
            while chunk := await video.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_SIZE:
                    raise HTTPException(413, "Video exceeds 25 MB.")
                output.write(chunk)

        await video.close()

        try:
            model = whisper.load_model("base")
            transcript = model.transcribe(str(path))["text"]
        except Exception as error:
            raise HTTPException(
                500, "Video transcription failed."
            ) from error

        try:
            response = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "prompt": PROMPT + transcript,
                    "stream": False,
                    "format": "json",
                    "options": {"temperature": 0}
                },
                timeout=180
            )
            response.raise_for_status()
            recipe = json.loads(response.json()["response"])
        except Exception as error:
            raise HTTPException(
                502, "Ollama recipe generation failed."
            ) from error

        return {
            "model": MODEL,
            "transcript": transcript,
            "recipe": recipe
        }

