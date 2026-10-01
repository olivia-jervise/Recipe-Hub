---
type: feature
---
# Video links return provider metadata and media details

## Why
Users can submit a public video link and retrieve the details and media options
provided by the configured video service.

## Where it lives
- `apps/web/app/api/media/inspect/route.ts`

## Behavior
- `POST /api/media/inspect` accepts a JSON body containing a `url`.
- The route derives the current user before processing the request.
- Only HTTPS links on supported YouTube, TikTok, and Instagram hostnames are
  accepted. Unknown hosts, credentials in the URL, malformed links, and
  unrecognized video URL formats receive a 400 error.
- The route calls the matching SMVD details endpoint from the server, using
  `SMVD_RAPIDAPI_KEY`; the key is never returned to the client.
- A successful response has the shape `{ platform, result }`, where `result`
  is the SMVD JSON response, including any description and media links the
  provider returns.
- Invalid JSON, missing configuration, unavailable videos, provider errors,
  and rate limits return the standard `{ error: { code, message } }` shape.

## Examples

| State / input | Behavior |
|---|---|
| Valid public TikTok video URL | Calls the TikTok details endpoint and returns `{ platform: "tiktok", result }`. |
| Valid YouTube video URL | Calls the YouTube video details endpoint using its video ID. |
| Valid Instagram post or reel URL | Calls the Instagram media details endpoint using its shortcode. |
| URL on an unsupported host | Returns 400 without making an upstream request. |
| Missing RapidAPI key | Returns a configuration error without making an upstream request. |

## Verify
- Run `pnpm typecheck` and `pnpm build`.
- With `SMVD_RAPIDAPI_KEY` configured in `apps/web/.env.local`, submit one
  supported URL to `/api/media/inspect` and confirm the result includes the
  provider's description and media information.
- Submit a URL from an unsupported host and confirm the route returns 400.

## Constraints & decisions
- The route returns the provider's JSON result rather than assuming a response
  schema that may change between platforms.
- The route returns media links and metadata; it does not download, store, or
  proxy video bytes.
- Only the provider's details endpoints are used. Availability of a direct
  media link depends on the provider response and its access rules.

## Out of scope
- A user interface for submitting links or playing/downloading returned media
  does not exist yet.
- Transcription and local media storage are not part of this behavior.
