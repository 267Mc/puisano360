# Puisano360 — Setup Guide

## 1. Install the Supabase SSR package

```bash
npm install @supabase/ssr @supabase/supabase-js
```

## 2. Check your .env.local

It should already have these two lines (you said you pasted them):

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Run the SQL schema in Supabase

- Go to your Supabase project dashboard
- Click **SQL Editor** in the left sidebar
- Open the file `supabase/schema.sql` from this project
- Paste the entire contents and click **Run**

## 4. Create the Storage bucket for reports

- In Supabase, go to **Storage** → **New Bucket**
- Name it exactly: `reports`
- Check **Public bucket** → Save
- Then go to Storage → Policies → Add a policy for `reports`:
  - Allow authenticated users to INSERT and SELECT

## 5. Create Auth users for your sample data

Go to **Supabase → Authentication → Users → Add user** for each person:

| Name               | Email                    | Password (your choice) |
|--------------------|--------------------------|------------------------|
| Mr Thabo Motsamai  | thabo@puisano360.com     | (set one)              |
| Ms Joy Lame        | joy@puisano360.com       | (set one)              |
| Mrs Sarah Kebonye  | sarah@puisano360.com     | (set one)              |
| Aone Motse         | aone@puisano360.com      | (set one)              |
| Ford Sibanda       | ford@puisano360.com      | (set one)              |
| Lesedi Leepo       | lesedi@puisano360.com    | (set one)              |

After creating each user in Auth, copy their **User UID** and run this SQL
to link them to their profile rows (replace the UUIDs):

```sql
-- Example for Thabo (teacher):
UPDATE teachers SET auth_id = 'PASTE_UID_HERE' WHERE email = 'thabo@puisano360.com';

-- Example for Aone (parent):
UPDATE parents SET auth_id = 'PASTE_UID_HERE' WHERE email = 'aone@puisano360.com';
```

Repeat for all 6 users.

## 6. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## 7. Deploy to Vercel

Since you connected GitHub:
- Push all these files to your GitHub repo
- Go to your Vercel project → **Settings → Environment Variables**
- Add:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vercel will auto-deploy on every push to `main`

## File Structure

```
src/
  app/
    page.tsx                  ← Landing page
    layout.tsx                ← Root layout
    globals.css               ← All styles (green & gold theme)
    login/page.tsx            ← Login (parent or teacher)
    signup/page.tsx           ← Sign up
    parentdashboard/page.tsx  ← Full parent dashboard
    teacherdashboard/page.tsx ← Full teacher dashboard
  lib/
    supabaseClient.ts         ← Supabase browser client
  middleware.ts               ← Route protection
supabase/
  schema.sql                  ← Full DB schema + seed data
```
