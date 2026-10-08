
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

# Lightweight Ollama model
MODEL = "gemma3:1b"

PROMPT = """
You are a recipe extraction system.

Convert the cooking transcript into a detailed recipe.

RULES:
1. Only use information supported by the transcript.
2. NEVER invent ingredient quantities, temperatures, or times.
3. Use null when information is unknown.
4. Remove unrelated commentary.
5. Keep cooking steps in the correct order.
6. Do not duplicate ingredients.
7. Separate ingredients from instructions.
8. Return ONLY valid JSON.
9. If information is missing, list it in missing_information.
10. Do not include Markdown or explanations.

Return this JSON structure:

{
  "title": "",
  "description": "",
  "servings": null,
  "prep_time": null,
  "cook_time": null,
  "ingredients": [
    {
      "name": "",
      "quantity": null,
      "unit": null
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": ""
    }
  ],
  "equipment": [],
  "temperature": null,
  "dietary_tags": [],
  "missing_information": []
}

TRANSCRIPT:
"""


def extract_recipe(transcript_path):
    # Step 1: Read the Whisper transcript
    transcript = Path(transcript_path).read_text(
        encoding="utf-8"
    )

    # Step 2: Prepare Ollama API request
    payload = {
        "model": MODEL,
        "prompt": PROMPT + transcript,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0,
            "num_predict": 2048
        }
    }

    request = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    # Step 3: Generate recipe using Ollama
    print("Generating recipe with Ollama...")

    try:
        with urllib.request.urlopen(
            request, timeout=300
        ) as response:
            data = json.load(response)

    except urllib.error.URLError as error:
        sys.exit(
            f"Cannot connect to Ollama: {error}\n"
            "Make sure the Ollama app is running."
        )

    # Step 4: Parse generated JSON
    raw_output = data.get("response", "").strip()

    try:
        recipe = json.loads(raw_output)
    except json.JSONDecodeError as error:
        Path("recipe_raw_output.txt").write_text(
            raw_output, encoding="utf-8"
        )
        sys.exit(
            f"Invalid JSON: {error}\n"
            "Raw output saved to recipe_raw_output.txt"
        )

    # Step 5: Return transcript and recipe
    return {
        "model": MODEL,
        "transcript": transcript,
        "recipe": recipe
    }


if __name__ == "__main__":

    if len(sys.argv) != 2:
        sys.exit(
            "Usage: python3 scripts/recipe_extraction.py "
            "transcript.txt"
        )

    transcript_path = Path(sys.argv[1])

    if not transcript_path.is_file():
        sys.exit("Transcript file not found.")

    output = extract_recipe(transcript_path)

    # Step 6: Save results
    output_file = Path("recipe_result.json")

    output_file.write_text(
        json.dumps(output, indent=2),
        encoding="utf-8"
    )

    print("Success! Recipe generated.")
    print(f"Saved to {output_file}")
