## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | ASP.NET Core 9 Web API |
| Database | MySQL (local dev) / AWS RDS (production) |
| Auth | JWT Bearer tokens + BCrypt password hashing |
| Deployment | AWS Elastic Beanstalk (backend) + S3 + CloudFront (frontend) |

---

### Backend (ASP.NET Core 9)
- **Authentication** — Register, Login with JWT tokens, role-based access (Admin / Owner / Resident)
- **Users** — Get all users (Admin), get residents list (Owner/Admin), get/update own profile
- **Properties** — Full CRUD, owner scoping, assign/remove residents
- **Maintenance Requests** — Create, list, update status/priority/notes, role-scoped views
- **Categories** — Seeded with 6 default categories (Plumbing, Electrical, HVAC, Structural, Appliances, Pest Control)
- **EF Core migrations** — Auto-applied on startup, includes seed data
- **CORS** — Configurable via environment variables for production

### Frontend (React + TypeScript)
- All mock services replaced with real API calls
- JWT stored in localStorage, auto-redirect to login on session expiry
- Role-based routing after login (Admin / Owner / Resident dashboards)
- Profile chip in all layouts shows the logged-in user's real name
- **Owner**: Add property, Edit property, Assign/Remove residents
- **Admin**: Add property with owner selector, Edit (including reassign owner), Delete property
- All profile pages load and save real user data via API

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


### 1. Create the database

Open MySQL Workbench (or any MySQL client) and run:

```sql
CREATE DATABASE property_mgmt;
```

The app creates all tables automatically on first run — you only need to create the empty database.

---

### 2. Configure the backend

Open `backend/PropertyManagement.API/appsettings.json` and update the connection string with your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "Default": "Server=localhost;Port=3306;Database=property_mgmt;User=root;Password=YOUR_MYSQL_PASSWORD;"
  }
}
```

Leave everything else unchanged for local dev.

---

### 4. Run the backend

```bash
cd backend/PropertyManagement.API
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

## Project Structure

```
Property-Management-System/
├── backend/
│   └── PropertyManagement.API/
│       ├── Controllers/        # API endpoints (Auth, Users, Properties, Requests, Categories)
│       ├── Data/               # AppDbContext + EF migrations
│       ├── DTOs/               # Request/response shapes
│       ├── Models/             # EF entity models
│       ├── appsettings.json               # Local dev config (edit connection string here)
│       └── appsettings.Production.json   # Prod config (values injected from EB env vars)
├── src/
│   └── app/
│       ├── layouts/            # Owner / Resident / Admin shell layouts
│       ├── lib/                # apiClient.ts + auth.ts helpers
│       ├── pages/              # One folder per role (admin / owner / resident)
│       └── services/           # API calls per role
├── .env                        # Frontend dev (points to localhost:5183)
├── .env.production             # Frontend prod (fill in EB URL before running npm run build)
└── README.md
```

---

## API Endpoints Summary

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Public |
| GET | `/api/users/me` | All roles |
| PUT | `/api/users/me` | All roles |
| GET | `/api/users` | Admin |
| GET | `/api/users/residents` | Admin, Owner |
| GET | `/api/properties` | All roles (scoped) |
| POST | `/api/properties` | Admin, Owner |
| PUT | `/api/properties/{id}` | Admin, Owner |
| DELETE | `/api/properties/{id}` | Admin |
| POST | `/api/properties/{id}/residents` | Admin, Owner |
| DELETE | `/api/properties/{id}/residents/{residentId}` | Admin, Owner |
| GET | `/api/requests` | All roles (scoped) |
| POST | `/api/requests` | Resident |
| PUT | `/api/requests/{id}/status` | Admin, Owner |
| GET | `/api/categories` | Public |

---

## Deployment (AWS)

TODO:

1. **RDS** — Create MySQL db.t3.micro, note the endpoint. Add inbound rule for port `3306` from `0.0.0.0/0` in the security group.

2. **Elastic Beanstalk** — Publish and deploy:
   ```bash
   cd backend/PropertyManagement.API
   dotnet publish -c Release -o ./publish
   # zip the publish folder and upload to EB
   ```
   Set these environment properties in EB console:
   ```
   ConnectionStrings__Default   = Server=RDS_ENDPOINT;Port=3306;Database=property_mgmt;User=admin;Password=RDS_PASS;
   Jwt__Secret                  = <any random 32+ char string>
   ASPNETCORE_ENVIRONMENT       = Production
   ```

3. **Frontend** — Edit `.env.production`, replace the placeholder with your EB URL, then build:
   ```bash
   # edit .env.production first
   npm run build
   # upload dist/ to S3
   ```

4. **CloudFront** — Point to S3 bucket. Add custom error page: `404 → /index.html (HTTP 200)` for React Router to work on page refresh.

5. **Update CORS** — Add to EB environment properties:
   ```
   AllowedOrigins__0 = https://your-cloudfront-url
   ```
