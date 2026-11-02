# FreshTrack

Kitchen inventory, expiry tracking, and saved recipes. This repo has a Django REST API (`backend/`) and an Expo app (`freshtrack/`).

## Layout

- `backend/` - Django project (`config`) and app (`api`)
- `freshtrack/` - Expo app (Create Expo Stack, next to Django, not inside it)
- `myvenv/` - local Python virtual environment (not committed)
- `requirements.txt` - pinned Python packages
- `render.yaml` - Render Blueprint (web service + Postgres)
- `FRESHTRACK.md` - product notes
- `IDEAS.md` - later features; do not build these until the app talks to Django properly

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

The app has bottom tabs plus detail screens:

- **Pantry** — list pantry items and add a new one
- **Recipes** — saved recipes; open one to see Have/Need against the pantry
- **Item details** — quantity, storage, status, expiry, and remove
- **Recipe details** — notes and each ingredient compared to what you have

`PantryList` / `PantryRow` and `RecipeList` / `RecipeRow` are parent/child lists. Form fields use `useState`. Redux thunks GET `/api/pantry/` and `/api/recipes/`, POST a new pantry item, and PATCH quantities for −/+, **I made this**, and DELETE when you remove an item. If the live API is asleep or blocked, the app falls back to demo data and local Redux so the screens still work. Recipes are read-only in the app.

## Deploy on Render

1. Push this repo to GitHub.
2. Open https://dashboard.render.com/blueprint/new?repo=https://github.com/amber-gunther/data5570_mycode
3. Apply the Blueprint. Render will create the web service and Postgres database.

Local development still uses SQLite. Render uses Postgres via `DATABASE_URL`.

The Expo app can run locally (`npm run web`) or on Expo Hosting:

https://freshtrack--0hsm2k6nc2.expo.app

That preview talks to the Render API. After code changes, export and deploy again from `freshtrack`:

```powershell
npx.cmd expo export --platform web
npx.cmd eas-cli@latest deploy
```

## Accounts

Admin site: https://freshtrack-4k21.onrender.com/admin/

| Role | Username | Password |
| --- | --- | --- |
| Admin | amber-gunther | RenderRocks! |
| Test user | test_user | RenderRocks! |

These credentials are for class/demo use. Anyone with access to this GitHub repo can see them.
