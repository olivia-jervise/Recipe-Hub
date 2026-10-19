

"use client";

import { useEffect, useId, useState } from "react";

type Ingredient = string | {
  name?: string;
  quantity?: string | number | null;
  unit?: string | null;
};

type Instruction = string | {
  step?: number;
  instruction?: string;
};

type Recipe = {
  title?: string;
  description?: string;
  servings?: string | number | null;
  prep_time?: string | null;
  cook_time?: string | null;
  temperature?: string | null;
  ingredients?: Ingredient[];
  instructions?: Instruction[];
  equipment?: string[];
  dietary_tags?: string[];
  missing_information?: string[] | string | null;
};

type ExtractionResult = {
  model: string;
  transcript: string;
  recipe: Recipe;
};

const MAX_SIZE = 25 * 1024 * 1024;

export default function UploadPage() {
  const inputId = useId();

  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [transcript, setTranscript] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Release the previous preview URL when it changes.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleUpload(file?: File) {
    if (loading) return;

    setError("");
    setMessage("");
    setRecipe(null);
    setTranscript("");
    setModel("");
    setVideo(null);
    setPreview(null);

    if (!file) return;

    if (
      !file.type.startsWith("video/") ||
      ![".mp4", ".mov", ".webm", ".m4v"].some(
        (ext) => file.name.toLowerCase().endsWith(ext)
      )
    ) {
      setError("Please upload an MP4, MOV, WebM, or M4V video.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Video must be 25 MB or smaller.");
      return;
    }

    if (file.size === 0) {
      setError("The selected video is empty.");
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setMessage(`${file.name} is ready to process.`);
  }

  async function handleGenerate() {
    if (!video || loading) {
      if (!video) setError("Please select a video first.");
      return;
    }

    setLoading(true);
    setError("");
    setRecipe(null);
    setTranscript("");
    setMessage(
      "Processing your video. Whisper is transcribing and Ollama will generate the recipe. This may take a few minutes."
    );

    try {
      const formData = new FormData();
      formData.append("video", video);

      const response = await fetch("/api/recipes/extract", {
        method: "POST",
        body: formData,
      });

      const data: ExtractionResult & { error?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Recipe extraction failed."
        );
      }

      if (!data.recipe || typeof data.recipe !== "object") {
        throw new Error("The backend did not return a recipe.");
      }

      setRecipe(data.recipe);
      setTranscript(data.transcript ?? "");
      setModel(data.model ?? "");
      setMessage("Recipe generated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while processing the video."
      );
      setMessage("");
    } finally {
      setLoading(false);
    }
  }

  function formatIngredient(item: Ingredient): string {
    if (typeof item === "string") return item;

    return [
      item.quantity,
      item.unit,
      item.name,
    ]
      .filter((part) => part !== null && part !== undefined && part !== "")
      .join(" ");
  }

  function formatInstruction(item: Instruction): string {
    return typeof item === "string"
      ? item
      : item.instruction ?? "";
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-neutral-900">
      {/* Page heading */}
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Recipe Hub
        </p>

        <h1 className="text-3xl font-bold">
          Turn your video into a recipe
        </h1>

        <p className="mt-3 text-neutral-700">
          Upload a cooking video and let Whisper and Ollama
          extract ingredients, cooking instructions, and
          recipe details.
        </p>
      </header>

      {/* Upload section */}
      <section
        aria-labelledby="upload-heading"
        className="rounded-xl border border-neutral-400 bg-white p-6 shadow-sm"
      >
        <h2
          id="upload-heading"
          className="mb-4 text-xl font-semibold"
        >
          Upload your video
        </h2>

        <label
          htmlFor={inputId}
          className="mb-2 block font-medium"
        >
          Choose a cooking video
        </label>

        <input
          id={inputId}
          type="file"
          accept=".mp4,.mov,.webm,.m4v,video/*"
          disabled={loading}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : `${inputId}-help`
          }
          onChange={(event) => {
            handleUpload(event.target.files?.[0]);
          }}
          className="block w-full rounded-lg border border-neutral-500 p-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 disabled:opacity-50"
        />

        <p
          id={`${inputId}-help`}
          className="mt-2 text-sm text-neutral-600"
        >
          Supported formats: MP4, MOV, WebM, M4V.
          Maximum file size: 25 MB.
        </p>

        {/* Video preview */}
        {preview && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">
              Video Preview
            </h3>

            <video
              key={preview}
              controls
              preload="metadata"
              src={preview}
              className="w-full rounded-lg bg-black"
            >
              Your browser does not support video playback.
            </video>

            <p className="mt-2 break-all text-sm text-neutral-600">
              Selected: {video?.name}
            </p>
          </div>
        )}

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!video || loading}
          className="mt-6 min-h-11 w-full rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Generating Recipe..." : "Generate Recipe"}
        </button>

        {/* Processing indicator */}
        {loading && (
          <div className="mt-4 flex items-center gap-3">
            <div
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent"
            />
            <p className="text-sm text-neutral-700">
              Processing video. Please keep this page open.
            </p>
          </div>
        )}

        {/* Status messages */}
        <div
          role="status"
          aria-live="polite"
          className="mt-4 text-sm text-neutral-700"
        >
          {message}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-3 font-medium text-red-700"
          >
            {error}
          </p>
        )}
      </section>

      {/* Recipe results */}
      <section
        aria-labelledby="recipe-heading"
        className="mt-8 rounded-xl border border-neutral-400 bg-white p-6 shadow-sm"
      >
        <h2
          id="recipe-heading"
          className="text-xl font-semibold"
        >
          Your Recipe
        </h2>

        {!recipe ? (
          <p className="mt-3 text-neutral-700">
            Your extracted recipe will appear here after
            processing your video.
          </p>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Recipe title */}
            <div>
              <h3 className="text-2xl font-bold">
                {recipe.title || "Untitled Recipe"}
              </h3>

              {recipe.description && (
                <p className="mt-2 text-neutral-700">
                  {recipe.description}
                </p>
              )}

              {model && (
                <p className="mt-2 text-xs text-neutral-600">
                  Generated using {model}
                </p>
              )}
            </div>

            {/* Recipe details */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-100 p-4 text-sm sm:grid-cols-3">
              <p>
                <strong>Servings:</strong>{" "}
                {recipe.servings ?? "Unknown"}
              </p>
              <p>
                <strong>Prep:</strong>{" "}
                {recipe.prep_time ?? "Unknown"}
              </p>
              <p>
                <strong>Cook:</strong>{" "}
                {recipe.cook_time ?? "Unknown"}
              </p>

              {recipe.temperature && (
                <p>
                  <strong>Temperature:</strong>{" "}
                  {recipe.temperature}
                </p>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold">
                Ingredients
              </h3>

              {recipe.ingredients?.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  {recipe.ingredients.map((item, index) => (
                    <li key={index}>
                      {formatIngredient(item)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-neutral-600">
                  No ingredients identified.
                </p>
              )}
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold">
                Instructions
              </h3>

              {recipe.instructions?.length ? (
                <ol className="mt-3 list-decimal space-y-3 pl-6">
                  {recipe.instructions.map((item, index) => (
                    <li key={index}>
                      {formatInstruction(item)}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-neutral-600">
                  No cooking instructions identified.
                </p>
              )}
            </div>

            {/* Equipment */}
            {(Array.isArray(recipe.dietary_tags)
                ? recipe.dietary_tags.length > 0
                : typeof recipe.dietary_tags === "string" &&
                    recipe.dietary_tags.length > 0) && (
              <div>
                <h3 className="text-lg font-semibold">
                  Equipment
                </h3>
                <ul className="mt-2 list-disc pl-6">
                  {recipe.equipment?.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dietary tags */}
            {Boolean(recipe.dietary_tags?.length) && (
              <div>
                <h3 className="text-lg font-semibold">
                  Dietary Tags
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(Array.isArray(recipe.dietary_tags)
                    ? recipe.dietary_tags
                    : typeof recipe.dietary_tags === "string"
                        ? [recipe.dietary_tags]
                        : []
                    ).map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-900"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing information */}
            {Boolean(recipe.missing_information) && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-950">
                  Missing Recipe Information
                </h3>

                {Array.isArray(recipe.missing_information) ? (
                  <ul className="mt-2 list-disc pl-6 text-sm text-amber-950">
                    {recipe.missing_information.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-amber-950">
                    {recipe.missing_information}
                  </p>
                )}
              </div>
            )}

            {/* Original transcript */}
            {transcript && (
              <details className="rounded-lg border border-neutral-300 p-4">
                <summary className="cursor-pointer font-medium">
                  View Whisper Transcript
                </summary>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                  {transcript}
                </p>
              </details>
            )}

            <p className="text-sm text-neutral-600">
              AI-generated recipes may contain mistakes.
              Verify ingredients, measurements, temperatures,
              and cooking instructions before use.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
