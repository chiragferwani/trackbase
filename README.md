<div align="center">
  <img src="./apps/trackbase-logo.png" alt="TrackBase Logo" width="150" />
</div>

# TrackBase

**User tracking without the backend. Open-source.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![NPM Version](https://img.shields.io/npm/v/trackbase.svg)](https://www.npmjs.com/package/trackbase)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)

📊 **User tracking without the backend** — Track user signups and view analytics using **Google Sheets** as your database. No infrastructure required for your end-user data.

- **Fast Setup?** — Get started in under 5 minutes without configuring Firebase, Supabase, Auth0, or custom databases.
- **Own Your Data?** — Yes. User data goes directly to your Google Sheet. TrackBase never becomes a primary storage layer.
- **Easy API?** — Yes. Initialize the SDK and call `identify()` — rows magically appear in your sheet.
- **How it works?** — Create a project → connect a Google Sheet → get an API key → call `identify()` when users sign up → rows appear in your sheet.

## Quick Start

### 1. Set Up the Dashboard

```bash
# Clone the repo
git clone https://github.com/your-username/trackbase
cd trackbase

# Copy environment variables
cp apps/dashboard/.env.example apps/dashboard/.env.local
# Fill in your Google OAuth credentials and secrets

# Install dependencies and push the database schema
cd apps/dashboard
npm install
npm run db:push

# Start the development server
npm run dev
```

Open http://localhost:3000 and sign in with Google.

### 2. Create a Project

1. Click **New project**
2. Set a name, expected users, and the fields you want to capture (e.g. Name, Email, College, Branch)
3. Click **Create project** — save your API key (shown once!)
4. Click **Create & link Google Sheet** to create a spreadsheet

### 3. Install the SDK

```bash
npm install trackbase
```

### 4. Track Users

```typescript
import { TrackBase } from "trackbase";

const tb = new TrackBase({ apiKey: "trk_live_xxxxxxxxxxxxxxxxxxxxxxxx" });

// When a user signs up:
await tb.identify({
  name: "Alice",
  email: "alice@example.com",
  college: "MIT",
  branch: "CS"
});

// Get analytics:
const stats = await tb.analytics();
// { totalUsers: 42, todayUsers: 5, weeklyUsers: 18, lastSignup: "2026-06-15" }
```

## Monorepo Structure

```
trackbase/
├── apps/
│   └── dashboard/          # Next.js 16 app (dashboard + API)
│       ├── app/            # App Router pages and API routes
│       ├── lib/            # Prisma, Google Sheets, auth utilities
│       └── prisma/         # Schema + SQLite database
├── packages/
│   └── sdk/                # trackbase npm package
└── docker-compose.yml
```

## Environment Variables

Copy `apps/dashboard/.env.example` to `apps/dashboard/.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite path (default) or Postgres URL for production |
| `NEXTAUTH_SECRET` | Random secret for NextAuth sessions |
| `NEXTAUTH_URL` | Your app URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ENCRYPTION_SECRET` | 32-char secret for encrypting OAuth tokens at rest |

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Enable the **Google Sheets API** in your project

## API Reference

### Public SDK API (`/api/v1/*`)

All routes require `Authorization: Bearer trk_live_...` header.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/identify` | POST | Append a user row to the linked Sheet |
| `/api/v1/users/count` | GET | Get total user count |
| `/api/v1/analytics` | GET | Get full analytics (total, today, weekly, last signup) |

### Dashboard API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects` | GET, POST | List and create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | Project CRUD |
| `/api/projects/[id]/sheet` | POST | Connect Google Sheet |
| `/api/projects/[id]/apikey` | POST | Regenerate API key |
| `/api/projects/[id]/test` | POST | Test integration |
| `/api/projects/[id]/analytics` | GET | Dashboard analytics |

## Self-Hosting with Docker

```bash
# Copy and fill in your env vars
cp apps/dashboard/.env.example .env

docker-compose up -d
```

The app will be available at http://localhost:3000.

## Security

- API keys are stored as SHA-256 hashes — never in plaintext
- Google OAuth refresh tokens are encrypted at rest (AES-256)
- Rate limiting: 60 requests/minute per API key
- Payload validation: only configured fields are written to Sheets (no injection)
- CORS enabled for browser-side SDK usage

## Phase 2 Roadmap

- [ ] Duplicate prevention (check email before appending)
- [ ] Custom validation rules per field
- [ ] `<TrackBaseForm />` React component
- [ ] CSV export
- [ ] Additional storage providers (Airtable, Notion, Postgres)

## License

MIT
