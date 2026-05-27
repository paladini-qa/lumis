# 🔑 Environment Variables Specification: Lumis

Lumis utilizes a secure configuration model that separates public client-side parameters from private backend API keys. This document details all required environment variables, their security scopes, and how to configure them for local testing and CI/CD pipelines.

---

## 📂 1. The Root `.env.example` File
A template file named `.env.example` is located at the root of the project. To configure your local environment, copy it to a new file named `.env` (which is already configured in `.gitignore`):
```bash
cp .env.example .env
```

---

## 🛡️ 2. Environment Variables Directory

### A. Client-Side Variables (Expo Platform)
* **Scope:** Excluded from bundle compile security filters. Exposed directly to the JavaScript bundle on Mobile (iOS/Android) and Web.
* **Prefix Rule:** Must be prefixed with `EXPO_PUBLIC_` so that the Expo compiler bundles them securely.

| Key | Purpose | Example Value |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | The public API gateway URL for your Supabase project instance. | `https://your-ref.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | The public anonymous client API key used to route database requests. | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

---

### B. Server-Side Private Secrets (Supabase Edge Functions)
* **Scope:** **Backend-Only.** Never expose these to the client. These must be stored securely inside Supabase Vault / Edge Secrets.
* **How to Set in Production:**
  `supabase secrets set GEMINI_API_KEY=your-api-key`

| Key | Purpose | Secure Location |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Private key for the `@google/genai` SDK used inside the chatbot and receipt scanner edge functions. | Supabase Edge Secrets |

---

### C. DevOps & Pipeline Secrets (GitHub Actions Secrets)
* **Scope:** Kept secure in your GitHub Repository settings (`Settings > Secrets and variables > Actions`).
* **Purpose:** Allows automated CI/CD workflows to push code to GitHub Pages, execute database migrations, and compile release APKs.

| Key | Purpose | Value to Store |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_SUPABASE_URL` | Syncs variables during GitHub Pages web compilation. | Production Supabase URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Syncs variables during GitHub Pages web compilation. | Production Anon Key |
| `SUPABASE_DB_URL` | PostgreSQL connection string used by the Supabase CLI to push migrations. **Note:** Use the Connection Pooler URL in **Session Mode (Port 5432)** to support IPv4 in GitHub Actions (direct connections are IPv6-only and will fail with a 'network is unreachable' error). | `postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres` |
| `ANDROID_SIGNING_KEY` | Base64-encoded keystore file (`release-keystore.jks`) used by Gradle to sign the release APK. | Base64 string of your JKS file |

---

## 🛠️ 3. Local Development Verification

When running Lumis locally (`npm run dev` or `supabase start`), verify that:
1. Local Supabase containers run successfully (`supabase start` automatically outputs local Anon Keys and URLs).
2. Your local `.env` holds these local container variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
   ```
3. Your local Edge Functions mock private secrets using a local configuration file (`/supabase/.env.local`):
   ```env
   GEMINI_API_KEY=your-private-google-api-key
   ```
