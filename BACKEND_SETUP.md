# Gym Backend + Supabase Setup

This project now uses a Python backend at `http://localhost:8000` as the shared data API for the Next.js admin, client portal, and public website.

## 1. Create the Supabase table

Open your Supabase project, go to **SQL Editor**, paste the contents of `supabase_schema.sql`, and run it.

The app stores each admin-managed dataset as one JSON row in the `gym_data` table.

## 2. Environment variables

The backend reads `.env` from the project root.

Required:

```env
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Optional:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_GYM_TABLE=gym_data
PYTHON_BACKEND_PORT=8000
NEXT_PUBLIC_GYM_API_URL=http://localhost:8000
CORS_ALLOWED_ORIGIN=http://127.0.0.1:3000
```

For production, set `CORS_ALLOWED_ORIGIN` to your website domain and keep `SUPABASE_SERVICE_ROLE_KEY` only on the backend. Do not expose it to the browser.

## 3. Run locally

Start the Python API:

```bash
python backend/server.py
```

Start the Next app:

```bash
npm run dev
```

Open:

- Website: `http://127.0.0.1:3000`
- Admin: `http://127.0.0.1:3000/admin`
- Backend health: `http://127.0.0.1:8000/health`

When the admin changes memberships, trainers, blogs, clients, payments, offers, classes, or other dashboard data, the frontend saves it through the Python API into Supabase. Website visitors and client portal users refresh from the backend automatically.
