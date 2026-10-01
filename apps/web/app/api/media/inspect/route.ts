import { currentUserId } from "@project/auth";

export const dynamic = "force-dynamic";

const RAPIDAPI_HOST = "social-media-video-downloader.p.rapidapi.com";
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;
const MAX_VIDEO_URL_LENGTH = 2048;

const PLATFORM_HOSTS = {
  youtube: new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]),
  tiktok: new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"]),
  instagram: new Set(["instagram.com", "www.instagram.com", "m.instagram.com"]),
} as const;

type Platform = keyof typeof PLATFORM_HOSTS;

function errorResponse(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

function platformForHost(hostname: string): Platform | undefined {
  return (Object.keys(PLATFORM_HOSTS) as Platform[]).find((platform) =>
    PLATFORM_HOSTS[platform].has(hostname),
  );
}

function youtubeVideoId(url: URL): string | undefined {
  const id =
    url.hostname === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/]+)/)?.[1];
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined;
}

function instagramShortcode(url: URL): string | undefined {
  const match = url.pathname.match(/^\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return match?.[1];
}

function upstreamUrl(videoUrl: URL, platform: Platform): URL | undefined {
  const endpoint = new URL(RAPIDAPI_BASE_URL);

  if (platform === "youtube") {
    const videoId = youtubeVideoId(videoUrl);
    if (!videoId) return undefined;
    endpoint.pathname = "/youtube/v3/video/details";
    endpoint.searchParams.set("videoId", videoId);
    return endpoint;
  }

  if (platform === "tiktok") {
    endpoint.pathname = "/tiktok/v3/post/details";
    endpoint.searchParams.set("url", videoUrl.toString());
    return endpoint;
  }

  const shortcode = instagramShortcode(videoUrl);
  if (!shortcode) return undefined;
  endpoint.pathname = "/instagram/v3/media/post/details";
  endpoint.searchParams.set("renderableFormats", "720p,highres");
  endpoint.searchParams.set("shortcode", shortcode);
  return endpoint;
}

export async function POST(request: Request) {
  await currentUserId();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("INVALID_REQUEST", "Request body must be JSON.", 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("url" in body) ||
    typeof body.url !== "string" ||
    body.url.length > MAX_VIDEO_URL_LENGTH
  ) {
    return errorResponse("INVALID_URL", "Provide a video URL.", 400);
  }

  let videoUrl: URL;
  try {
    videoUrl = new URL(body.url);
  } catch {
    return errorResponse("INVALID_URL", "Provide a valid video URL.", 400);
  }

  if (videoUrl.protocol !== "https:" || videoUrl.username || videoUrl.password) {
    return errorResponse(
      "UNSUPPORTED_URL",
      "Provide a public YouTube, TikTok, or Instagram video URL.",
      400,
    );
  }

  const platform = platformForHost(videoUrl.hostname.toLowerCase());
  if (!platform) {
    return errorResponse(
      "UNSUPPORTED_URL",
      "Provide a public YouTube, TikTok, or Instagram video URL.",
      400,
    );
  }

  const endpoint = upstreamUrl(videoUrl, platform);
  if (!endpoint) {
    return errorResponse(
      "INVALID_URL",
      `The URL is not a recognized ${platform} video link.`,
      400,
    );
  }

  const apiKey = process.env.SMVD_RAPIDAPI_KEY;
  if (!apiKey) {
    return errorResponse(
      "CONFIGURATION_ERROR",
      "The video service is not configured.",
      500,
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(endpoint, {
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": RAPIDAPI_HOST,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    return errorResponse("UPSTREAM_ERROR", "Video service is unavailable.", 502);
  }

  if (upstream.status === 429) {
    return errorResponse(
      "RATE_LIMITED",
      "Video service rate limit reached. Try again later.",
      429,
    );
  }

  if (upstream.status === 400 || upstream.status === 404 || upstream.status === 422) {
    return errorResponse(
      "VIDEO_UNAVAILABLE",
      "The video could not be found or processed.",
      400,
    );
  }

  if (!upstream.ok) {
    return errorResponse("UPSTREAM_ERROR", "Video service request failed.", 502);
  }

  let result: unknown;
  try {
    result = await upstream.json();
  } catch {
    return errorResponse(
      "INVALID_UPSTREAM_RESPONSE",
      "Video service returned an invalid response.",
      502,
    );
  }

  return Response.json({ platform, result });
}