
"use client";

import { useId, useState } from "react";

export default function UploadPage() {
  const inputId = useId();
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const maxSize = 100 * 1024 * 1024;

  function handleUpload(file?: File) {
    setError("");
    setMessage("");
    setVideo(null);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please upload a video file.");
      return;
    }

    if (file.size > maxSize) {
      setError("Video must be smaller than 100 MB.");
      return;
    }

    setVideo(file);
    setPreview(URL.createObjectURL(file));
    setMessage(`${file.name} is ready to process.`);
  }

  function handleGenerate() {
    if (!video) {
      setError("Please select a video first.");
      return;
    }

    setMessage(
      "Video ready! Recipe generation will be connected to the backend next."
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-emerald-700">
          RECIPE HUB
        </p>

        <h1 className="text-3xl font-bold text-neutral-900">
          Turn your video into a recipe
        </h1>

        <p className="mt-3 text-neutral-700">
          Upload a cooking video and get ingredients,
          measurements, and step-by-step instructions.
        </p>
      </header>

      <section
        aria-labelledby="upload-heading"
        className="rounded-xl border border-neutral-400 p-6"
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
          Choose a recipe video
        </label>

        <input
          id={inputId}
          type="file"
          accept="video/*"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${inputId}-error` : `${inputId}-help`
          }
          onChange={(event) =>
            handleUpload(event.target.files?.[0])
          }
          className="block w-full rounded-lg border border-neutral-500 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
        />

        <p
          id={`${inputId}-help`}
          className="mt-2 text-sm text-neutral-700"
        >
          Video files only. Maximum size: 100 MB.
        </p>

        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="mt-3 font-medium text-red-700"
          >
            {error}
          </p>
        )}

        {preview && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">
              Video preview
            </h3>

            <video
              key={preview}
              controls
              preload="metadata"
              className="w-full rounded-lg bg-black"
              src={preview}
            >
              Your browser does not support video playback.
            </video>

            <p className="mt-2 break-all text-sm text-neutral-700">
              Selected: {video?.name}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!video}
          className="mt-6 min-h-11 w-full rounded-lg bg-emerald-800 px-5 py-3 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Generate Recipe
        </button>

        <div
          role="status"
          aria-live="polite"
          className="mt-4 text-sm text-neutral-700"
        >
          {message}
        </div>
      </section>

      <section
        aria-labelledby="recipe-heading"
        className="mt-8 rounded-xl border border-neutral-400 p-6"
      >
        <h2
          id="recipe-heading"
          className="text-xl font-semibold"
        >
          Your Recipe
        </h2>

        <p className="mt-3 text-neutral-700">
          Your extracted ingredients, cooking instructions,
          and recipe details will appear here after
          backend integration.
        </p>
      </section>
    </main>
  );
}
