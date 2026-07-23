# propms-thumbnail-generator

Task #2 Part 2 serverless piece: S3-triggered + API Gateway-fronted Lambda that
generates a small JPEG thumbnail for every maintenance-request evidence photo.

Uses **Jimp** (pure JavaScript, no native binaries) specifically so the deployment
zip can be built on Windows and still run correctly on Lambda's Linux runtime —
no cross-compilation needed.

## 1. Package the function

```bash
cd lambda/thumbnail-generator
npm install
npm install --omit=dev
zip -r function.zip index.mjs package.json node_modules
```

## 2. Create the Lambda function (AWS Console)

1. Lambda → **Create function** → Author from scratch.
   - Name: `propms-thumbnail-generator`
   - Runtime: **Node.js 22.x**
   - Architecture: `x86_64`
2. Upload `function.zip` (Code → Upload from → .zip file).
3. Configuration → General configuration → set **Timeout** to `15 sec` (image
   download + resize + upload needs more than the 3s default) and **Memory**
   to `512 MB`.
4. Configuration → Environment variables:
   - `THUMBNAIL_BUCKET` = `propms-evidence`
   - `ALLOWED_ORIGIN` = your CloudFront URL (e.g. `https://d3a7xbmvcwhxka.cloudfront.net`) — use `*` while testing locally.
5. Configuration → Permissions → open the execution role → add an inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["s3:GetObject", "s3:PutObject", "s3:HeadObject"],
       "Resource": [
         "arn:aws:s3:::propms-evidence/evidence/*",
         "arn:aws:s3:::propms-evidence/thumbnails/*"
       ]
     }]
   }
   ```
   (The default `AWSLambdaBasicExecutionRole` for CloudWatch Logs is attached automatically when the function is created.)
6. Configuration → Monitoring and operations tools → enable **Active tracing**
   (AWS X-Ray) — needed for the Part 3 service map later, free to turn on now.

## 3. Wire the S3 trigger (auto-thumbnail on upload)

1. S3 console → `propms-evidence` bucket → **Properties** → **Event notifications** → **Create event notification**.
   - Name: `evidence-uploaded`
   - Prefix: `evidence/`
   - Event types: `s3:ObjectCreated:*`
   - Destination: Lambda function → `propms-thumbnail-generator`
2. Save. S3 will auto-add the resource-based permission allowing this bucket to invoke the function.

## 4. Wire the API Gateway route (on-demand get-or-generate)

1. API Gateway console → **Create API** → **HTTP API** → **Build**.
   - Name: `propms-thumbnail-api`
2. Add integration: Lambda → `propms-thumbnail-generator`.
3. Add route: `GET /thumbnail` → integration above.
4. CORS: API Gateway → your API → **CORS** →
   - Access-Control-Allow-Origin: your CloudFront URL (or `*` while testing)
   - Access-Control-Allow-Methods: `GET, OPTIONS`
5. Deploy to stage `prod` (HTTP APIs auto-deploy by default). Note the **Invoke URL**, e.g.
   `https://abc123xyz.execute-api.ap-southeast-2.amazonaws.com`.
6. Enable **Active tracing** on the stage (Monitoring tab) for X-Ray, same reason as step 2.6 above.
7. Put the invoke URL into the frontend's `VITE_THUMBNAIL_API_URL` env var (see `.env` / `.env.production` in the repo root).

## How it works

- **Upload path (event-driven):** Resident uploads a photo → existing `UploadController` puts it
  in S3 under `evidence/` (unchanged) → S3 fires `ObjectCreated` → this Lambda resizes it to
  400px wide and writes `thumbnails/<name>.jpg`.
- **Read path (on-demand, via API Gateway):** The frontend first tries to load
  `thumbnails/<name>.jpg` directly from S3. If that 404s (e.g. photo uploaded before this
  pipeline existed, or the S3-event Lambda hasn't finished yet), it calls
  `GET {VITE_THUMBNAIL_API_URL}/thumbnail?key=evidence/<name>.<ext>`, which generates the
  thumbnail synchronously and returns its URL.

## Testing after deploy

```bash
curl "https://<invoke-url>/thumbnail?key=evidence/<some-existing-file>.jpg"
# -> {"thumbnailUrl":"https://propms-evidence.s3.ap-southeast-2.amazonaws.com/thumbnails/<some-existing-file>.jpg"}
```

Check CloudWatch → Log groups → `/aws/lambda/propms-thumbnail-generator` for invocation logs
from both trigger paths.
