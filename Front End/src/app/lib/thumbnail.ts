// Task #2 Part 2 — client for the S3 + Lambda + API Gateway evidence-photo thumbnail pipeline.
// Thumbnail key rule must stay in sync with Back End/lambda/thumbnail-generator/index.mjs:
//   "evidence/<name>.<ext>"  ->  "thumbnails/<name>.jpg"

const THUMBNAIL_API = import.meta.env.VITE_THUMBNAIL_API_URL as string | undefined;

/** Derives the expected thumbnail URL for an evidence photo without a network call. */
export function getThumbnailUrl(fileUrl: string): string | null {
  const match = fileUrl.match(/^(https:\/\/[^/]+\/)evidence\/([^/]+)\.[^./]+$/);
  if (!match) return null;
  const [, origin, name] = match;
  return `${origin}thumbnails/${name}.jpg`;
}

/** Asks the Lambda (via API Gateway) to generate the thumbnail on demand, then returns its URL. */
export async function fetchOrGenerateThumbnail(fileUrl: string): Promise<string | null> {
  if (!THUMBNAIL_API) return null;

  const match = fileUrl.match(/evidence\/[^?#]+/);
  if (!match) return null;

  const res = await fetch(`${THUMBNAIL_API}/thumbnail?key=${encodeURIComponent(match[0])}`);
  if (!res.ok) return null;

  const body: { thumbnailUrl?: string } = await res.json();
  return body.thumbnailUrl ?? null;
}
