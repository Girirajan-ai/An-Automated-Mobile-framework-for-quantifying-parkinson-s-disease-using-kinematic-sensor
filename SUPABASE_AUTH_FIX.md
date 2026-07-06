# Fix signup / sign-in (required in Supabase dashboard)

## “Load failed” on phone (Safari)

This usually means the app **cannot reach Supabase at all** (network/DNS), not a wrong password.

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/oypqvnjtpfrbjqxmncyf) and confirm the project **exists and is not paused**.
2. In **Project Settings → API**, copy the **Project URL** and **publishable (anon) key** into `d:\Parkinson\.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Restart the dev server: stop `npm run dev`, then run it again.
4. Reload the signup page — you should see a red banner if Supabase is still unreachable.

If the project was deleted, create a new Supabase project and update `.env` with the new URL and key, then run `supabase-setup-all.sql`.

---

Your Supabase project may also return: **"Email signups are disabled"** once connectivity works.

## Step 1 — Enable email auth

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/oypqvnjtpfrbjqxmncyf)
2. **Authentication** → **Providers** → **Email**
3. Turn **ON**:
   - Enable Email provider
   - Allow new users to sign up
4. For easier testing, turn **OFF** “Confirm email”
5. Save

## Step 2 — URL configuration

**Authentication** → **URL Configuration**

**Local dev (port 8080):**

- **Site URL:** `http://localhost:8080`
- **Redirect URLs:**
  - `http://localhost:8080/**`
  - `http://localhost:8080/auth/callback`

**Cloudflare tunnel (testing on phone):** add your tunnel URL too, e.g.:

- **Site URL:** `https://fiber-timing-twins-provider.trycloudflare.com` (use the URL from your `cloudflared` terminal)
- **Redirect URLs:**
  - `https://YOUR-TUNNEL.trycloudflare.com/**`
  - `https://YOUR-TUNNEL.trycloudflare.com/auth/callback`

The tunnel URL changes each time you restart `cloudflared` — update Supabase when it changes.

## Step 3 — Run database SQL

In **SQL Editor**, run **`supabase-fix-missing-tables.sql`** (safe, keeps existing data).

If you see **"Could not find the table in the schema"**, this script creates the missing tables including `typing_data`.

Alternatively run `supabase-setup-all.sql` for a **full reset** (deletes old test results).

## Step 4 — Restart app and test

```bash
npm run dev
```

1. Sign up with a **new** email (8+ character password)
2. You should see **“Signup successful”**
3. Sign in with the same email/password
4. Open **Profile** — name and details should appear

## If profile is still empty

**Table Editor** → `profiles` — check if a row exists for your user id.

If not, the SQL trigger may be missing; sign in again (the app now creates the profile on login).
