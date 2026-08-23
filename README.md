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

## Security — read before going live

This preserves the original prototype's shared/universal-password login
model (documented in the project report) so the app works immediately.
**Before real deployment**, replace it with per-user accounts and hashed
passwords — the report's Section 10.2 has the full checklist (real
authentication, image upload to Supabase Storage, server-side validation,
audit trail, real-time sync, backups).

Also replace the placeholder `picsum.photos` product images in `seed.py`
with real slab photography before launch.

## Deploying

Any host that runs Flask works (Render, Railway, Fly.io, a VPS with
gunicorn). Example production start command:

```bash
gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

Point `DATABASE_URL` at your Supabase Postgres instance and set a strong
`SECRET_KEY` and your own `STAFF_PASSWORDS` in the host's environment
variables (don't upload your real `.env` file anywhere public).
