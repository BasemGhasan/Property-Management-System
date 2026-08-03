## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | ASP.NET Core 9 Web API |
| Database | MySQL (local dev) / AWS RDS (production) |
| Auth | JWT Bearer tokens + BCrypt password hashing |
| AI | Google Gemini (chat assistant, invoice OCR, financial insights) + Google Maps Platform (assistant map search) |
| Serverless | AWS Lambda (thumbnail generation, Node.js) behind API Gateway |
| Deployment | AWS Elastic Beanstalk (backend) + S3 + CloudFront (frontend) + CloudWatch (monitoring) |

---

### Backend (ASP.NET Core 9)
- **Authentication** — Register, Login with JWT tokens, role-based access (Admin / Owner / Resident), forgot/reset password via emailed token
- **Users** — Get all users (Admin), get residents list (Owner/Admin), get/update own profile, email verification + resend, change password, activate/deactivate & delete users (Admin)
- **Properties** — Full CRUD, owner scoping, assign/remove residents
- **Maintenance Requests** — Create, list, update status/priority/notes, role-scoped views
- **Maintenance Claims** — Residents submit cost-reimbursement claims (bank details + receipt) for approval, Owner/Admin approve or reject, in-app notifications on submit/decision
- **Invoice Scanning** — `POST /api/maintenance/scan-invoice` uploads a receipt image to S3 and uses Gemini (`gemini-2.5-flash`, structured JSON output) to auto-extract maintenance type, date and amount for the claim form
- **AI Assistant** — `POST /api/assistant/chat` proxies conversational queries to Gemini for the in-app assistant
- **Financial Insights** — `POST /api/insights/financial` sends chart data points to Gemini and returns a plain-language trend summary + suggestions for the Owner analytics dashboard
- **Notifications** — Per-user notification feed, unread count, mark-as-read (single/all); generated automatically on claim submission/decision and other status changes
- **Photo Evidence Upload** — `POST /api/upload` accepts image files, uploads to AWS S3, returns permanent public URL; URLs are stored in the `RequestEvidence` table and returned alongside every request. An S3-triggered Lambda (see `Back End/lambda/thumbnail-generator`) generates a resized thumbnail for every uploaded photo
- **Categories** — Seeded with 6 default categories (Plumbing, Electrical, HVAC, Structural, Appliances, Pest Control)
- **EF Core migrations** — Auto-applied on startup, includes seed data
- **CORS** — Configurable via environment variables for production
- **Email** — Transactional email (verification, password reset, notifications) via AWS SES

### Frontend (React + TypeScript)
- All mock services replaced with real API calls
- JWT stored in localStorage, auto-redirect to login on session expiry
- Role-based routing after login (Admin / Owner / Resident dashboards)
- Profile chip in all layouts shows the logged-in user's real name
- In-app notification bell with unread badge, shared across all roles
- **Owner**: Add property, Edit property, Assign/Remove residents, review/approve maintenance claims, AI-powered financial analytics dashboard (charts + Gemini-generated plain-language insights) and reports
- **Admin**: Add property with owner selector, Edit (including reassign owner), Delete property
- All profile pages load and save real user data via API, with email verification banner and password change
- **Resident**: Submit maintenance request with photo evidence — images are uploaded to S3 and attached to the request; submit maintenance cost claims with receipt photo (auto-filled via AI invoice scanning) and track claim history
- **AI Assistant** — chat-based assistant (Gemini) with an interactive Google Maps panel for property/location search, market analysis cards, and geocoding/routing utilities

### Default Seed Data
One admin account is created automatically on first run:
| Field | Value |
|---|---|
| Email | `admin@propms.com` |
| Password | `Admin@123` |

---

