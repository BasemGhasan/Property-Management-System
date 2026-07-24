// Task #2 Part 2 — serverless thumbnail pipeline for maintenance-request evidence photos.
//
// Two entry points, one handler:
//   1. S3 ObjectCreated event on `evidence/*`  -> auto-generate a thumbnail under `thumbnails/`.
//   2. API Gateway HTTP API `GET /thumbnail?key=evidence/<name>` -> get-or-generate on demand,
//      used by the frontend as a fallback for photos uploaded before this pipeline existed.
//
// Thumbnail key rule (must stay in sync with src/app/lib/thumbnail.ts on the frontend):
//   "evidence/<name>.<ext>"  ->  "thumbnails/<name>.jpg"   (always re-encoded as JPEG)

import { S3Client, GetObjectCommand, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Jimp } from "jimp";

const REGION = process.env.AWS_REGION || "ap-southeast-2";
const BUCKET = process.env.THUMBNAIL_BUCKET || "propms-evidence";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const MAX_DIMENSION = 400;

const s3 = new S3Client({ region: REGION });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function toThumbnailKey(evidenceKey) {
  const name = evidenceKey.replace(/^evidence\//, "").replace(/\.[^.]+$/, "");
  return `thumbnails/${name}.jpg`;
}

function publicUrl(bucket, key) {
  return `https://${bucket}.s3.${REGION}.amazonaws.com/${key}`;
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function generateThumbnail(bucket, sourceKey, thumbKey) {
  const source = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: sourceKey }));
  const buffer = await streamToBuffer(source.Body);

  const image = await Jimp.read(buffer);
  image.resize({ w: MAX_DIMENSION });
  const outBuffer = await image.getBuffer("image/jpeg");

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: thumbKey,
    Body: outBuffer,
    ContentType: "image/jpeg",
  }));
}

async function thumbnailExists(bucket, key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function handleS3Event(event) {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    if (!key.startsWith("evidence/")) continue;

    const thumbKey = toThumbnailKey(key);
    await generateThumbnail(bucket, key, thumbKey);
  }
  return { ok: true };
}

async function handleApiGateway(event) {
  const key = event.queryStringParameters?.key;

  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (!key || !key.startsWith("evidence/")) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Query parameter 'key' must start with 'evidence/'." }),
    };
  }

  const thumbKey = toThumbnailKey(key);

  if (!(await thumbnailExists(BUCKET, thumbKey))) {
    await generateThumbnail(BUCKET, key, thumbKey);
  }

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ thumbnailUrl: publicUrl(BUCKET, thumbKey) }),
  };
}

export const handler = async (event) => {
  try {
    if (event.Records?.[0]?.s3) {
      return await handleS3Event(event);
    }
    if (event.requestContext) {
      return await handleApiGateway(event);
    }
    return { statusCode: 400, body: "Unsupported event source." };
  } catch (err) {
    console.error("thumbnail-generator failed:", err);
    if (event.requestContext) {
      return {
        statusCode: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Failed to generate thumbnail." }),
      };
    }
    throw err;
  }
};
