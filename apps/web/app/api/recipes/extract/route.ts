
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_SIZE = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const video = formData.get("video");

    if (!(video instanceof File)) {
      return NextResponse.json(
        { error: "A video file is required." },
        { status: 400 }
      );
    }

    if (!video.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only video files are supported." },
        { status: 400 }
      );
    }

    if (video.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maximum video size is 25 MB." },
        { status: 413 }
      );
    }

    const serviceUrl =
      process.env.RECIPE_SERVICE_URL ??
      "http://127.0.0.1:8000/extract";

    const serviceData = new FormData();
    serviceData.append("video", video);

    const response = await fetch(serviceUrl, {
      method: "POST",
      body: serviceData,
      signal: AbortSignal.timeout(300000),
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.detail ?? "Recipe extraction failed." },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recipe extraction error:", error);

    return NextResponse.json(
      { error: "Unable to process video." },
      { status: 500 }
    );
  }
}