## Local Development Setup

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- MySQL 8.0+ — via [MySQL Installer](https://dev.mysql.com/downloads/installer/) or XAMPP
- A [Gemini API key](https://ai.google.dev/) (for the AI assistant, invoice scanning and financial insights)
- A [Google Maps Platform API key](https://developers.google.com/maps) (for the assistant's map panel)

### 1. Create the database

Open MySQL Workbench (or any MySQL client) and run:

```sql
CREATE DATABASE property_mgmt;
```

The app creates all tables automatically on first run — you only need to create the empty database.

---

### 2. Configure the backend

Open `Back End/PropertyManagement.API/appsettings.json` and update the connection string with your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=property_mgmt;User=root;Password=YOUR_MYSQL_PASSWORD;"
  },
  "GEMINI_API_KEY": "YOUR_GEMINI_API_KEY",
  "GOOGLE_CLOUD_API_KEY": "YOUR_GOOGLE_CLOUD_API_KEY"
}
```

Leave everything else unchanged for local dev.

---

### 3. Run the backend

```bash
cd "Back End/PropertyManagement.API"
dotnet run
```

The API starts at `http://localhost:5183`.

On first run it automatically applies all migrations and seeds the admin account.

To verify it is working, open in your browser:
```
http://localhost:5183/api/categories
```
You should see a JSON list of 6 categories.

---

### 4. Run the frontend

```bash
cd "Front End"
npm install
npm run dev
```

The app starts at `http://localhost:5173` and talks to the backend via `VITE_API_URL` in `Front End/.env`. Also set `VITE_GOOGLE_MAPS_API_KEY` there for the AI assistant's map panel; `VITE_THUMBNAIL_API_URL` can be left empty locally — the frontend falls back to the full-size S3 image if no thumbnail service is configured.

---

## Project Structure

```
Property-Management-System/
├── Back End/
│   ├── PropertyManagement.API/
│   │   ├── Controllers/        # API endpoints (Auth, Users, Properties, Requests, Claims,
│   │   │                       #   Maintenance, Categories, Upload, Assistant, Insights, Notifications)
│   │   ├── Data/                # AppDbContext + EF migrations
│   │   ├── DTOs/                # Request/response shapes
│   │   ├── Models/               # EF entity models
│   │   ├── Services/              # EmailService, GeminiAssistantService, GeminiInsightService
│   │   ├── .ebextensions/          # EB config (installs the CloudWatch agent)
│   │   ├── .platform/hooks/postdeploy/ # Starts the CloudWatch agent after each deploy
│   │   ├── appsettings.json               # Local dev config (edit connection string / Gemini key here)
│   │   └── appsettings.Production.json   # Prod config (values injected from EB env vars)
│   ├── PropertyManagement.sln
│   └── lambda/thumbnail-generator/   # S3+API Gateway thumbnail pipeline (Task 2 Part 2)
├── Front End/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layouts/        # Owner / Resident / Admin shell layouts
│   │   │   ├── lib/            # apiClient.ts + auth.ts + thumbnail.ts helpers
│   │   │   ├── pages/          # One folder per role (admin / owner / resident)
│   │   │   └── services/       # API calls per role
│   │   ├── features/assistant/ # AI chat assistant + Google Maps panel
│   │   ├── pages/assistant/    # AssistantPage
│   │   └── shared/             # Shared map/geo utilities and types
│   ├── .env                    # Frontend dev (points to localhost:5183)
│   ├── .env.production         # Frontend prod (fill in EB/CloudFront + thumbnail API URLs)
│   └── package.json
└── README.md
```

---

## API Endpoints Summary

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/forgot-password` | Public |
| POST | `/api/auth/reset-password` | Public |
| GET | `/api/users/me` | All roles |
| PUT | `/api/users/me` | All roles |
| PUT | `/api/users/me/verify-email` | All roles |
| POST | `/api/users/me/resend-verification` | All roles |
| PUT | `/api/users/me/password` | All roles |
| GET | `/api/users` | Admin |
| GET | `/api/users/{id}` | Admin |
| GET | `/api/users/residents` | Admin, Owner |
| PUT | `/api/users/{id}/toggle-active` | Admin |
| DELETE | `/api/users/{id}` | Admin |
| GET | `/api/properties` | All roles (scoped) |
| GET | `/api/properties/{id}` | All roles (scoped) |
| POST | `/api/properties` | Admin, Owner |
| PUT | `/api/properties/{id}` | Admin, Owner |
| DELETE | `/api/properties/{id}` | Admin |
| POST | `/api/properties/{id}/residents` | Admin, Owner |
| DELETE | `/api/properties/{id}/residents/{residentId}` | Admin, Owner |
| GET | `/api/requests` | All roles (scoped) |
| GET | `/api/requests/{id}` | All roles (scoped) |
| POST | `/api/requests` | Resident, Owner |
| PUT | `/api/requests/{id}/status` | Owner, Admin |
| DELETE | `/api/requests/{id}` | Admin |
| GET | `/api/claims` | All roles (scoped) |
| GET | `/api/claims/{id}` | All roles (scoped) |
| POST | `/api/claims` | Resident |
| PUT | `/api/claims/{id}/status` | Owner, Admin |
| POST | `/api/maintenance/scan-invoice` | Resident |
| GET | `/api/categories` | Public |
| POST | `/api/categories` | Admin |
| PUT | `/api/categories/{id}` | Admin |
| DELETE | `/api/categories/{id}` | Admin |
| POST | `/api/upload` | All roles |
| POST | `/api/assistant/chat` | All roles |
| POST | `/api/insights/financial` | Owner, Admin |
| GET | `/api/notifications` | All roles |
| GET | `/api/notifications/unread-count` | All roles |
| PUT | `/api/notifications/{id}/read` | All roles |
| PUT | `/api/notifications/read-all` | All roles |

---

## Deployment (AWS)

TODO:

1. **RDS** — Create MySQL db.t3.micro, note the endpoint. Add inbound rule for port `3306` from `0.0.0.0/0` in the security group.

2. **S3 bucket for photo evidence and claim invoices** — Create a bucket (e.g. `propms-evidence`) in the same region. Under Permissions, uncheck "Block all public access" and add this bucket policy so uploaded photos, generated thumbnails and invoice images are viewable (`evidence/*` for request photos, `thumbnails/*` for generated thumbnails, `claims/*` for maintenance invoice scans):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": [
         "arn:aws:s3:::propms-evidence/evidence/*",
         "arn:aws:s3:::propms-evidence/thumbnails/*",
         "arn:aws:s3:::propms-evidence/claims/*"
       ]
     }]
   }
   ```
   Then attach an inline IAM policy to the EB instance role (`aws-elasticbeanstalk-ec2-role`) allowing `s3:PutObject` on both prefixes:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "s3:PutObject",
       "Resource": [
         "arn:aws:s3:::propms-evidence/evidence/*",
         "arn:aws:s3:::propms-evidence/claims/*"
       ]
     }]
   }
   ```

3. **Elastic Beanstalk** — Publish and deploy:
   ```bash
   cd "Back End/PropertyManagement.API"
   dotnet publish -c Release -o ./publish
   # zip the publish folder and upload to EB
   ```
   Set these environment properties in EB console:
   ```
   ConnectionStrings__Default   = Server=RDS_ENDPOINT;Port=3306;Database=property_mgmt;User=admin;Password=RDS_PASS;
   Jwt__Secret                  = <any random 32+ char string>
   ASPNETCORE_ENVIRONMENT       = Production
   S3__BucketName               = propms-evidence
   S3__Region                   = ap-southeast-2
   GEMINI_API_KEY               = <your Gemini API key>
   GOOGLE_CLOUD_API_KEY         = <your Google Cloud API key>
   ```
   Attach the `CloudWatchAgentServerPolicy` managed policy to the EB instance role so the CloudWatch agent (installed via `.ebextensions/cloudwatch-agent.config` and started via `.platform/hooks/postdeploy/01_start_cwagent.sh`) can publish memory/disk metrics under the `PropMS/ElasticBeanstalk` namespace — EC2 only reports CPU by default.

4. **Thumbnail pipeline (Lambda)** — Follow `Back End/lambda/thumbnail-generator/README.md` to package and deploy the Node.js Lambda, wire the S3 `ObjectCreated` trigger on the `evidence/` prefix, and expose a `GET /thumbnail` route via API Gateway. Put the resulting invoke URL into `VITE_THUMBNAIL_API_URL`.

5. **Frontend** — Edit `Front End/.env.production`, replace the placeholders with your EB/CloudFront URL, Google Maps key and thumbnail API URL, then build:
   ```bash
   cd "Front End"
   # edit .env.production first
   npm run build
   # upload dist/ to S3
   ```

6. **CloudFront** — Point to S3 bucket. Add custom error page: `404 → /index.html (HTTP 200)` for React Router to work on page refresh.

7. **Update CORS** — Add to EB environment properties:
   ```
   AllowedOrigins__0 = https://your-cloudfront-url
   ```
