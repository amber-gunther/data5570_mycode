# FreshTrack

Kitchen inventory, expiry tracking, and saved recipes. This repo has a Django REST API (`backend/`) and an Expo app (`freshtrack/`).

## Layout

- `backend/` - Django project (`config`) and app (`api`)
- `freshtrack/` - Expo app (Create Expo Stack, next to Django, not inside it)
- `myvenv/` - local Python virtual environment (not committed)
- `requirements.txt` - pinned Python packages
- `render.yaml` - Render Blueprint (web service + Postgres)
- `FRESHTRACK.md` - product notes

## Local setup (Django)

```powershell
python -m venv myvenv
.\myvenv\Scripts\Activate.ps1
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py seed_demo
python manage.py runserver 0.0.0.0:8000
```

If PowerShell blocks `Activate.ps1`, run `.\myvenv\Scripts\activate.bat` instead.

Visit http://127.0.0.1:8000/ for the home page and http://127.0.0.1:8000/admin/ for Django admin.

## API

Django REST Framework endpoints:

- http://127.0.0.1:8000/api/pantry/
- http://127.0.0.1:8000/api/recipes/
- http://127.0.0.1:8000/api/lifespans/
- http://127.0.0.1:8000/api/users/
- http://127.0.0.1:8000/api/health/

On Render, use the same paths on https://freshtrack-4k21.onrender.com/ (for example `/api/pantry/`).

`python manage.py seed_demo` creates the demo admin/test users plus a sample Milk pantry item and Scrambled eggs recipe.

## Frontend (Expo)

Requires Node.js LTS. From the repo root:

```powershell
cd freshtrack
npm install
npm run web
```

That starts Metro and opens the app in the browser (http://localhost:8081). Press Ctrl+C in the terminal to stop it.

The app has two screens:

- **FreshTrack pantry** (`app/index.tsx`) — list pantry items and add a new one
- **Item details** (`app/details.tsx`) — quantity, storage, status, expiry, and remove

`PantryList` is a parent that renders a `PantryRow` for each item. Form fields use `useState`. The first load uses `useEffect` to fetch `/api/pantry/` from the live backend, then `dispatch` into a Redux store. If that request fails (for example CORS in the browser), it loads demo items instead. Adding and removing items update Redux on the device; they do not write back to Django yet.

## Deploy on Render

1. Push this repo to GitHub.
2. Open https://dashboard.render.com/blueprint/new?repo=https://github.com/amber-gunther/data5570_mycode
3. Apply the Blueprint. Render will create the web service and Postgres database.

Local development still uses SQLite. Render uses Postgres via `DATABASE_URL`.

The Expo app is local (`npm run web`). It is not part of the Render Blueprint.

## Accounts

Admin site: https://freshtrack-4k21.onrender.com/admin/

| Role | Username | Password |
| --- | --- | --- |
| Admin | amber-gunther | RenderRocks! |
| Test user | test_user | RenderRocks! |

These credentials are for class/demo use. Anyone with access to this GitHub repo can see them.
