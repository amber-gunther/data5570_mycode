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

Copy `.env.example` to `.env` in the repo root and set `SECRET_KEY`. Render already injects `SECRET_KEY` and `DATABASE_URL`. Do not commit `.env`.

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
copy .env.example .env
npm install
npm run web
```

That starts Metro and opens the app in the browser (http://localhost:8081). Press Ctrl+C in the terminal to stop it.

The app has bottom tabs plus detail screens:

- **Pantry** — lots sorted by expiry; use-soon banner; add a lot
- **Recipes** — saved recipes; add/edit/delete in the app
- **Shop** — pick recipes; buy list is only what you still need
- **Item details** — quantity, bought-on date, throw out vs remove, expiry
- **Recipe details** — Have/Need, **I made this**, undo last cook

`PantryList` / `PantryRow`, `RecipeList` / `RecipeRow`, and `RecipeForm` reuse the same building blocks. Redux thunks GET/POST/PUT/PATCH/DELETE `/api/pantry/` and `/api/recipes/`. PATCH is for partial quantity/status updates; PUT replaces a recipe including its ingredient lines. Empty lots and thrown-out rows drop off the active list. Cooking uses FIFO and converts units in the same family (cup/gallon, oz/lb, egg/count). Copy `freshtrack/.env.example` to `freshtrack/.env` for `EXPO_PUBLIC_API_URL`.

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
