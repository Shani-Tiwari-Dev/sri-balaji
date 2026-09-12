# Sri Balaji Granites & Marbles — Website

A two-sided web app for a natural-stone trading business (Bangalore yard,
Chittoor factory, Vishakapatnam export counter): a public digital catalog
customers browse and enquire from, plus a staff-only ERP for managing
stock, enquiries, announcements and reports across three yards.

Built to spec from the attached project report, using:
- **Backend:** Python Flask (REST API)
- **Database:** Supabase (Postgres) via SQLAlchemy — falls back to a local
  SQLite file automatically if `DATABASE_URL` isn't set, so it runs out of
  the box while you set up Supabase.
- **Frontend:** plain HTML / CSS / JS (no build step), styled as a
  minimalist, image-led masonry gallery per the attached design reference —
  black-on-white chrome, the stone photography supplies all the color.

## Project layout

```
backend/
  app.py                 Flask app + all /api routes
  models.py               SQLAlchemy models
  config.py                Reads .env
  seed.py                    Sample stock/announcements loader
  supabase_schema.sql          Optional manual-setup SQL reference
  utils/
    calc.py                Area / rate / currency calculation engine
    auth.py                  Staff role resolution + JWT
  requirements.txt
  .env.example
frontend/
  index.html              Public catalog (masonry grid)
  about.html               Company / yards page
  staff.html                 Staff login + ERP dashboard
  css/style.css
  js/{api,calc,catalog,admin}.js
```

## 1. Set up the database (Supabase)

1. Create a project at supabase.com.
2. In **Project Settings → Database → Connection string**, copy the URI.
3. You don't need to run any SQL by hand — the Flask app creates all
   tables automatically on first run. `backend/supabase_schema.sql` is
   provided only if you'd rather create them manually first.

## 2. Configure environment variables

```bash
cd backend
cp .env.example .env
# then edit .env: paste your DATABASE_URL, set a real SECRET_KEY, etc.
```

## 3. Install & run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

python seed.py                  # loads sample yards/slabs/announcements
python app.py                   # runs on http://localhost:5000
```

The Flask app serves the frontend too — once it's running, open
`http://localhost:5000` for the catalog, `http://localhost:5000/staff`
for the ERP login.

No separate frontend server or build step is needed; `frontend/js/api.js`
calls the API on the same origin.

## 4. Staff login

Any of the usernames below signs in with the matching role, using **any**
password from `STAFF_PASSWORDS` in your `.env` (defaults to
`Shayam@123`, `admin@123`, `pass123`, `g1@123`, `g2@123`, `g3@123`,
`123456`):

| Username(s) | Role | Sees |
|---|---|---|
| `admin`, `shayam`, `superadmin`, or anything unrecognized | Super Admin | All 3 yards |
| `manager_g1`, `bangalore`, `g1` | Manager | Bangalore Yard only |
| `manager_g2`, `chittoor`, `g2` | Manager | Chittoor Factory only |
| `manager_g3`, `vizag`, `g3` | Manager | Vishakapatnam Export only |

## Slab images (Supabase Storage)

The staff "Add/Edit Slab" form only accepts a file upload now — there's no
more free-text Image URL field. On file select, the browser uploads the
photo straight to `POST /api/uploads` (staff-only), which stores it and
returns a URL that's saved on the slab record.

Where that photo actually lands depends on your env vars:

1. **`SUPABASE_URL` + `SUPABASE_SERVICE_KEY` set (recommended, used in production)**
   The backend uploads the file to a Supabase Storage bucket over its REST
   API and returns the bucket's public URL. Set up once:
   - In your Supabase project, go to **Storage** and create a bucket (e.g.
     `slab-images`), marked **Public** (product photos don't need signed
     URLs, and this keeps page loads fast and CDN-cacheable).
   - Copy **Project Settings → API → `service_role` key** (not the `anon`
     key — the anon key is subject to Storage RLS policies and can't
     reliably write on the staff member's behalf) into `SUPABASE_SERVICE_KEY`.
     **Keep this key server-side only** — never send it to the frontend.
   - Optionally set `SUPABASE_STORAGE_BUCKET` if you named the bucket
     something other than `slab-images`.
2. **Neither set (local dev fallback)**
   Files are written to `frontend/uploads/` and served from `/uploads/...`.
   This is only for convenience while developing locally against SQLite —
   it does **not** work on Vercel (its filesystem is read-only/ephemeral
   per invocation, so uploaded files vanish on the next cold start).

Uploads are capped at 6MB and restricted to image MIME types, enforced
both client- and server-side.

### Why Supabase Storage over committing images to GitHub

You could technically store slab photos in the Git repo (e.g. a `static/`
folder) and serve them from there, but for this app Supabase Storage is
the better fit:

| | Supabase Storage | Images committed to GitHub |
|---|---|---|
| **Add/replace a photo** | Instant — staff upload from the ERP form, live immediately | Requires a `git commit` + redeploy for every single slab photo |
| **Fits the workflow** | Matches how staff actually add stock (several times a day, from a phone/tablet at the yard) | Not practical for non-developers adding stock day-to-day |
| **Storage limits** | Built for binary/media at scale; free tier alone is 1GB, scales with your Supabase plan | GitHub repos are meant for code — large binary history bloats clone/deploy times and GitHub actively discourages using it as a CDN |
| **Delivery** | Served via Supabase's CDN with cache headers, resizing options | Fine via GitHub Pages/raw URLs for a handful of static assets, but not built for this |
| **Already in your stack** | You're already using Supabase for Postgres — one dashboard, one bill, and `SUPABASE_URL`/keys are already wired into `config.py` | Adds a second system to think about for something the DB layer's neighbor already does well |
| **Deletes/replaces** | Straightforward API call, e.g. when a slab is edited or trashed | Rewriting Git history to remove an old image is messy; repo only grows over time |

**Bottom line:** commit code to GitHub, store photos in Supabase Storage
(or an equivalent object store like S3/Cloudinary/R2 if you ever move off
Supabase) — pairing "images in Git" with a daily-changing product catalog
is the wrong tool for the job, not just a style preference.

## Security — read before going live

This preserves the original prototype's shared/universal-password login
model (documented in the project report) so the app works immediately.
**Before real deployment**, replace it with per-user accounts and hashed
passwords — the report's Section 10.2 has the full checklist (real
authentication, server-side validation, audit trail, real-time sync,
backups). Image upload to Supabase Storage (also called out in that
checklist) is now implemented — see "Slab images" above.

Also replace the placeholder `picsum.photos` product images in `seed.py`
with real slab photography before launch.

## Deploying

### Option A — Render / Railway / Fly.io / a VPS (recommended)

Any host that runs Flask works. Example production start command:

```bash
gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

(Root/start directory = `backend`.) Point `DATABASE_URL` at your Supabase
Postgres instance and set a strong `SECRET_KEY` and your own
`STAFF_PASSWORDS` in the host's environment variables (don't upload your
real `.env` file anywhere public).

### Option B — Vercel

The repo includes `vercel.json` and `api/index.py`, which turn the Flask
app into a Vercel serverless function and serve the frontend files from the
same function.

1. Import the repo into Vercel (framework preset: "Other" — no build step
   needed).
2. In **Project Settings → Environment Variables**, add:
   - `DATABASE_URL` — your Supabase Postgres connection string
   - `SECRET_KEY` — a long random string
   - `STAFF_PASSWORDS` — your own comma-separated list
   - `CORS_ORIGINS` — your Vercel domain (or `*` while testing)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — required for slab photo
     uploads to work on Vercel (see "Slab images" below); without these,
     uploads silently fail to persist because Vercel's filesystem is
     ephemeral
   - `SUPABASE_STORAGE_BUCKET` — optional, defaults to `slab-images`
   - `WHATSAPP_NUMBER`, `WHATSAPP_NUMBER_SECONDARY` — optional
3. Deploy. Vercel builds `api/index.py`, which imports the same Flask app
   from `backend/app.py`, so every route (`/`, `/staff`, `/api/...`, static
   assets) is served by that one function.

Note: Vercel functions are stateless/serverless — each request may hit a
cold start and open a fresh DB connection. That's fine for light traffic
against Supabase Postgres, but if you outgrow it, Option A (a normal
long-running server) will behave more predictably and is closer to how
this app was originally built.
